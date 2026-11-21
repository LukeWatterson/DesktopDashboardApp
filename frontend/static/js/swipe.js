let startX = 0;
let startY = 0;

const SWIPE_THRESHOLD = 70;

document.addEventListener("pointerdown", (event) => {

    startX = event.clientX;
    startY = event.clientY;

});

document.addEventListener("pointerup", (event) => {

    const diffX = event.clientX - startX;
    const diffY = event.clientY - startY;

    // Ignore vertical movement
    if (Math.abs(diffY) > Math.abs(diffX)) {
        return;
    }

    if (diffX > SWIPE_THRESHOLD) {

        showCalendar();

    } else if (diffX < -SWIPE_THRESHOLD) {

        showDashboard();

    }

});

function showCalendar() {

    document.getElementById("dashboard")
        .classList.add("hidden");

    document.getElementById("calendar")
        .classList.remove("hidden");

}

function showDashboard() {

    document.getElementById("calendar")
        .classList.add("hidden");

    document.getElementById("dashboard")
        .classList.remove("hidden");

}