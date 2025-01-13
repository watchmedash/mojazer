const events = [
    { date: '2025-01-15', title: 'Event 1', image: 'https://via.placeholder.com/600x300?text=Event+1', details: 'This is the first event.' },
    { date: '2025-01-20', title: 'Event 2', image: 'https://via.placeholder.com/600x300?text=Event+2', details: 'Details of the second event.' },
];

function generateCalendar() {
    const calendar = document.getElementById('calendar');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startDay = firstDay.getDay();

    calendar.innerHTML = '';

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        calendar.appendChild(dayElement);
    });

    for (let i = 0; i < startDay; i++) {
        const emptyDiv = document.createElement('div');
        calendar.appendChild(emptyDiv);
    }

    for (let i = 1; i <= lastDate; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.textContent = i;
        dayDiv.classList.add('calendar-day');
        dayDiv.dataset.date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

        if (events.some(event => event.date === dayDiv.dataset.date)) {
            dayDiv.style.backgroundColor = '#f5a623';
        }

        dayDiv.addEventListener('click', openModal);
        calendar.appendChild(dayDiv);
    }
}

function openModal(event) {
    const selectedDate = event.target.dataset.date;
    const eventDetails = events.find(event => event.date === selectedDate);

    if (eventDetails) {
        document.getElementById('event-title').textContent = eventDetails.title;
        document.getElementById('event-image').src = eventDetails.image;
        document.getElementById('event-details').textContent = eventDetails.details;

        document.getElementById('event-modal').style.display = 'block';
    }
}

document.querySelector('.close-btn').addEventListener('click', () => {
    document.getElementById('event-modal').style.display = 'none';
});

generateCalendar();
