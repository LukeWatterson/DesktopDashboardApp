# Raspberry Pi Dashboard

A Flask-based dashboard for a Raspberry Pi display. It shows current weather and today's upcoming Google Calendar events, and includes a second page with an interactive monthly calendar, day-by-day events, and a calendar selector when multiple calendars are available.

## Requirements

- Python 3.9 or newer
- An OpenWeather API key
- A Google account and Google Calendar API OAuth desktop credentials

## Setup

1. Clone the project and change into its directory.
2. Create and activate a virtual environment:

   ```sh
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install the project dependencies. Flask and Requests are used by the app but are not currently listed in `requirements.txt`, so install them explicitly:

   ```sh
   python -m pip install -r requirements.txt Flask requests
   ```

4. Create a `.env` file in the project root with your OpenWeather configuration:

   ```dotenv
   WEATHER_LAT=your_latitude
   WEATHER_LON=your_longitude
   WEATHER_API_KEY=your_openweather_api_key
   ```

   Use decimal latitude and longitude values for the location whose weather should be displayed.

5. Configure Google Calendar access:
   - In the Google Cloud Console, create or select a project, enable the Google Calendar API, and create an OAuth client ID for a **Desktop app**.
   - Download the OAuth client JSON and save it as `config/credentials.json` (create the `config` directory if necessary). This is the path the application expects.
   - The first calendar request opens Google's authorization flow in a browser on the machine running the app. Sign in and grant read-only calendar access. The resulting refresh/access token is saved to `config/token.json` for later requests.
   - If the OAuth consent screen is in testing mode, add the Google account you will use as a test user.

Keep `.env`, `config/credentials.json`, and `config/token.json` private. Do not commit API keys, OAuth client secrets, or authorization tokens to source control.

## Run

With the virtual environment active and configuration in place, start the development server from the project root:

```sh
python app.py
```

Open <http://127.0.0.1:5000/> on the device or another machine that can access the server. The server binds to localhost by default. The dashboard refreshes its clock every second, weather hourly, and today's upcoming events daily. Swipe left or right to switch between the dashboard and the full calendar; the full calendar opens to the current month and selects today by default.

For access from another device on your network, change the host in the `app.run` call in `app.py` to `0.0.0.0`, then open the Raspberry Pi's network address on that device. Only do this on a trusted network: the built-in Flask server is intended for local development, not public production deployment.

## Calendar behavior

- The dashboard's upcoming-events card lists events occurring today (including events already in progress), using the `Europe/London` timezone.
- The full calendar supports month navigation, selection of a date to view its events, and choosing among the account's calendars when more than one is available.
- Google Calendar access uses the `calendar.readonly` OAuth scope. Calendar data is loaded from Google when requested; credentials or authorization failures are reported in the UI/API rather than replaced with sample data.

## HTTP endpoints

- `GET /api/weather` — current weather for the configured location.
- `GET /api/calendar_api` — today's upcoming events for the account's calendars.
- `GET /api/calendars` — calendars available to the authorized Google account.
- `GET /api/calendar_full` — events for the current month on the primary calendar by default.
- `GET /api/calendar_full?year=2026&month=11&calendarId=primary` — events for a specified month and calendar. Provide `year` and `month` together; `calendarId` is optional and defaults to `primary`.

## Troubleshooting

- **Weather is unavailable:** check the three `WEATHER_*` values in `.env`, confirm the OpenWeather key is active, and verify network access.
- **Google authorization fails or credentials are missing:** confirm `config/credentials.json` exists and is a Desktop app OAuth client file, the Calendar API is enabled, and the account is permitted by the consent-screen settings. Authorization must be completed in a browser on the machine running the app.
- **Reauthorize Google Calendar:** remove `config/token.json` and make another calendar request to start authorization again. Keep the credentials file; it is needed for the OAuth flow.
- **The app cannot import Flask or Requests:** install them along with `requirements.txt` using the setup command above.