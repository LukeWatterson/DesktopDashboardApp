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
        const calendarList = document.querySelector("#calendar-items");
        calendarList.replaceChildren();

        for (const item of list) {
            const listItem = document.createElement("li");
            listItem.className = "event";

            const time = document.createElement("time");
            time.className = "event-time";
            time.textContent = formatUpcomingEventTime(item.start);
            if (typeof item.start === "string") {
                time.dateTime = item.start;
            }
            listItem.appendChild(time);

            const details = document.createElement("div");
            details.className = "event-details";

            const title = document.createElement("strong");
            title.className = "event-title";
            title.textContent = typeof item.title === "string" && item.title.trim()
                ? item.title
                : "Untitled event";
            details.appendChild(title);

            if (typeof item.location === "string" && item.location.trim()) {
                const location = document.createElement("span");
                location.className = "event-location";
                location.textContent = item.location;
                details.appendChild(location);
            }

            listItem.appendChild(details);
            calendarList.appendChild(listItem);
        }

        if (list.length === 0) {
            const emptyMessage = document.createElement("li");
            emptyMessage.className = "calendar-empty";
            emptyMessage.textContent = "No upcoming events";
            calendarList.appendChild(emptyMessage);
        }

    } catch (error) {
        console.error("Calendar error:", error);
        const calendarList = document.querySelector("#calendar-items");
        const errorMessage = document.createElement("li");
        errorMessage.className = "calendar-empty";
        errorMessage.textContent = "Upcoming events are unavailable.";
        calendarList.replaceChildren(errorMessage);
    }
}


function formatUpcomingEventTime(value) {
    if (typeof value !== "string" || !value) {
        return "Date/time unavailable";
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        if (
            date.getFullYear() !== year
            || date.getMonth() !== month - 1
            || date.getDate() !== day
        ) {
            return "Date/time unavailable";
        }

        return `All day · ${date.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric"
        })}`;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Date/time unavailable";
    }

    return date.toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}




updateWeather()
updateClock();
updateCalendar()
setInterval(updateClock, 1000);
setInterval(updateWeather, 3600000);
setInterval(updateCalendar, 86400000);