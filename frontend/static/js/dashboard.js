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
            throw new Error("Weather unavailable" + response.status);
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


async function updateCalendar() {
    try {
        const response = await fetch("/api/calendar_api");

        if (!response.ok) {
            throw new Error("Calendar unavailable: " + response.status);
        }

        const list = await response.json();

        console.log("Calendar events:", list);

        const calendarList = document.querySelector("#calendar-items");

        calendarList.innerHTML = "";

        for (const item of list) {
            const listItem = document.createElement("li");
            listItem.className = "event";

            listItem.textContent =
                `${item.title} - ${item.start} - ${item.location}`;

            calendarList.appendChild(listItem);
        }

        if (list.length === 0) {
            calendarList.textContent = "No upcoming events";
        }

    } catch (error) {
        console.error("Calendar error:", error);
    }
}




updateWeather()
updateClock();
updateCalendar()
setInterval(updateClock, 1000);
setInterval(updateWeather, 3600000);
setInterval(updateCalendar, 86400000);