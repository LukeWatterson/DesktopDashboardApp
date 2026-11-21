function updateClock() {
    const now = new Date();

    document.getElementById("clock").textContent =
        now.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit"
        });
}


async function updateWeather() {
    try {
        const response = await fetch("/api/weather");

        if (!response.ok) {
            throw new Error("Weather unavailable");
        }

        const weather = await response.json();

        document.getElementById("temperature").textContent =
            weather.temperature + "°C";

        document.getElementById("description").textContent =
            weather.description;

        document.getElementById("location").textContent =
            weather.location;

        document.getElementById("feels-like").textContent =
            "Feels like " + weather.feels_like + "°C";

        document.getElementById("wind-speed").textContent =
            weather.wind_speed + " m/s";

        document.getElementById("humidity").textContent =
            weather.humidity + "%";

        document.getElementById("rain").textContent =
            weather.rain + "mm";

        // OpenWeather returns an icon code, not an emoji.
        document.getElementById("weather-icon").src =
            `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

    } catch (error) {
        console.error("Weather error:", error);
    }
}

updateWeather()
updateClock();
setInterval(updateClock, 1000);
setInterval(updateWeather, 6000000);