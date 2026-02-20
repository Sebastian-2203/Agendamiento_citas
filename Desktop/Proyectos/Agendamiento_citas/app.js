// Mock Data / State
const state = {
    currentUser: null, // 'teacher' | 'psychologist' | null
    slots: [], // Citas serán dinámicas ahora
    bookings: [], // Almacenar reservas { id, date, time, bookedBy, reason }
    selectedDate: null, // Fecha seleccionada YYYY-MM-DD
    selectedSlot: null,
    calendar: {
        year: 2026,
        month: 1 // Febrero (0-indexed)
    }
};

// Horarios de Lunes a Viernes excluyendo almuerzo (1:00 PM - 2:00 PM)
const dailySchedule = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM'
];

const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// DOM Elements
const views = {
    login: document.getElementById('login-view'),
    teacher: document.getElementById('teacher-view'),
    psych: document.getElementById('psych-view')
};

const navMenu = document.getElementById('nav-menu');
const userDisplay = document.getElementById('user-display');
const logoutBtn = document.getElementById('logout-btn');

// Login Elements
const loginSelection = document.getElementById('login-selection');
const psychLoginForm = document.getElementById('psych-login-form');
const showPsychLoginBtn = document.getElementById('show-psych-login-btn');
const backToSelectionBtn = document.getElementById('back-to-selection-btn');
const loginErrorMsg = document.getElementById('login-error-msg');

// Calendar Elements
const calendarHeaderDisplay = document.getElementById('current-month-display');
const calendarDaysGrid = document.getElementById('calendar-days');
const prevMonthBtn = document.getElementById('prev-month-btn');
const nextMonthBtn = document.getElementById('next-month-btn');
const slotsContainer = document.getElementById('slots-container');
const selectedDateDisplay = document.getElementById('selected-date-display');
const calendarGrid = document.getElementById('calendar-grid');

const scheduleList = document.getElementById('schedule-list');
const bookingModal = document.getElementById('booking-modal');
const modalSlotInfo = document.getElementById('modal-slot-info');
const bookingForm = document.getElementById('booking-form');

// Initialization
function init() {
    setupEventListeners();

    // Set current date if testing today, but let's default to Feb 2026 as requested
    const today = new Date();
    if (today.getFullYear() >= 2026) {
        state.calendar.year = today.getFullYear();
        state.calendar.month = today.getMonth();
    }

    render();
}

// Event Listeners
function setupEventListeners() {
    // Login Views
    document.getElementById('login-teacher-btn').addEventListener('click', () => login('teacher'));

    showPsychLoginBtn.addEventListener('click', () => {
        loginSelection.classList.add('hidden');
        psychLoginForm.classList.remove('hidden');
        loginErrorMsg.style.display = 'none';
        document.getElementById('psych-username').value = '';
        document.getElementById('psych-password').value = '';
    });

    backToSelectionBtn.addEventListener('click', () => {
        psychLoginForm.classList.add('hidden');
        loginSelection.classList.remove('hidden');
    });

    psychLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('psych-username').value;
        const pass = document.getElementById('psych-password').value;

        if (user === 'admin' && pass === '1234') {
            login('psychologist');
        } else {
            loginErrorMsg.style.display = 'block';
        }
    });

    // Calendar Navigation
    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => changeMonth(1));

    // Logout
    logoutBtn.addEventListener('click', logout);

    // Modal Actions
    document.getElementById('cancel-booking-btn').addEventListener('click', closeModal);
    bookingForm.addEventListener('submit', handleBookingSubmit);
}

// Actions
function login(userType) {
    state.currentUser = userType;
    updateUI();
}

function logout() {
    state.currentUser = null;
    state.selectedDate = null;
    slotsContainer.classList.add('hidden');

    // Reset login view state
    psychLoginForm.classList.add('hidden');
    loginSelection.classList.remove('hidden');

    updateUI();
}

function changeMonth(delta) {
    state.calendar.month += delta;
    if (state.calendar.month > 11) {
        state.calendar.month = 0;
        state.calendar.year++;
    } else if (state.calendar.month < 0) {
        state.calendar.month = 11;
        state.calendar.year--;
    }
    state.selectedDate = null;
    slotsContainer.classList.add('hidden');
    renderCalendar();
}

function selectDate(dateStr) {
    state.selectedDate = dateStr;
    const [y, m, d] = dateStr.split('-');
    selectedDateDisplay.textContent = `${parseInt(d)} de ${months[parseInt(m) - 1]} ${y}`;
    slotsContainer.classList.remove('hidden');

    // Update selected styling
    document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
    const dayEl = document.querySelector(`[data-date="${dateStr}"]`);
    if (dayEl) dayEl.classList.add('selected');

    renderSlots();
}

function openBookingModal(time) {
    state.selectedSlot = time;
    const [y, m, d] = state.selectedDate.split('-');
    modalSlotInfo.textContent = `${parseInt(d)} de ${months[parseInt(m) - 1]} a las ${time}`;
    bookingModal.classList.remove('hidden');
}

function closeModal() {
    bookingModal.classList.add('hidden');
    state.selectedSlot = null;
    bookingForm.reset();
}

function handleBookingSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('teacher-name').value;
    const cedula = document.getElementById('teacher-cedula').value;
    const sede = document.getElementById('teacher-sede').value;
    const reason = document.getElementById('booking-reason').value;

    if (state.selectedDate && state.selectedSlot) {
        const id = Date.now().toString();

        state.bookings.push({
            id,
            date: state.selectedDate,
            time: state.selectedSlot,
            bookedBy: name,
            cedula: cedula,
            sede: sede,
            reason: reason,
            status: 'pending'
        });

        alert('¡Cita agendada con éxito!');
        closeModal();
        renderSlots(); // Refresh grid
    }
}

// Render Logic
function updateUI() {
    Object.values(views).forEach(view => {
        view.classList.remove('active');
        view.classList.add('hidden');
    });

    if (!state.currentUser) {
        views.login.classList.remove('hidden');
        views.login.classList.add('active');
        navMenu.classList.add('hidden');
    } else {
        navMenu.classList.remove('hidden');
        userDisplay.textContent = state.currentUser === 'teacher' ? 'Modo: Profesor' : 'Modo: Psicóloga';

        if (state.currentUser === 'teacher') {
            views.teacher.classList.remove('hidden');
            views.teacher.classList.add('active');
            renderCalendar();
        } else {
            views.psych.classList.remove('hidden');
            views.psych.classList.add('active');
            renderPsychView();
        }
    }
}

function renderCalendar() {
    calendarHeaderDisplay.textContent = `${months[state.calendar.month]} ${state.calendar.year}`;
    calendarDaysGrid.innerHTML = '';

    const firstDay = new Date(state.calendar.year, state.calendar.month, 1).getDay();
    const daysInMonth = new Date(state.calendar.year, state.calendar.month + 1, 0).getDate();

    // Offset for Monday start (0=Sun, 1=Mon ... 6=Sat)
    let startOffset = firstDay === 0 ? 6 : firstDay - 1;

    // Empty spaces
    for (let i = 0; i < startOffset; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-day empty';
        calendarDaysGrid.appendChild(emptyDiv);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        const dateStr = `${state.calendar.year}-${String(state.calendar.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Check day of week (0=Sun, 1=Mon ... 6=Sat)
        const dateObj = new Date(state.calendar.year, state.calendar.month, day);
        const dayOfWeek = dateObj.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        dayDiv.className = 'calendar-day';
        dayDiv.textContent = day;

        if (isWeekend) {
            dayDiv.classList.add('disabled');
        } else {
            dayDiv.dataset.date = dateStr;
            if (state.selectedDate === dateStr) {
                dayDiv.classList.add('selected');
            }
            dayDiv.addEventListener('click', () => selectDate(dateStr));
        }

        calendarDaysGrid.appendChild(dayDiv);
    }
}

function renderSlots() {
    calendarGrid.innerHTML = '';

    // Generate slots for the day
    const dayBookings = state.bookings.filter(b => b.date === state.selectedDate);

    dailySchedule.forEach(time => {
        const booking = dayBookings.find(b => b.time === time);
        const isBooked = !!booking;

        const card = document.createElement('div');
        card.className = `slot-card ${isBooked ? 'booked' : ''}`;

        card.innerHTML = `
            <div class="slot-time">${time}</div>
            <div class="slot-status">
                ${isBooked ? 'Reservado' : 'Disponible'}
            </div>
        `;

        if (!isBooked) {
            card.addEventListener('click', () => openBookingModal(time));
        }

        calendarGrid.appendChild(card);
    });
}

function renderPsychView() {
    scheduleList.innerHTML = '';

    // Sort bookings by date and time
    const sortedBookings = [...state.bookings].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
    });

    if (sortedBookings.length === 0) {
        scheduleList.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">No hay citas programadas aún.</div>';
        return;
    }

    sortedBookings.forEach(booking => {
        const [y, m, d] = booking.date.split('-');
        const dateStrFormated = `${parseInt(d)} de ${months[parseInt(m) - 1]} ${y}`;

        const isDone = booking.status === 'done';

        const item = document.createElement('div');
        item.className = `schedule-item ${isDone ? 'status-done' : ''}`;

        let actionsHtml = '';
        if (!isDone) {
            actionsHtml = `
            <div class="schedule-actions">
                <button class="btn-action done" onclick="window.markDone('${booking.id}')">✓ Hecha</button>
                <button class="btn-action cancel" onclick="window.cancelBooking('${booking.id}')">✕ Cancelar</button>
            </div>
            `;
        } else {
            actionsHtml = `
            <div class="schedule-actions" style="justify-content: center; color: var(--success-color); font-weight: 600;">
                ✓ Completada
            </div>
            `;
        }

        item.innerHTML = `
            <div class="schedule-time-block">
                <span class="time-large">${booking.time}</span>
                <span class="slot-date">${dateStrFormated}</span>
            </div>
            <div class="schedule-details">
                <div class="student-name">${booking.bookedBy} <span style="font-weight: 400; font-size: 0.85rem; color: var(--text-muted);">(${booking.sede})</span></div>
                <div class="booking-note" style="margin-bottom: 0.2rem;"><strong style="font-size: 0.8rem;">C.C:</strong> ${booking.cedula}</div>
                <div class="booking-note">${booking.reason || 'Sin motivo especificado'}</div>
            </div>
            ${actionsHtml}
        `;
        scheduleList.appendChild(item);
    });
}

window.markDone = function (id) {
    const booking = state.bookings.find(b => b.id === id);
    if (booking) {
        booking.status = 'done';
        renderPsychView();
    }
};

window.cancelBooking = function (id) {
    if (confirm('¿Estás seguro de cancelar esta cita? La hora volverá a estar disponible para los profesores.')) {
        state.bookings = state.bookings.filter(b => b.id !== id);
        renderPsychView();
    }
};

// Start
init();
