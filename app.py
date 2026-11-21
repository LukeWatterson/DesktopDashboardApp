
from flask import Flask, render_template, jsonify
from dotenv import load_dotenv
from backend.api.weather import get_weather

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

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
