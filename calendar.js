const styles = `
body {
    margin: 0;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #1a1a1a;
}

.modal {
    display: none;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    padding-top: 60px;
}

.modal-content {
    background-color: #333;
    margin: 5% auto;
    padding: 20px;
    border-radius: 10px;
    width: 90%;
    max-width: 600px;
    position: relative;
    color: #fff;
}

.modal-content img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 20px auto;
    border-radius: 10px;
    max-height: 300px;
    object-fit: cover;
}

.close-btn {
    color: #aaa;
    font-size: 28px;
    font-weight: bold;
    position: absolute;
    top: 10px;
    right: 15px;
}

.close-btn:hover,
.close-btn:focus {
    color: #fff;
    text-decoration: none;
    cursor: pointer;
}

.nav-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: 2rem;
    color: #fff;
    cursor: pointer;
}

.nav-arrow:hover {
    color: #ff9f00;
}

#prev-event {
    left: 10px;
}

#next-event {
    right: 10px;
}

#calendar-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border: 1px solid #444;
    border-radius: 8px;
    background-color: #2a2a2a;
    color: #fff;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 600px;
    padding: 20px;
    box-sizing: border-box;
}

#calendar {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
}

#calendar div:nth-child(-n+7) {
    font-weight: bold;
    color: #888;
    text-align: center;
    padding: 10px 0;
    background-color: transparent;
}

#calendar div {
    text-align: center;
    font-size: 1.1rem;
    color: #fff;
    background-color: #444;
    border-radius: 5px;
    padding: 15px 0;
    cursor: pointer;
}

#calendar div:hover {
    background-color: #555;
}

#calendar div.empty {
    background-color: transparent;
    pointer-events: none;
}

#calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    color: #fff;
}

.nav-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #fff;
    cursor: pointer;
}

.nav-btn:hover {
    color: #ff9f00;
}

#calendar-month-year {
    flex-grow: 1;
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
}
`;

const lightThemeStyles = `
    body {
        background-color: #f4f4f4;
    }
    .modal-content {
        background-color: #fff;
        color: #000;
    }
    .close-btn {
        color: #000;
    }
    .nav-arrow {
        color: #000;
    }
    #calendar-container {
        border-color: #ccc;
        background-color: #fff;
        color: #000;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    }
    #calendar div {
        background-color: #e0e0e0;
        color: #000;
    }
    #calendar div:hover {
        background-color: #d0d0d0;
    }
    #calendar div:nth-child(-n+7) {
        color: #555;
    }
    .nav-btn {
        color: #000;
    }
    .nav-btn:hover {
        color: #333;
    }
    #calendar-month-year {
        color: #000;
    }
    #theme-toggle {
        background-color: #f0f0f0;
        color: #333;
    }
`;

const darkThemeStyles = `
    body {
        background-color: #1a1a1a;
    }
    .modal-content {
        background-color: #333;
        color: #fff;
    }
    .close-btn {
        color: #aaa;
    }
    .nav-arrow {
        color: #fff;
    }
    #calendar-container {
        border-color: #444;
        background-color: #2a2a2a;
        color: #fff;
    }
    #calendar div {
        background-color: #444;
        color: #fff;
    }
    #calendar div:hover {
        background-color: #555;
    }
    #calendar div:nth-child(-n+7) {
        color: #888;
    }
    .nav-btn {
        color: #fff;
    }
    .nav-btn:hover {
        color: #ff9f00;
    }
    #theme-toggle {
        background-color: #444;
        color: #fff;
    }
`;

const themeToggleHtml = `
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <button id="theme-toggle" style="
        position: fixed;
        top: 10px;
        right: 10px;
        padding: 10px 15px;
        background-color: #444;
        color: #fff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
    ">
        <i id="theme-icon" class="fas fa-sun"></i>
    </button>
`;

window.onload = () => {
    document.body.innerHTML += themeToggleHtml;

    let isDarkTheme = true;

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles + darkThemeStyles;
    document.head.appendChild(styleSheet);

    const applyTheme = () => {
        styleSheet.innerText = isDarkTheme ? styles + darkThemeStyles : styles + lightThemeStyles;

        const themeToggleButton = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');

        if (isDarkTheme) {
            themeToggleButton.style.backgroundColor = '#f0f0f0';
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            themeIcon.style.color = '#ff9f00';
        } else {
            themeToggleButton.style.backgroundColor = '#444';
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            themeIcon.style.color = '#fff';
        }
    };

    document.getElementById('theme-toggle').addEventListener('click', () => {
        isDarkTheme = !isDarkTheme;
        applyTheme();
    });

    applyTheme();
};

    document.body.addEventListener('click', (event) => {

        if (event.target && event.target.classList.contains('close-btn')) {
            document.getElementById('event-modal').style.display = 'none';
        }

        if (event.target && event.target.id === 'prev-month') {
            if (currentMonth === 0) {
                currentMonth = 11;
                currentYear--;
            } else {
                currentMonth--;
            }
            updateCalendar();
        }

        if (event.target && event.target.id === 'next-month') {
            if (currentMonth === 11) {
                currentMonth = 0;
                currentYear++;
            } else {
                currentMonth++;
            }
            updateCalendar();
        }

        if (event.target && event.target.classList.contains('nav-arrow')) {
            const dayEvents = events.find(e => e.date === event.target.closest('.modal-content').dataset.date)?.events || [];
            const index = event.target.id === 'prev-event' ? (currentEventIndex - 1 + dayEvents.length) % dayEvents.length : (currentEventIndex + 1) % dayEvents.length;
            currentEventIndex = index;
            showEvent(dayEvents, currentEventIndex);
        }
    });

const calendarHtml = `
    <div id="calendar-container">
        <div id="calendar-header">
            <button class="nav-btn" id="prev-month">&#9664;</button>
            <span id="calendar-month-year"></span>
            <button class="nav-btn" id="next-month">&#9654;</button>
        </div>
        <div id="calendar"></div>
    </div>
    <div id="event-modal" class="modal">
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h2 id="event-title"></h2>
            <img id="event-image" src="" alt="Event Image" />
            <p id="event-details"></p>
            <span class="nav-arrow" id="prev-event">&#9664;</span>
            <span class="nav-arrow" id="next-event">&#9654;</span>
        </div>
    </div>
`;

document.body.innerHTML += calendarHtml;

let events = [];
let currentEventIndex = 0;

fetch('events.json')
    .then(response => response.json())
    .then(data => {
        events = data;
        updateCalendar();
    })
    .catch(error => console.error('Error loading events:', error));

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function updateCalendarHeader() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    document.getElementById('calendar-month-year').textContent = `${months[currentMonth]} ${currentYear}`;
}

function generateCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startDay = firstDay.getDay();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        calendar.appendChild(dayElement);
    });
    for (let i = 0; i < startDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('empty');
        calendar.appendChild(emptyDiv);
    }
    for (let i = 1; i <= lastDate; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.textContent = i;
        dayDiv.classList.add('calendar-day');
        const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        dayDiv.dataset.date = formattedDate;
        if (events.some(event => event.date === formattedDate)) {
            dayDiv.style.backgroundColor = '#f5a623';
        }
        dayDiv.addEventListener('click', openModal);
        calendar.appendChild(dayDiv);
    }
}

function openModal(event) {
    const selectedDate = event.target.dataset.date;
    const dayEvents = events.find(e => e.date === selectedDate)?.events || [];
    if (dayEvents.length > 0) {
        currentEventIndex = 0;
        showEvent(dayEvents, currentEventIndex);
        document.getElementById('event-modal').style.display = 'block';
        document.getElementById('prev-event').style.display = dayEvents.length > 1 ? 'block' : 'none';
        document.getElementById('next-event').style.display = dayEvents.length > 1 ? 'block' : 'none';
    }
}

function showEvent(dayEvents, index) {

    if (!dayEvents || dayEvents.length === 0) {
        console.warn("No events available.");
        return;
    }

    if (index < 0 || index >= dayEvents.length) {
        console.warn("Index out of bounds, resetting to first event.");
        index = 0;
    }

    const eventDetails = dayEvents[index];

    if (!eventDetails) {
        console.warn("Event details are missing for index: " + index);
        return;
    }

    document.getElementById('event-title').textContent = eventDetails.title || "No Title Available";
    document.getElementById('event-image').src = eventDetails.image || "default-image.jpg";
    document.getElementById('event-details').textContent = eventDetails.details || "No details available";

    document.getElementById('prev-event').onclick = () => {
        const prevIndex = (index - 1 + dayEvents.length) % dayEvents.length;
        showEvent(dayEvents, prevIndex);
    };
    document.getElementById('next-event').onclick = () => {
        const nextIndex = (index + 1) % dayEvents.length;
        showEvent(dayEvents, nextIndex);
    };
}

function updateCalendar() {
    updateCalendarHeader();
    generateCalendar();
}

document.querySelector('.close-btn').addEventListener('click', () => {
    document.getElementById('event-modal').style.display = 'none';
});

document.getElementById('prev-month').addEventListener('click', () => {
    if (currentMonth === 0) {
        currentMonth = 11;
        currentYear--;
    } else {
        currentMonth--;
    }
    updateCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    if (currentMonth === 11) {
        currentMonth = 0;
        currentYear++;
    } else {
        currentMonth++;
    }
    updateCalendar();
});
