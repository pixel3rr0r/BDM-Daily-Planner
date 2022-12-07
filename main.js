console.log("%cMade with ❤️ for the BDM community", "color: cyan;font-size:1.5em")

var timerDaily = document.getElementById("timerDaily");
var timerWeekly = document.getElementById("timerWeekly");
var timetable = document.getElementById("timetable");
var wbtable = document.getElementById("wbtable")
var dailyCheckboxes = document.querySelectorAll(".checkboxDaily")
var weeklyCheckboxes = document.querySelectorAll(".checkboxWeekly")

events = {
    // Starting at Sunday
    0: [
        { name: "Atumach Skirmish", hour: 18 },
        { name: "Atumach Skirmish", hour: 21 }
    ],
    1: [
        { name: "Black Sun", hour: 18 }
    ],
    2: [
        { name: "Maintenance", hour: 9 }
    ],
    3: [
        { name: "Atumach Skirmish", hour: 18 },
        { name: "Co-op Rush: Offin", hour: 12 },
        { name: "Co-op Rush: Offin", hour: 19 },
        { name: "Atumach Skirmish", hour: 21 }
    ],
    4: [],
    5: [
        { name: "Black Sun", hour: 21 }
    ],
    6: [
        { name: "Co-op Rush: Offin", hour: 12 },
        { name: "Co-op Rush: Offin", hour: 19 }
    ],
}

wbs = [
    { name: "Tukar Laytenn", day: 1, hours: [20] },
    { name: "Kutum", day: 3, hours: [12, 20] },
    { name: "Ahib's Griffon", day: 5, hours: [20] },
    { name: "Khan", day: 6, hours: [12, 20] },
    { name: "Muraka", day: 0, hours: [20] }
]

function $(selector) {
    return document.querySelector(selector);
}

function parseTime(seconds) {
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);

    return [s, m, h, d]
}

function timeString(timeData) {
    s = ""
    if (timeData[3] != 0)
        s += timeData[3] + "d "

    if (timeData[2] != 0)
        s += timeData[2] + "h "

    if (timeData[3] == 0 && timeData[1] != 0)
        s += timeData[1] + "m "

    if (timeData[3] == 0 && timeData[0] != 0)
        s += timeData[0] + "s "

    return s
}

function nextDay(weekday, hour) {
    var now = getCurrentServerTime()
    var result = new Date(
                 now.getFullYear(),
                 now.getMonth(),
                 now.getDate() + (7 + weekday - now.getDay()) % 7,
                 hour,
                 0);
    if (result < now)
        result.setDate(result.getDate() + 7)
    return result;
}

function getCurrentServerTime() {
    t = new Date().toLocaleString("en-US", {timeZone: "Europe/Paris"})
    return new Date(t)
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

$("#darkmode").addEventListener("click", (e) => {
    document.body.classList.toggle("dark")
})

wbs.forEach(wb => {
    possibleSpawn = []
    wb["hours"].forEach(hour => {
        var nextSpawn = nextDay(wb["day"], hour)
        possibleSpawn.push(nextSpawn)
    })

    let closest = Infinity;
    now = getCurrentServerTime();
    possibleSpawn.forEach(date => {
        const d = new Date(date);
        if (d >= now && (d < new Date(closest) || d < closest))
            closest = d;
    })
    wb["nextSpawn"] = closest
})

function createWbTable() {
    wbs.sort((a, b) => a["nextSpawn"] - b["nextSpawn"])
    wbs.forEach(wb => {
        possibleSpawn = []
        wb["hours"].forEach(hour => {
            var nextSpawn = nextDay(wb["day"], hour)
            possibleSpawn.push(nextSpawn)
        })

        let closest = Infinity;
        now = getCurrentServerTime();
        possibleSpawn.forEach(date => {
            const d = new Date(date);
            if (d >= now && (d < new Date(closest) || d < closest))
                closest = d;
        })
        wb["nextSpawn"] = closest

        // Create elements
        wbTimer = document.createElement('span');
        wbTimer.classList.add("eventTimer");
        wbTimer.innerHTML = timeString(parseTime((wb["nextSpawn"] - now) / 1000))
        wbName = document.createElement("span");
        wbName.innerHTML = wb["name"];
        if ((wb["nextSpawn"] - now) / 1000 < 60 * 60 * 24) {
            wbTimer.style.color = "#fff"
            wbName.style.color = "#fff"
        }

        wbtable.appendChild(wbTimer);
        wbtable.appendChild(wbName)
    })
}

function createTimeTable() {
    var today = getCurrentServerTime();
    eventsToday = events[today.getDay()]
    eventsToday.sort((a, b) => a["hour"] - b["hour"])

    for (const key in eventsToday) {
        if (Object.hasOwnProperty.call(eventsToday, key)) {
            const event = eventsToday[key];
            const d = new Date();
            d.setHours(event["hour"], 0, 0, 0)

            // Create elements
            eventTimer = document.createElement('span');
            eventTimer.classList.add("eventTimer");
            eventTimer.innerHTML = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            eventName = document.createElement("span");
            eventName.innerHTML = event["name"];

            timetable.appendChild(eventTimer);
            timetable.appendChild(eventName)

            eventsToday[key]["timer"] = eventTimer
            eventsToday[key]["time"] = d
        }
    }
}

function countdown(time, element) {
    var now = getCurrentServerTime();

    var diff = parseTime((time - now) / 1000)

    return diff
}

createTimeTable()
createWbTable()

lastWeekday = new Date().getDay();

setInterval(function () {
    var now = getCurrentServerTime();
    var tomorrow = getCurrentServerTime();
    var endofweek = getCurrentServerTime();

    tomorrow.setHours(24, 0, 0, 0);
    endofweek.setDate(endofweek.getDate() + ((7 - endofweek.getDay()) % 7 + 1) % 7);
    endofweek.setHours(0, 0, 0, 0);

    endofweek = nextDay(0, 0)

    let times = parseTime((endofweek - now) / 1000);
    timerWeekly.innerHTML = times[3] > 0 ? "Time left: " + times[3] + " days" + (times[2] != 0 ? ", " + times[2] + "h" : "") : "Time left: " + times[2] + ":" + times[1] + ":" + times[0]


    var diffMS = tomorrow.getTime() / 1000 - now.getTime() / 1000;
    var diffHr = Math.floor(diffMS / 3600);
    diffMS = diffMS - diffHr * 3600;
    var diffMi = Math.floor(diffMS / 60);
    diffMS = diffMS - diffMi * 60;
    var diffS = Math.floor(diffMS);

    var result = ((diffHr < 10) ? "0" + diffHr : diffHr);
    result += ":" + ((diffMi < 10) ? "0" + diffMi : diffMi);
    result += ":" + ((diffS < 10) ? "0" + diffS : diffS);

    timerDaily.innerHTML = "Time left: " + result;

    // New day
    if (lastWeekday != now.getDay()) {
        while (timetable.lastChild) {
            timetable.removeChild(timetable.lastChild)
        }
        createTimeTable()

        dailyCheckboxes.forEach(e => {
            e.checked = false;
        })

        lastWeekday = now.getDay()
    }

    if ((wbs.some(w => (w["nextSpawn"] - now) / 1000 >= 60 * 60 * 24) && now.getMinutes() == 0 && now.getSeconds() == 0) || (wbs.some(w => (w["nextSpawn"] - now) / 1000 < 60 * 60 * 24))) {

        while (wbtable.lastChild) {
            wbtable.removeChild(wbtable.lastChild)
        }

        createWbTable()
    }

}, 1000);