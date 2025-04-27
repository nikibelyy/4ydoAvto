// Проверка токена при загрузке страницы admin.html
if (window.location.pathname.includes('admin.html')) {
    if (!localStorage.getItem('token')) {
        window.location.href = 'index.html';
    }
}

function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorElement = document.getElementById('loginError');

    if (username === 'admin' && password === '1234') { // Примитивная проверка
        localStorage.setItem('token', 'your_random_token');
        window.location.href = 'admin.html';
    } else {
        errorElement.textContent = "Неверное имя пользователя или пароль!";
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.innerText = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function banUser() {
    const userId = prompt("Введите ID пользователя для бана:");
    if (userId) {
        // Симулируем API-запрос
        showNotification(`Пользователь ${userId} забанен.`);
    }
}

function unbanUser() {
    const userId = prompt("Введите ID пользователя для разбана:");
    if (userId) {
        showNotification(`Пользователь ${userId} разбанен.`);
    }
}

function sendBroadcast() {
    const message = document.getElementById('broadcastMessage').value.trim();
    if (message) {
        showNotification(`Сообщение отправлено: "${message}"`);
        document.getElementById('broadcastMessage').value = '';
    } else {
        showNotification('Введите сообщение перед отправкой.');
    }
}

function restartBot() {
    if (confirm("Вы уверены, что хотите перезапустить бота?")) {
        showNotification('Бот успешно перезапущен.');
    }
}
