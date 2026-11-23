
from datetime import date, datetime, time, timedelta, timezone

from flask import Flask, render_template, jsonify, request
from dotenv import load_dotenv
from backend.api.weather import get_weather
from backend.api.calendar_card import get_calendar_events
from backend.api.calendar_full import get_calendars, get_month_events

load_dotenv()

app = Flask(
    __name__,
    template_folder="frontend/templates",
    static_folder="frontend/static"
)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/weather")
def weather():
    try:
        data = get_weather()
        return jsonify(data)
    except Exception as error:
        app.logger.exception("Weather API failed")
        return jsonify({"error": "Weather unavailable"}), 500

@app.route("/api/calendar_api")
def calendar():
    try:
        events = get_calendar_events()
        return jsonify(events)
    except Exception:
        app.logger.exception("Calendar API failed")
        return jsonify({"error": "Calendar unavailable"}), 500

@app.route("/api/calendars")
def calendars():
    try:
        return jsonify({"calendars": get_calendars()})
    except Exception:
        app.logger.exception("Calendar list API failed")
        return jsonify({"error": "Calendars unavailable"}), 500

@app.route("/api/calendar_full")
def full_calendar():
    year_value = request.args.get("year")
    month_value = request.args.get("month")

    if (year_value is None) != (month_value is None):
        return jsonify({"error": "Year and month must be provided together"}), 400

    if year_value is None:
        selected_date = date.today()
        year, month = selected_date.year, selected_date.month
    else:
        if not year_value.isdigit() or not month_value.isdigit():
            return jsonify({"error": "Invalid calendar month"}), 400

        year, month = int(year_value), int(month_value)
        if not 1 <= year <= 9998 or not 1 <= month <= 12:
            return jsonify({"error": "Invalid calendar month"}), 400

    calendar_id = request.args.get("calendarId", "primary")
    if (
        not calendar_id.strip()
        or len(calendar_id) > 1024
        or any(ord(character) < 32 or ord(character) == 127 for character in calendar_id)
    ):
        return jsonify({"error": "Invalid calendar ID"}), 400

    start = datetime.combine(
        date(year, month, 1), time.min, tzinfo=timezone.utc
    ) - timedelta(days=1)
    if month == 12:
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc) + timedelta(days=1)
    else:
        end = datetime(year, month + 1, 1, tzinfo=timezone.utc) + timedelta(days=1)

    try:
        events = get_month_events(calendar_id, start, end)
        return jsonify({"events": events})
    except Exception:
        app.logger.exception("Full calendar API failed")
        return jsonify({"error": "Calendar unavailable"}), 500

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
