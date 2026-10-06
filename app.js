const calendarContainer = document.getElementById('calendar-container');
const workDaysCountEl = document.getElementById('work-days-count');
const offDaysCountEl = document.getElementById('off-days-count');
const salary10CountEl = document.getElementById('salary-10-count');
const salary25CountEl = document.getElementById('salary-25-count');
const periodToggle = document.getElementById('period-toggle');
const toggleLabels = document.querySelectorAll('.toggle-label');
const shiftSelector = document.getElementById('shift-selector');
const cycleBadge = document.getElementById('current-cycle-badge');
const toast = document.getElementById('toast');
const todayStatusEl = document.getElementById('today-status');
const todayDateEl = document.getElementById('today-date');
const heroCycleEl = document.getElementById('hero-cycle');
const heroNextPayEl = document.getElementById('hero-next-pay');
const heroWorkCountEl = document.getElementById('hero-work-count');

const BASE_SALARY = 8300;
const SATURDAY_SALARY = 5500;

let extraIncomes = JSON.parse(localStorage.getItem('shiftAppExtraIncomes') || '{}');
let customPatterns = JSON.parse(localStorage.getItem('shiftAppCustomPatterns') || '[]');

let savedPattern = JSON.parse(localStorage.getItem('shiftAppPattern') || '{"work":2,"off":2}');
let workDaysPattern = Number(savedPattern.work) || 2;
let offDaysPattern = Number(savedPattern.off) || 2;

const baseShiftDate = new Date(Date.UTC(2026, 8, 2));
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();

const monthNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

function formatDateStr(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isWorkDay(date) {
    const dUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((dUTC - baseShiftDate.getTime()) / 86400000);
    const cycleLength = workDaysPattern + offDaysPattern;
    const cycleDay = ((diffDays % cycleLength) + cycleLength) % cycleLength;
    return cycleDay < workDaysPattern;
}

function getDaySalaryRate(date) {
    return date.getDay() === 6 ? SATURDAY_SALARY : BASE_SALARY;
}

function calculateSalaryForPeriod(startDate, endDate) {
    let salary = 0;
    let workDays = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
        const dateStr = formatDateStr(current);
        if (isWorkDay(current)) {
            salary += getDaySalaryRate(current);
            workDays++;
        }
        if (extraIncomes[dateStr]?.amount) {
            salary += parseFloat(extraIncomes[dateStr].amount);
        }
        current.setDate(current.getDate() + 1);
    }
    return { salary, workDays };
}

function generateMonth(year, month) {
    const monthDiv = document.createElement('div');
    monthDiv.className = 'month-block';
    monthDiv.dataset.month = `${year}-${String(month + 1).padStart(2, '0')}`;

    const title = document.createElement('div');
    title.className = 'month-title';
    title.innerText = monthNames[month] + (year !== currentYear ? ` ${year}` : '');
    monthDiv.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'days-grid';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < startDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'day empty';
        grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const dateStr = formatDateStr(currentDate);

        const dayEl = document.createElement('button');
        dayEl.type = 'button';
        dayEl.className = 'day';
        dayEl.innerText = day;
        dayEl.setAttribute('aria-label', currentDate.toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric'
        }));

        if (currentDate.toDateString() === today.toDateString()) {
            dayEl.classList.add('today');
        }
        if (isWorkDay(currentDate)) {
            dayEl.classList.add('work');
        }
        if (extraIncomes[dateStr]) {
            dayEl.classList.add('has-extra');
        }

        dayEl.addEventListener('click', () => openDayModal(currentDate, dateStr));
        grid.appendChild(dayEl);
    }

    monthDiv.appendChild(grid);
    calendarContainer.appendChild(monthDiv);
}

function renderCalendar() {
    calendarContainer.innerHTML = '';
    for (let month = 0; month < 12; month++) {
        generateMonth(currentYear, month);
    }
    updateStats();
    updateHero();
    updateCycleUI();
}

function updateHero() {
    const now = new Date();
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);
    const monthCalc = calculateSalaryForPeriod(monthStart, monthEnd);

    const isWorking = isWorkDay(now);
    todayStatusEl.textContent = isWorking ? 'Рабочая смена' : 'Выходной день';
    todayStatusEl.classList.toggle('work', isWorking);
    todayStatusEl.classList.toggle('off', !isWorking);
    todayDateEl.textContent = now.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
    heroCycleEl.textContent = `${workDaysPattern} / ${offDaysPattern}`;
    heroWorkCountEl.textContent = `${monthCalc.workDays} смен`;

    const day = now.getDate();
    if (day < 10) {
        heroNextPayEl.textContent = '10-го числа';
    } else if (day < 25) {
        heroNextPayEl.textContent = '25-го числа';
    } else {
        heroNextPayEl.textContent = '10-го числа';
    }
}

function updateStats() {
    let work = 0;
    let off = 0;
    const isYearly = periodToggle.checked;

    if (isYearly) {
        let totalPay10 = 0;
        let totalPay25 = 0;

        for (let m = 0; m < 12; m++) {
            const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
            for (let day = 1; day <= daysInMonth; day++) {
                const d = new Date(currentYear, m, day);
                if (isWorkDay(d)) work++; else off++;
            }

            const prevMonthLastDay = new Date(currentYear, m, 0);
            const prevMonth15 = new Date(prevMonthLastDay.getFullYear(), prevMonthLastDay.getMonth(), 15);
            totalPay10 += calculateSalaryForPeriod(prevMonth15, prevMonthLastDay).salary;

            const currMonth1 = new Date(currentYear, m, 1);
            const currMonth15 = new Date(currentYear, m, 15);
            totalPay25 += calculateSalaryForPeriod(currMonth1, currMonth15).salary;
        }

        salary10CountEl.innerText = totalPay10.toLocaleString('ru-RU') + ' ₽';
        salary25CountEl.innerText = totalPay25.toLocaleString('ru-RU') + ' ₽';
    } else {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const d = new Date(currentYear, currentMonth, day);
            if (isWorkDay(d)) work++; else off++;
        }

        const prevMonthLastDay = new Date(currentYear, currentMonth, 0);
        const prevMonth15 = new Date(prevMonthLastDay.getFullYear(), prevMonthLastDay.getMonth(), 15);
        const pay10 = calculateSalaryForPeriod(prevMonth15, prevMonthLastDay);

        const currMonth1 = new Date(currentYear, currentMonth, 1);
        const currMonth15 = new Date(currentYear, currentMonth, 15);
        const pay25 = calculateSalaryForPeriod(currMonth1, currMonth15);

        salary10CountEl.innerText = pay10.salary.toLocaleString('ru-RU') + ' ₽';
        salary25CountEl.innerText = pay25.salary.toLocaleString('ru-RU') + ' ₽';
    }

    workDaysCountEl.innerText = work;
    offDaysCountEl.innerText = off;
}

function updateCycleUI() {
    cycleBadge.innerText = `${workDaysPattern} / ${offDaysPattern}`;

    document.querySelectorAll('.shift-btn:not(.add-btn)').forEach(btn => {
        const active = Number(btn.dataset.work) === workDaysPattern &&
            Number(btn.dataset.off) === offDaysPattern;
        btn.classList.toggle('active', active);
    });
}

function savePattern() {
    localStorage.setItem('shiftAppPattern', JSON.stringify({
        work: workDaysPattern,
        off: offDaysPattern
    }));
}

function addCustomPatternButton(work, off) {
    const exists = [...shiftSelector.querySelectorAll('.shift-btn:not(.add-btn)')]
        .some(btn => Number(btn.dataset.work) === work && Number(btn.dataset.off) === off);

    if (exists) return;

    const newBtn = document.createElement('button');
    newBtn.type = 'button';
    newBtn.className = 'shift-btn';
    newBtn.dataset.work = work;
    newBtn.dataset.off = off;
    newBtn.innerHTML = `<span>${work} / ${off}</span><small>свой график</small>`;

    const addBtn = shiftSelector.querySelector('.add-btn');
    shiftSelector.insertBefore(newBtn, addBtn);
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
    document.body.classList.add('modal-open');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
    if (!document.querySelector('.modal:not(.hidden)')) {
        document.body.classList.remove('modal-open');
    }
}

shiftSelector.addEventListener('click', (event) => {
    const btn = event.target.closest('.shift-btn');
    if (!btn) return;

    if (btn.classList.contains('add-btn')) {
        openModal('shift-modal');
        setTimeout(() => document.getElementById('new-work-days').focus(), 150);
        return;
    }

    workDaysPattern = Number(btn.dataset.work);
    offDaysPattern = Number(btn.dataset.off);
    savePattern();
    renderCalendar();
});

periodToggle.addEventListener('change', (event) => {
    toggleLabels[0].classList.toggle('active', !event.target.checked);
    toggleLabels[1].classList.toggle('active', event.target.checked);
    updateStats();
    updateHero();
});

document.getElementById('save-shift-btn').addEventListener('click', () => {
    const w = parseInt(document.getElementById('new-work-days').value, 10);
    const o = parseInt(document.getElementById('new-off-days').value, 10);

    if (!Number.isInteger(w) || !Number.isInteger(o) || w < 1 || o < 1 || w > 31 || o > 31) {
        showToast('Введите рабочие и выходные дни от 1 до 31');
        return;
    }

    addCustomPatternButton(w, o);

    if (!customPatterns.some(item => item.work === w && item.off === o)) {
        customPatterns.push({ work: w, off: o });
        localStorage.setItem('shiftAppCustomPatterns', JSON.stringify(customPatterns));
    }

    workDaysPattern = w;
    offDaysPattern = o;
    savePattern();
    renderCalendar();
    closeModal('shift-modal');

    document.getElementById('new-work-days').value = '';
    document.getElementById('new-off-days').value = '';
    showToast(`График ${w} / ${o} добавлен`);
});

document.getElementById('close-shift-btn').addEventListener('click', () => closeModal('shift-modal'));
document.getElementById('close-day-btn').addEventListener('click', () => closeModal('day-modal'));

document.querySelectorAll('[data-close-modal]').forEach(element => {
    element.addEventListener('click', () => closeModal(element.dataset.closeModal));
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal:not(.hidden)').forEach(modal => closeModal(modal.id));
    }
});

let currentSelectedDateStr = null;

function openDayModal(date, dateStr) {
    currentSelectedDateStr = dateStr;

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('modal-date-title').innerText =
        date.toLocaleDateString('ru-RU', options);

    const day = date.getDate();
    const subtitleEl = document.querySelector('#day-modal .modal-subtitle');

    if (day === 10) {
        const prevMonthLastDay = new Date(date.getFullYear(), date.getMonth(), 0);
        const prevMonth15 = new Date(prevMonthLastDay.getFullYear(), prevMonthLastDay.getMonth(), 15);
        const calc = calculateSalaryForPeriod(prevMonth15, prevMonthLastDay);
        subtitleEl.innerText =
            `Выплата 10-го: ${calc.salary.toLocaleString('ru-RU')} ₽ · ${calc.workDays} смен`;
    } else if (day === 25) {
        const curr1 = new Date(date.getFullYear(), date.getMonth(), 1);
        const curr15 = new Date(date.getFullYear(), date.getMonth(), 15);
        const calc = calculateSalaryForPeriod(curr1, curr15);
        subtitleEl.innerText =
            `Выплата 25-го: ${calc.salary.toLocaleString('ru-RU')} ₽ · ${calc.workDays} смен`;
    } else {
        const isSat = date.getDay() === 6;
        const rateStr = isSat ? '5 500 ₽ · суббота' : '8 300 ₽';
        subtitleEl.innerText = isWorkDay(date)
            ? `Рабочая смена · ${rateStr}`
            : 'Выходной день';
    }

    const amountInput = document.getElementById('extra-amount');
    const noteInput = document.getElementById('extra-note');
    const income = extraIncomes[dateStr];

    amountInput.value = income?.amount || '';
    noteInput.value = income?.note || '';

    openModal('day-modal');
    setTimeout(() => amountInput.focus(), 120);
}

document.getElementById('save-day-btn').addEventListener('click', () => {
    const amount = document.getElementById('extra-amount').value;
    const note = document.getElementById('extra-note').value.trim();

    if (amount && parseFloat(amount) >= 0) {
        extraIncomes[currentSelectedDateStr] = {
            amount: parseFloat(amount),
            note
        };
        showToast('Доплата сохранена');
    } else {
        delete extraIncomes[currentSelectedDateStr];
        showToast('Доплата удалена');
    }

    localStorage.setItem('shiftAppExtraIncomes', JSON.stringify(extraIncomes));
    closeModal('day-modal');
    renderCalendar();
});

document.getElementById('jump-today-btn').addEventListener('click', () => {
    const todayElement = document.querySelector('.today');
    if (todayElement) {
        todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast('Сегодня');
    }
});

function restoreCustomPatterns() {
    customPatterns.forEach(({ work, off }) => {
        if (Number.isInteger(work) && Number.isInteger(off)) {
            addCustomPatternButton(work, off);
        }
    });
}

function bootApp() {
    restoreCustomPatterns();
    renderCalendar();

    requestAnimationFrame(() => {
        const todayElement = document.querySelector('.today');
        if (todayElement) {
            todayElement.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
    });

    const appShell = document.getElementById('app-shell');
    const splash = document.getElementById('splash-screen');
    const loaderText = document.getElementById('loader-text');

    setTimeout(() => {
        loaderText.textContent = 'Календарь готов';
        appShell.classList.add('ready');
    }, 260);

    setTimeout(() => {
        splash.classList.add('is-hidden');
        appShell.setAttribute('aria-hidden', 'false');
    }, 850);
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootApp);
} else {
    bootApp();
}
