(function () {
    const calendarSelector = document.getElementById("calendar-selector");
    const calendarSelect = document.getElementById("calendar-select");
    const calendarHeading = document.getElementById("calendar-month-heading");
    const calendarGrid = document.getElementById("calendar-grid");
    const calendarStatus = document.getElementById("calendar-status");
    const calendarDate = document.getElementById("calendar-date");
    const selectedDayHeading = document.getElementById("selected-day-heading");
    const selectedDayEvents = document.getElementById("selected-day-events");

    const today = new Date();
    let currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    let selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let selectedCalendar = "primary";
    let events = [];
    let eventsLoaded = false;
    let loadError = "";
    let requestNumber = 0;

    function dateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }

    function getEventDate(event, key) {
        const value = event[key];
        if (!value) return null;

        if (!value.includes("T")) {
            return { allDay: true, value };
        }

        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return null;
        return { allDay: false, value: parsed };
    }

    function eventsOnDate(date) {
        const key = dateKey(date);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const nextDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

        return events.filter((event) => {
            const start = getEventDate(event, "start");
            const end = getEventDate(event, "end");
            if (!start || !end) return false;

            if (start.allDay && end.allDay) {
                return start.value <= key && key < end.value;
            }

            if (!start.allDay && !end.allDay) {
                return start.value < nextDay && end.value > dayStart;
            }

            return false;
        });
    }

    function renderCalendar() {
        calendarHeading.textContent = currentMonth.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric"
        });
        calendarGrid.setAttribute("aria-label", `Days of ${calendarHeading.textContent}`);
        calendarGrid.replaceChildren();

        const firstWeekday = new Date(
            currentMonth.getFullYear(), currentMonth.getMonth(), 1
        ).getDay();
        const daysInMonth = new Date(
            currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0
        ).getDate();
        const numberOfCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
        const gridStart = new Date(
            currentMonth.getFullYear(), currentMonth.getMonth(), 1 - firstWeekday
        );

        for (let index = 0; index < numberOfCells; index += 1) {
            const day = new Date(
                gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index
            );
            const key = dateKey(day);
            const dayEvents = eventsOnDate(day);
            const button = document.createElement("button");
            button.type = "button";
            button.className = "calendar-day";
            button.dataset.date = key;
            button.setAttribute("aria-pressed", String(key === dateKey(selectedDate)));
            button.setAttribute(
                "aria-label",
                `${day.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                })}${dayEvents.length ? `, ${dayEvents.length} event${dayEvents.length === 1 ? "" : "s"}` : ""}`
            );

            if (day.getMonth() !== currentMonth.getMonth()) {
                button.classList.add("outside-month");
            }
            if (key === dateKey(selectedDate)) {
                button.classList.add("selected-day");
            }
            if (key === dateKey(today)) {
                button.classList.add("today");
            }

            const dayNumber = document.createElement("span");
            dayNumber.className = "calendar-day-number";
            dayNumber.textContent = String(day.getDate());
            button.appendChild(dayNumber);

            if (dayEvents.length) {
                const eventMarker = document.createElement("span");
                eventMarker.className = "calendar-event-marker";
                eventMarker.setAttribute("aria-hidden", "true");
                button.appendChild(eventMarker);
            }

            button.addEventListener("click", () => {
                selectedDate = new Date(day.getFullYear(), day.getMonth(), day.getDate());
                if (day.getMonth() !== currentMonth.getMonth()) {
                    currentMonth = new Date(day.getFullYear(), day.getMonth(), 1);
                    loadMonth();
                } else {
                    renderCalendar();
                    renderSelectedDay();
                }
            });
            calendarGrid.appendChild(button);
        }
    }

    function formatEventTime(event) {
        const start = getEventDate(event, "start");
        if (!start) return "";
        if (start.allDay) return "All day";

        return start.value.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function renderSelectedDay() {
        selectedDayHeading.textContent = selectedDate.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        });
        calendarDate.textContent = selectedDayHeading.textContent;
        selectedDayEvents.replaceChildren();

        if (!eventsLoaded) {
            selectedDayEvents.textContent = "Loading events…";
            return;
        }
        if (loadError) {
            selectedDayEvents.textContent = loadError;
            return;
        }

        const dayEvents = eventsOnDate(selectedDate);
        if (!dayEvents.length) {
            selectedDayEvents.textContent = "No events for this day.";
            return;
        }

        for (const event of dayEvents) {
            const item = document.createElement("li");
            item.className = "selected-day-event";

            const time = document.createElement("span");
            time.className = "selected-day-event-time";
            time.textContent = formatEventTime(event);
            item.appendChild(time);

            const details = document.createElement("div");
            const title = document.createElement("strong");
            title.textContent = event.title || "Untitled";
            details.appendChild(title);

            if (event.location) {
                const location = document.createElement("span");
                location.className = "selected-day-event-location";
                location.textContent = event.location;
                details.appendChild(location);
            }

            item.appendChild(details);
            selectedDayEvents.appendChild(item);
        }
    }

    async function loadMonth() {
        const currentRequest = ++requestNumber;
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;
        const params = new URLSearchParams({
            year: String(year),
            month: String(month),
            calendarId: selectedCalendar
        });

        events = [];
        eventsLoaded = false;
        loadError = "";
        calendarStatus.textContent = "Loading events…";
        renderCalendar();
        renderSelectedDay();

        try {
            const response = await fetch(`/api/calendar_full?${params}`);
            if (!response.ok) {
                throw new Error("Unable to load calendar events.");
            }

            const result = await response.json();
            if (currentRequest !== requestNumber) return;

            events = Array.isArray(result.events) ? result.events : [];
            eventsLoaded = true;
            calendarStatus.textContent = "";
            renderCalendar();
            renderSelectedDay();
        } catch (error) {
            if (currentRequest !== requestNumber) return;
            eventsLoaded = true;
            loadError = "Events could not be loaded.";
            calendarStatus.textContent = loadError;
            renderCalendar();
            renderSelectedDay();
        }
    }

    async function loadCalendars() {
        try {
            const response = await fetch("/api/calendars");
            if (!response.ok) {
                throw new Error("Unable to load calendars.");
            }

            const result = await response.json();
            const calendars = Array.isArray(result.calendars) ? result.calendars : [];
            calendarSelect.replaceChildren();

            for (const calendar of calendars) {
                const option = document.createElement("option");
                option.value = calendar.id;
                option.textContent = calendar.summary || calendar.id;
                calendarSelect.appendChild(option);
            }

            if (calendars.length) {
                const primaryCalendar = calendars.find((calendar) => calendar.primary);
                selectedCalendar = (primaryCalendar || calendars[0]).id;
                calendarSelect.value = selectedCalendar;
            }
            calendarSelector.hidden = calendars.length < 2;
        } catch (error) {
            calendarSelector.hidden = true;
        }
    }

    document.getElementById("calendar-previous").addEventListener("click", () => {
        const targetMonth = new Date(
            currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1
        );
        const day = Math.min(
            selectedDate.getDate(),
            new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate()
        );
        currentMonth = targetMonth;
        selectedDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), day);
        loadMonth();
    });

    document.getElementById("calendar-next").addEventListener("click", () => {
        const targetMonth = new Date(
            currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1
        );
        const day = Math.min(
            selectedDate.getDate(),
            new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate()
        );
        currentMonth = targetMonth;
        selectedDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), day);
        loadMonth();
    });

    calendarSelect.addEventListener("change", () => {
        selectedCalendar = calendarSelect.value;
        loadMonth();
    });

    renderCalendar();
    renderSelectedDay();
    loadCalendars().then(loadMonth);
})();