const calendarContainer = document.getElementById('calendar-container');
const workDaysCountEl = document.getElementById('work-days-count');
const offDaysCountEl = document.getElementById('off-days-count');
const salaryCountEl = document.getElementById('salary-count');
const periodToggle = document.getElementById('period-toggle');
const toggleLabels = document.querySelectorAll('.toggle-label');
const shiftSelector = document.getElementById('shift-selector');

const BASE_SALARY = 8300; // Зарплата за смену
let extraIncomes = JSON.parse(localStorage.getItem('shiftAppExtraIncomes')) || {};

// Настройки смен по умолчанию (Два/два)
let workDaysPattern = 2;
let offDaysPattern = 2;

// Базовая дата отсчета
const baseShiftDate = new Date(Date.UTC(2026, 8, 2)); 
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();

const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

function formatDateStr(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isWorkDay(date) {
    const dUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const diffTime = dUTC - baseShiftDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const cycleLength = workDaysPattern + offDaysPattern;
    const cycleDay = ((diffDays % cycleLength) + cycleLength) % cycleLength;
    
    return cycleDay < workDaysPattern;
}

// Вспомогательная функция расчета зарплаты за произвольный период
function calculateSalaryForPeriod(startDate, endDate) {
    let salary = 0;
    let workDays = 0;
    let current = new Date(startDate);
    
    while (current <= endDate) {
        const dateStr = formatDateStr(current);
        if (isWorkDay(current)) {
            salary += BASE_SALARY;
            workDays++;
        }
        if (extraIncomes[dateStr] && extraIncomes[dateStr].amount) {
            salary += parseFloat(extraIncomes[dateStr].amount);
        }
        current.setDate(current.getDate() + 1);
    }
    return { salary, workDays };
}

function generateMonth(year, month) {
    const monthDiv = document.createElement('div');
    monthDiv.className = 'month-block';
    
    const title = document.createElement('div');
    title.className = 'month-title';
    title.innerText = monthNames[month] + (year !== 2026 ? ' ' + year : '');
    monthDiv.appendChild(title);
    
    const grid = document.createElement('div');
    grid.className = 'days-grid';
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let startDay = firstDay === 0 ? 6 : firstDay - 1;
    
    for (let i = 0; i < startDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'day empty';
        grid.appendChild(empty);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const dateStr = formatDateStr(currentDate);
        
        const dayEl = document.createElement('div');
        dayEl.className = 'day';
        dayEl.innerText = day;
        
        if (currentDate.toDateString() === today.toDateString()) {
            dayEl.classList.add('today');
        } 
        
        if (isWorkDay(currentDate)) {
            dayEl.classList.add('work');
        }

        // Отметка дополнительных начислений
        if (extraIncomes[dateStr]) {
            dayEl.classList.add('has-extra');
        }

        // Открытие модального окна по клику
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
}

function updateStats() {
    let work = 0;
    let off = 0;
    let totalSalary = 0;
    
    const isYearly = periodToggle.checked;
    
    if (isYearly) {
        // Подсчет за целый год
        for (let m = 0; m <= 11; m++) {
            const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
            for (let day = 1; day <= daysInMonth; day++) {
                const d = new Date(currentYear, m, day);
                const dateStr = formatDateStr(d);
                
                if (isWorkDay(d)) {
                    work++;
                    totalSalary += BASE_SALARY;
                } else {
                    off++;
                }

                if (extraIncomes[dateStr] && extraIncomes[dateStr].amount) {
                    totalSalary += parseFloat(extraIncomes[dateStr].amount);
                }
            }
        }
    } else {
        // Подсчет за текущий месяц по новым правилам выплат
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const d = new Date(currentYear, currentMonth, day);
            if (isWorkDay(d)) {
                work++;
            } else {
                off++;
            }
        }

        // 1. Выплата 10-го числа: дни с 15 по конец ПРЕДЫДУЩЕГО месяца
        const prevMonthLastDay = new Date(currentYear, currentMonth, 0);
        const prevMonth15 = new Date(prevMonthLastDay.getFullYear(), prevMonthLastDay.getMonth(), 15);
        const pay10 = calculateSalaryForPeriod(prevMonth15, prevMonthLastDay);

        // 2. Выплата 25-го числа: дни с 1 по 15 число ТЕКУЩЕГО месяца
        const currMonth1 = new Date(currentYear, currentMonth, 1);
        const currMonth15 = new Date(currentYear, currentMonth, 15);
        const pay25 = calculateSalaryForPeriod(currMonth1, currMonth15);

        totalSalary = pay10.salary + pay25.salary;
    }
    
    workDaysCountEl.innerText = work;
    offDaysCountEl.innerText = off;
    salaryCountEl.innerText = totalSalary.toLocaleString('ru-RU') + ' ₽';
}

// Делегирование событий для кнопок смены
shiftSelector.addEventListener('click', (e) => {
    const btn = e.target.closest('.shift-btn');
    if (!btn) return;
    
    if (btn.classList.contains('add-btn')) {
        document.getElementById('shift-modal').classList.remove('hidden');
        return;
    }

    document.querySelectorAll('.shift-btn:not(.add-btn)').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    workDaysPattern = parseInt(btn.dataset.work);
    offDaysPattern = parseInt(btn.dataset.off);
    renderCalendar();
});

// Переключение статистики В месяце / В году
periodToggle.addEventListener('change', (e) => {
    toggleLabels[0].classList.toggle('active', !e.target.checked);
    toggleLabels[1].classList.toggle('active', e.target.checked);
    updateStats();
});

// Модальное окно добавления графика
document.getElementById('close-shift-btn').addEventListener('click', () => {
    document.getElementById('shift-modal').classList.add('hidden');
});

document.getElementById('save-shift-btn').addEventListener('click', () => {
    const w = parseInt(document.getElementById('new-work-days').value);
    const o = parseInt(document.getElementById('new-off-days').value);
    
    if (w > 0 && o > 0) {
        const newBtn = document.createElement('button');
        newBtn.className = 'shift-btn';
        newBtn.dataset.work = w;
        newBtn.dataset.off = o;
        newBtn.innerText = `${w}/${o}`;
        
        const addBtn = document.querySelector('.add-btn');
        shiftSelector.insertBefore(newBtn, addBtn);
        
        document.getElementById('shift-modal').classList.add('hidden');
        
        document.getElementById('new-work-days').value = '';
        document.getElementById('new-off-days').value = '';
        
        newBtn.click();
    } else {
        alert("Пожалуйста, введите корректные значения (минимум 1).");
    }
});

// Модальное окно дня
let currentSelectedDateStr = null;

function openDayModal(date, dateStr) {
    currentSelectedDateStr = dateStr;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('modal-date-title').innerText = date.toLocaleDateString('ru-RU', options);
    
    const day = date.getDate();
    const subtitleEl = document.querySelector('.modal-subtitle');
    
    // Динамический вывод информации о выплатах при клике на 10 и 25 число
    if (day === 10) {
        const prevMonthLastDay = new Date(date.getFullYear(), date.getMonth(), 0);
        const prevMonth15 = new Date(prevMonthLastDay.getFullYear(), prevMonthLastDay.getMonth(), 15);
        const calc = calculateSalaryForPeriod(prevMonth15, prevMonthLastDay);
        subtitleEl.innerText = `Выплата 10-го числа (за 15–${prevMonthLastDay.getDate()} прошл. мес.): ${calc.salary.toLocaleString('ru-RU')} ₽ (${calc.workDays} смен)`;
    } else if (day === 25) {
        const curr1 = new Date(date.getFullYear(), date.getMonth(), 1);
        const curr15 = new Date(date.getFullYear(), date.getMonth(), 15);
        const calc = calculateSalaryForPeriod(curr1, curr15);
        subtitleEl.innerText = `Выплата 25-го числа (за 1–15 тек. мес.): ${calc.salary.toLocaleString('ru-RU')} ₽ (${calc.workDays} смен)`;
    } else {
        subtitleEl.innerText = `Дополнительные выплаты / заметки`;
    }

    const amountInput = document.getElementById('extra-amount');
    const noteInput = document.getElementById('extra-note');
    
    if (extraIncomes[dateStr]) {
        amountInput.value = extraIncomes[dateStr].amount || '';
        noteInput.value = extraIncomes[dateStr].note || '';
    } else {
        amountInput.value = '';
        noteInput.value = '';
    }
    
    document.getElementById('day-modal').classList.remove('hidden');
}

document.getElementById('close-day-btn').addEventListener('click', () => {
    document.getElementById('day-modal').classList.add('hidden');
});

document.getElementById('save-day-btn').addEventListener('click', () => {
    const amount = document.getElementById('extra-amount').value;
    const note = document.getElementById('extra-note').value.trim();
    
    if (amount) {
        extraIncomes[currentSelectedDateStr] = { 
            amount: parseFloat(amount), 
            note: note 
        };
    } else {
        delete extraIncomes[currentSelectedDateStr];
    }
    
    localStorage.setItem('shiftAppExtraIncomes', JSON.stringify(extraIncomes));
    document.getElementById('day-modal').classList.add('hidden');
    
    renderCalendar();
});

// Инициализация
renderCalendar();

setTimeout(() => {
    const todayElement = document.querySelector('.today');
    if (todayElement) {
        todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}, 100);

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.log(err));
}
