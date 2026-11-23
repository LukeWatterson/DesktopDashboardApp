from backend.api.calendar_card import get_calendar_service


def get_calendars():
    service = get_calendar_service()
    calendars = []
    page_token = None

    while True:
        params = {"maxResults": 250}
        if page_token:
            params["pageToken"] = page_token

        response = service.calendarList().list(**params).execute()
        for calendar in response.get("items", []):
            calendar_id = calendar.get("id")
            if not calendar_id:
                continue

            calendars.append({
                "id": calendar_id,
                "summary": calendar.get("summary", "Untitled calendar"),
                "primary": bool(calendar.get("primary", False))
            })

        page_token = response.get("nextPageToken")
        if not page_token:
            break

    return calendars


def get_month_events(calendar_id, start, end):
    service = get_calendar_service()
    events = []
    page_token = None

    while True:
        params = {
            "calendarId": calendar_id,
            "timeMin": start.isoformat(),
            "timeMax": end.isoformat(),
            "maxResults": 2500,
            "singleEvents": True,
            "orderBy": "startTime"
        }
        if page_token:
            params["pageToken"] = page_token

        response = service.events().list(**params).execute()
        for event in response.get("items", []):
            event_start = event.get("start", {})
            event_end = event.get("end", {})
            start_value = event_start.get(
                "dateTime", event_start.get("date")
            )
            end_value = event_end.get(
                "dateTime", event_end.get("date")
            )
            if not start_value or not end_value:
                continue

            events.append({
                "title": event.get("summary", "Untitled"),
                "start": start_value,
                "end": end_value,
                "location": event.get("location", "")
            })

        page_token = response.get("nextPageToken")
        if not page_token:
            break

    return events