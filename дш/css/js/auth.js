// Аутентификация для учителей
document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации на страницах учителя
    if (window.location.pathname.includes('teacher-panel.html') || 
        window.location.pathname.includes('test-editor.html')) {
        checkTeacherAuth();
    }
    
    // Обработка формы входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Обработка выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// Обработка входа
function handleLogin(e) {
    e.preventDefault();
    
    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;
    
    // Проверка демо-доступа
    if (login === 'teacher' && password === '12345') {
        // Сохраняем информацию о входе
        localStorage.setItem('teacherLoggedIn', 'true');
        localStorage.setItem('teacherName', 'Учитель Демо');
        
        // Перенаправляем в кабинет учителя
        window.location.href = 'teacher-panel.html';
    } else {
        alert('Неверный логин или пароль. Используйте демо доступ: логин - teacher, пароль - 12345');
    }
}

// Проверка авторизации учителя
function checkTeacherAuth() {
    const isLoggedIn = localStorage.getItem('teacherLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        // Перенаправляем на страницу входа
        window.location.href = 'login.html';
    }
}

// Выход из системы
function handleLogout() {
    localStorage.removeItem('teacherLoggedIn');
    localStorage.removeItem('teacherName');
    window.location.href = 'login.html';
}

// Получение имени текущего учителя
function getCurrentTeacher() {
    return localStorage.getItem('teacherName') || 'Учитель';
}