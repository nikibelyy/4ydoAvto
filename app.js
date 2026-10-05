const calendarContainer = document.getElementById('calendar-container');
const workDaysCountEl = document.getElementById('work-days-count');
const offDaysCountEl = document.getElementById('off-days-count');
const shiftButtons = document.querySelectorAll('.shift-btn:not(.add-btn)');

// Настройки смен по умолчанию (Два/два)
let workDaysPattern = 2;
let offDaysPattern = 2;

// Базовая дата отсчета для смен (например, 2 сентября 2026, как на скрине)
const baseShiftDate = new Date(2026, 8, 2); 
const today = new Date();

const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

function isWorkDay(date) {
    const diffTime = date.getTime() - baseShiftDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const cycleLength = workDaysPattern + offDaysPattern;
    // Обработка отрицательных значений для дат до базовой
    const cycleDay = ((diffDays % cycleLength) + cycleLength) % cycleLength;
    
    return cycleDay < workDaysPattern;
}

function generateMonth(year, month) {
    const monthDiv = document.createElement('div');
    monthDiv.className = 'month-block';
    
    const title = document.createElement('div');
    title.className = 'month-title';
    title.innerText = monthNames[month];
    monthDiv.appendChild(title);
    
    const grid = document.createElement('div');
    grid.className = 'days-grid';
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Корректировка для понедельника как первого дня недели
    let startDay = firstDay === 0 ? 6 : firstDay - 1;
    
    // Пустые ячейки
    for (let i = 0; i < startDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'day empty';
        grid.appendChild(empty);
    }
    
    // Дни месяца
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
    // Генерируем Сентябрь и Октябрь (как на фото) или текущие месяцы
    generateMonth(2026, 8); // Сентябрь 2026
    generateMonth(2026, 9); // Октябрь 2026
    updateStats();
}

function updateStats() {
    // Подсчет для Октября как активного месяца в статистике (согласно фото: 15 рабочих, 16 выходных)
    let work = 0;
    let off = 0;
    const daysInOct = new Date(2026, 9 + 1, 0).getDate();
    
    for (let day = 1; day <= daysInOct; day++) {
        const d = new Date(2026, 9, day);
        if (isWorkDay(d)) work++;
        else off++;
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

// Инициализация
renderCalendar();

// Регистрация Service Worker для PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
