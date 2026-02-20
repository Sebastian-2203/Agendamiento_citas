// Mock Data / State
const state = {
    currentUser: null, // 'teacher' | 'psychologist' | null
    slots: [
        { id: 1, date: '2023-11-20', time: '08:00 AM', booked: false, bookedBy: null, reason: '' },
        { id: 2, date: '2023-11-20', time: '09:00 AM', booked: true, bookedBy: 'Prof. Ana García', reason: 'Consulta general' },
        { id: 3, date: '2023-11-20', time: '10:00 AM', booked: false, bookedBy: null, reason: '' },
        { id: 4, date: '2023-11-20', time: '11:00 AM', booked: false, bookedBy: null, reason: '' },
        { id: 5, date: '2023-11-20', time: '02:00 PM', booked: false, bookedBy: null, reason: '' },
        { id: 6, date: '2023-11-21', time: '09:00 AM', booked: false, bookedBy: null, reason: '' },
    ],
    selectedSlotId: null
};

// DOM Elements
const views = {
    login: document.getElementById('login-view'),
    teacher: document.getElementById('teacher-view'),
    psych: document.getElementById('psych-view')
};

const navMenu = document.getElementById('nav-menu');
const userDisplay = document.getElementById('user-display');
const logoutBtn = document.getElementById('logout-btn');
const calendarGrid = document.getElementById('calendar-grid');
const scheduleList = document.getElementById('schedule-list');
const bookingModal = document.getElementById('booking-modal');
const modalSlotInfo = document.getElementById('modal-slot-info');
const bookingForm = document.getElementById('booking-form');

// Initialization
function init() {
    setupEventListeners();
    render();
}

// Event Listeners
function setupEventListeners() {
    // Login Buttons
    document.getElementById('login-teacher-btn').addEventListener('click', () => login('teacher'));
    document.getElementById('login-psych-btn').addEventListener('click', () => login('psychologist'));

    // Logout
    logoutBtn.addEventListener('click', logout);

    // Modal Actions
    document.getElementById('cancel-booking-btn').addEventListener('click', closeModal);
    
    // Booking Form Submit
    bookingForm.addEventListener('submit', handleBookingSubmit);
}

// Actions
function login(userType) {
    state.currentUser = userType;
    updateUI();
}

function logout() {
    state.currentUser = null;
    updateUI();
}

function openBookingModal(slot) {
    state.selectedSlotId = slot.id;
    modalSlotInfo.textContent = `${slot.date} a las ${slot.time}`;
    bookingModal.classList.remove('hidden');
}

function closeModal() {
    bookingModal.classList.add('hidden');
    state.selectedSlotId = null;
    bookingForm.reset();
}

function handleBookingSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('teacher-name').value;
    const reason = document.getElementById('booking-reason').value;

    if (state.selectedSlotId) {
        const slotIndex = state.slots.findIndex(s => s.id === state.selectedSlotId);
        if (slotIndex !== -1) {
            state.slots[slotIndex].booked = true;
            state.slots[slotIndex].bookedBy = name;
            state.slots[slotIndex].reason = reason;
            
            // Re-render
            alert('¡Cita agendada con éxito!');
            closeModal();
            renderTeacherView(); // Refresh grid
        }
    }
}

// Render Logic
function updateUI() {
    // Hide all views
    Object.values(views).forEach(view => {
        view.classList.remove('active');
        view.classList.add('hidden');
    });

    if (!state.currentUser) {
        // Show Login
        views.login.classList.remove('hidden');
        views.login.classList.add('active');
        navMenu.classList.add('hidden');
    } else {
        // Show Logged In UI
        navMenu.classList.remove('hidden');
        userDisplay.textContent = state.currentUser === 'teacher' ? 'Modo: Profesor' : 'Modo: Psicóloga';

        if (state.currentUser === 'teacher') {
            views.teacher.classList.remove('hidden');
            views.teacher.classList.add('active');
            renderTeacherView();
        } else {
            views.psych.classList.remove('hidden');
            views.psych.classList.add('active');
            renderPsychView();
        }
    }
}

function renderTeacherView() {
    calendarGrid.innerHTML = '';
    state.slots.forEach(slot => {
        const card = document.createElement('div');
        card.className = `slot-card ${slot.booked ? 'booked' : ''}`;
        
        card.innerHTML = `
            <div class="slot-time">${slot.time}</div>
            <div class="slot-date">${slot.date}</div>
            <div class="slot-status">
                ${slot.booked ? 'Reservado' : 'Disponible'}
            </div>
        `;

        if (!slot.booked) {
            card.addEventListener('click', () => openBookingModal(slot));
        }

        calendarGrid.appendChild(card);
    });
}

function renderPsychView() {
    scheduleList.innerHTML = '';
    const bookedSlots = state.slots.filter(s => s.booked);

    if (bookedSlots.length === 0) {
        scheduleList.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">No hay citas programadas aún.</div>';
        return;
    }

    bookedSlots.forEach(slot => {
        const item = document.createElement('div');
        item.className = 'schedule-item';
        item.innerHTML = `
            <div class="schedule-time-block">
                <span class="time-large">${slot.time}</span>
                <span class="slot-date">${slot.date}</span>
            </div>
            <div class="schedule-details">
                <div class="student-name">${slot.bookedBy}</div>
                <div class="booking-note">${slot.reason || 'Sin motivo especificado'}</div>
            </div>
        `;
        scheduleList.appendChild(item);
    });
}

function render() {
    updateUI();
}

// Start
init();
