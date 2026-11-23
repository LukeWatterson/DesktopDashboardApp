
const dashboardPage = document.getElementById("dashboard-page");
const calendarPage = document.getElementById("calendar-page");

let startX = 0;
let startY = 0;
let isDragging = false;

function showPage(page) {
    dashboardPage.classList.remove("active");
    calendarPage.classList.remove("active");

    page.classList.add("active");
}

document.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button, a")) return;

    startX = event.clientX;
    startY = event.clientY;
    isDragging = true;
});

document.addEventListener("pointerup", (event) => {
    if (!isDragging) return;

    isDragging = false;

    const differenceX = event.clientX - startX;
    const differenceY = event.clientY - startY;

    if (Math.abs(differenceX) < 65) return;
    if (Math.abs(differenceX) < Math.abs(differenceY)) return;

    if (differenceX < 0) {
        showPage(calendarPage);
    } else {
        showPage(dashboardPage);
    }
});

document.addEventListener("pointercancel", () => {
    isDragging = false;
});
