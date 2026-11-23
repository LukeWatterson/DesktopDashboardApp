import os
from datetime import datetime, timedelta
import threading
from zoneinfo import ZoneInfo

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = [
    "https://www.googleapis.com/auth/calendar.readonly"
]

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))
    )
)

CREDENTIALS = os.path.join(
    BASE_DIR, "config", "credentials.json"
)

TOKEN = os.path.join(
    BASE_DIR, "config", "token.json"
)

_CREDENTIAL_LOCK = threading.Lock()


def get_calendar_service():
    with _CREDENTIAL_LOCK:
        creds = None

        if os.path.exists(TOKEN):
            creds = Credentials.from_authorized_user_file(
                TOKEN, SCOPES
            )

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    CREDENTIALS, SCOPES
                )
                creds = flow.run_local_server(port=0)

            with open(TOKEN, "w") as token:
                token.write(creds.to_json())

        return build(
            "calendar",
            "v3",
            credentials=creds
        )

def get_calendars(service):
    calendars = []
    page_token = None

    while True:
        response = service.calendarList().list(
            pageToken=page_token
        ).execute()

        calendars.extend(response.get("items", []))

        page_token = response.get("nextPageToken")
        if not page_token:
            break

    return calendars

def get_upcoming_events(service, calendars, limit=10):
    all_events = []

    # Use the user's local timezone
    timezone = ZoneInfo("Europe/London")

    today = datetime.now(timezone).date()

    start_of_day = datetime.combine(
        today, time.min, tzinfo=timezone
    )

    start_of_tomorrow = datetime.combine(
        today + timedelta(days=1), time.min, tzinfo=timezone
    )

    for calendar in calendars:
        response = service.events().list(
            calendarId=calendar["id"],
            timeMin=start_of_day.isoformat(),
            timeMax=start_of_tomorrow.isoformat(),
            maxResults=limit,
            singleEvents=True,
            orderBy="startTime"
        ).execute()

        for event in response.get("items", []):
            if event.get("status") == "cancelled":
                continue

            event["calendarId"] = calendar["id"]
            event["calendarName"] = calendar.get("summary")

            all_events.append(event)

    return all_events

from datetime import datetime, date, time, timezone

def get_event_start(event):
    start = event["start"]

    if "dateTime" in start:
        return datetime.fromisoformat(
            start["dateTime"].replace("Z", "+00:00")
        )

    # All-day events
    return datetime.combine(
        date.fromisoformat(start["date"]),
        time.min,
        tzinfo=timezone.utc
    )


def get_nearest_events(service, limit=10):
    calendars = get_calendars(service)

    events = get_upcoming_events(
        service,
        calendars,
        limit=limit
    )

    events.sort(key=get_event_start)

    return events[:limit]

def get_calendar_events():
    service = get_calendar_service()

    events = get_nearest_events(service)

    results = []

    for event in events:
        results.append({
            "title": event.get("summary", "Untitled"),
            "start": get_event_start(event),
            "location": event.get("location", "")
        })

    return results