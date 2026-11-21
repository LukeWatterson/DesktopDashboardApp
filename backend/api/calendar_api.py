import os
import datetime

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


def get_calendar_events():

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

    service = build(
        "calendar",
        "v3",
        credentials=creds
    )

    now = datetime.datetime.now(
        datetime.timezone.utc
    ).isoformat()

    events = service.events().list(
        calendarId="primary",
        timeMin=now,
        maxResults=10,
        singleEvents=True,
        orderBy="startTime"
    ).execute()

    results = []

    for event in events.get("items", []):

        results.append({
            "title": event.get("summary", "Untitled"),
            "start": event["start"].get(
                "dateTime",
                event["start"].get("date")
            ),
            "location": event.get("location", "")
        })

    return results