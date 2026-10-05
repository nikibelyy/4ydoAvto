const calendarContainer = document.getElementById('calendar-container');
const workDaysCountEl = document.getElementById('work-days-count');
const offDaysCountEl = document.getElementById('off-days-count');
const shiftButtons = document.querySelectorAll('.shift-btn:not(.add-btn)');
const periodToggle = document.getElementById('period-toggle');
const toggleLabels = document.querySelectorAll('.toggle-label');

// Настройки смен по умолчанию (Два/два)
let workDaysPattern = 2;
let offDaysPattern = 2;

// Базовая дата отсчета (2 сентября 2026 как на фото)
const baseShiftDate = new Date(2026, 8, 2); 
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();

const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

function isWorkDay(date) {
    const diffTime = date.getTime() - baseShiftDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const cycleLength = workDaysPattern + offDaysPattern;
    const cycleDay = ((diffDays % cycleLength) + cycleLength) % cycleLength;
    
    return cycleDay < workDaysPattern;
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
        const dayEl = document.createElement('div');
        dayEl.className = 'day';
        dayEl.innerText = day;
        
        if (currentDate.toDateString() === today.toDateString()) {
            dayEl.classList.add('today');
        } else if (isWorkDay(currentDate)) {
            dayEl.classList.add('work');
        }
        
        grid.appendChild(dayEl);
    }
    
    monthDiv.appendChild(grid);
    calendarContainer.appendChild(monthDiv);
}

function renderCalendar() {
    calendarContainer.innerHTML = '';
    
    // Генерируем 12 месяцев года
    for (let month = 0; month < 12; month++) {
        generateMonth(currentYear, month);
    }
    
    updateStats();
    
    // Автоматически прокручиваем к текущему месяцу при загрузке
    setTimeout(() => {
        const todayElement = document.querySelector('.today');
        if (todayElement) {
            todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

function updateStats() {
    let work = 0;
    let off = 0;
    
    const isYearly = periodToggle.checked;
    const startMonth = isYearly ? 0 : currentMonth;
    const endMonth = isYearly ? 11 : currentMonth;
    
    for (let m = startMonth; m <= endMonth; m++) {
        const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const d = new Date(currentYear, m, day);
            if (isWorkDay(d)) work++;
            else off++;
        }
    }
    
    workDaysCountEl.innerText = work;
    offDaysCountEl.innerText = off;
}

// Переключение графиков
shiftButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        shiftButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        workDaysPattern = parseInt(e.target.dataset.work);
        offDaysPattern = parseInt(e.target.dataset.off);
        renderCalendar();
    });
});

// Переключение статистики В месяце / В году
periodToggle.addEventListener('change', (e) => {
    toggleLabels[0].classList.toggle('active', !e.target.checked);
    toggleLabels[1].classList.toggle('active', e.target.checked);
    updateStats();
});

// Инициализация
renderCalendar();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
