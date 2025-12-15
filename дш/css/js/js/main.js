// Основные функции приложения
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация мобильного меню
    initMobileMenu();
    
    // Загрузка тестов для ученика
    if (window.location.pathname.includes('test.html')) {
        loadStudentTest();
    }
    
    // Обработка формы ученика
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        studentForm.addEventListener('submit', handleStudentStart);
    }
    
    // Обработка отправки теста
    const testForm = document.getElementById('testForm');
    if (testForm) {
        testForm.addEventListener('submit', handleTestSubmit);
    }
});

// Инициализация мобильного меню
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
}

// Обработка начала теста учеником
function handleStudentStart(e) {
    e.preventDefault();
    
    const studentName = document.getElementById('studentName').value;
    const studentClass = document.getElementById('studentClass').value;
    
    if (!studentName.trim() || !studentClass.trim()) {
        alert('Пожалуйста, введите имя и класс');
        return;
    }
    
    // Сохраняем данные ученика
    sessionStorage.setItem('studentName', studentName);
    sessionStorage.setItem('studentClass', studentClass);
    
    // Загружаем доступные тесты
    loadAvailableTests();
}

// Загрузка доступных тестов
function loadAvailableTests() {
    const subjectId = sessionStorage.getItem('selectedSubject');
    const tests = JSON.parse(localStorage.getItem('tests'));
    const studentName = sessionStorage.getItem('studentName');
    
    // Фильтруем тесты по предмету
    const subjectTests = tests.filter(test => test.subject === subjectId);
    
    // Проверяем, какие тесты ученик уже проходил
    const results = JSON.parse(localStorage.getItem('results'));
    const passedTests = results.filter(result => 
        result.studentName === studentName && 
        result.subject === subjectId
    ).map(result => result.testId);
    
    // Фильтруем тесты, которые ученик еще не проходил
    const availableTests = subjectTests.filter(test => !passedTests.includes(test.id));
    
    const testsContainer = document.getElementById('testsContainer');
    if (!testsContainer) return;
    
    if (availableTests.length === 0) {
        testsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-check fa-3x"></i>
                <h3>Нет доступных тестов</h3>
                <p>Вы уже прошли все тесты по этому предмету</p>
                <a href="index.html" class="btn btn-primary">
                    <i class="fas fa-arrow-left"></i> Вернуться к предметам
                </a>
            </div>
        `;
        return;
    }
    
    testsContainer.innerHTML = '';
    
    availableTests.forEach(test => {
        const testCard = document.createElement('div');
        testCard.className = 'test-card';
        testCard.innerHTML = `
            <div class="test-header">
                <h3>${test.title}</h3>
                <span class="test-teacher">${test.teacher}</span>
            </div>
            <p>${test.description}</p>
            <div class="test-info">
                <p><i class="fas fa-question-circle"></i> Вопросов: ${test.questions.length}</p>
            </div>
            <button class="btn btn-primary" onclick="startTest('${test.id}')">
                <i class="fas fa-play"></i> Начать тест
            </button>
        `;
        
        testsContainer.appendChild(testCard);
    });
}

// Начать тест
function startTest(testId) {
    sessionStorage.setItem('currentTestId', testId);
    sessionStorage.setItem('testStartTime', Date.now());
    
    // Перенаправляем на страницу прохождения теста
    window.location.href = 'test.html?test=' + testId;
}

// Загрузка теста для прохождения
function loadStudentTest() {
    const testId = sessionStorage.getItem('currentTestId');
    if (!testId) return;
    
    const tests = JSON.parse(localStorage.getItem('tests'));
    const test = tests.find(t => t.id === testId);
    
    if (!test) {
        alert('Тест не найден');
        window.location.href = 'index.html';
        return;
    }
    
    // Отображаем информацию о тесте
    const testInfo = document.getElementById('testInfo');
    if (testInfo) {
        testInfo.innerHTML = `
            <h2>${test.title}</h2>
            <p>${test.description}</p>
            <div class="test-meta">
                <span><i class="fas fa-user-tie"></i> ${test.teacher}</span>
                <span><i class="fas fa-question-circle"></i> Вопросов: ${test.questions.length}</span>
            </div>
        `;
    }
    
    // Отображаем вопросы
    const questionsContainer = document.getElementById('questionsContainer');
    if (questionsContainer) {
        questionsContainer.innerHTML = '';
        
        test.questions.forEach((question, qIndex) => {
            const questionElement = document.createElement('div');
            questionElement.className = 'question-item';
            questionElement.innerHTML = `
                <div class="question">
                    <h4>Вопрос ${qIndex + 1}</h4>
                    <p>${question.text}</p>
                </div>
                <div class="answers">
                    ${question.opts.map((option, aIndex) => `
                        <div class="answer-option">
                            <input type="radio" 
                                   id="q${qIndex}_a${aIndex}" 
                                   name="q${qIndex}" 
                                   value="${aIndex}">
                            <label for="q${qIndex}_a${aIndex}">
                                ${option}
                            </label>
                        </div>
                    `).join('')}
                </div>
            `;
            
            questionsContainer.appendChild(questionElement);
        });
    }
    
    // Запускаем таймер
    startTimer();
}

// Запуск таймера
function startTimer() {
    const timerElement = document.getElementById('timer');
    if (!timerElement) return;
    
    const startTime = parseInt(sessionStorage.getItem('testStartTime'));
    let elapsedSeconds = 0;
    
    const timer = setInterval(() => {
        elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Сохраняем время в sessionStorage
        sessionStorage.setItem('testTime', elapsedSeconds.toString());
    }, 1000);
}

// Обработка отправки теста
function handleTestSubmit(e) {
    e.preventDefault();
    
    const testId = sessionStorage.getItem('currentTestId');
    const tests = JSON.parse(localStorage.getItem('tests'));
    const test = tests.find(t => t.id === testId);
    
    if (!test) return;
    
    // Проверяем ответы
    let correctAnswers = 0;
    const userAnswers = [];
    
    test.questions.forEach((question, qIndex) => {
        const selectedAnswer = document.querySelector(`input[name="q${qIndex}"]:checked`);
        
        if (selectedAnswer) {
            const answerIndex = parseInt(selectedAnswer.value);
            userAnswers.push(answerIndex);
            
            // Сравниваем индекс выбранного ответа с правильным ответом (question.answer содержит номер правильного ответа)
            if (answerIndex === question.answer) {
                correctAnswers++;
            }
        } else {
            userAnswers.push(null);
        }
    });
    
    // Рассчитываем оценку по 5-балльной системе
    const totalQuestions = test.questions.length;
    const percentage = (correctAnswers / totalQuestions) * 100;
    let grade;
    
    if (percentage >= 85) grade = 5;
    else if (percentage >= 70) grade = 4;
    else if (percentage >= 50) grade = 3;
    else grade = 2;
    
    // Сохраняем результат
    const result = {
        id: Date.now().toString(),
        testId: testId,
        testTitle: test.title,
        subject: test.subject,
        studentName: sessionStorage.getItem('studentName'),
        studentClass: sessionStorage.getItem('studentClass'),
        teacher: test.teacher,
        correctAnswers: correctAnswers,
        totalQuestions: totalQuestions,
        percentage: percentage,
        grade: grade,
        timeSpent: parseInt(sessionStorage.getItem('testTime') || '0'),
        completedAt: new Date().toISOString(),
        userAnswers: userAnswers
    };
    
    // Сохраняем результат
    const results = JSON.parse(localStorage.getItem('results'));
    results.push(result);
    localStorage.setItem('results', JSON.stringify(results));
    
    // Сохраняем результат в sessionStorage для отображения
    sessionStorage.setItem('lastResult', JSON.stringify(result));
    
    // Перенаправляем на страницу результата
    window.location.href = 'result.html';
}