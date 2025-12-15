// Управление тестами и результатами
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация данных, если их нет
    initializeTestData();
    
    // Загрузка предметов на главной странице
    loadSubjects();
    
    // Загрузка тестов учителя
    if (window.location.pathname.includes('teacher-panel.html')) {
        loadTeacherTests();
    }
    
    // Обработка создания теста
    const testForm = document.getElementById('testForm');
    if (testForm) {
        testForm.addEventListener('submit', handleTestCreation);
        
        // Добавление вопроса
        const addQuestionBtn = document.getElementById('addQuestionBtn');
        if (addQuestionBtn) {
            addQuestionBtn.addEventListener('click', addQuestionField);
        }
    }
});

// Инициализация тестовых данных
function initializeTestData() {
    if (!localStorage.getItem('subjects')) {
        const defaultSubjects = [
            {
                id: 'math',
                name: 'Математика',
                icon: 'fas fa-calculator',
                description: 'Тесты по алгебре и геометрии',
                color: 'math'
            },
            {
                id: 'physics',
                name: 'Физика',
                icon: 'fas fa-atom',
                description: 'Законы физики и задачи',
                color: 'physics'
            },
            {
                id: 'history',
                name: 'История',
                icon: 'fas fa-landmark',
                description: 'Исторические события и даты',
                color: 'history'
            },
            {
                id: 'literature',
                name: 'Литература',
                icon: 'fas fa-book-open',
                description: 'Произведения и авторы',
                color: 'literature'
            },
            {
                id: 'biology',
                name: 'Биология',
                icon: 'fas fa-dna',
                description: 'Живые организмы и природа',
                color: 'biology'
            },
            {
                id: 'chemistry',
                name: 'Химия',
                icon: 'fas fa-flask',
                description: 'Химические элементы и реакции',
                color: 'chemistry'
            }
        ];
        localStorage.setItem('subjects', JSON.stringify(defaultSubjects));
    }
    
    if (!localStorage.getItem('tests')) {
        localStorage.setItem('tests', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('results')) {
        localStorage.setItem('results', JSON.stringify([]));
    }
}

// Загрузка предметов на главной странице
function loadSubjects() {
    const subjectsGrid = document.getElementById('subjectsGrid');
    if (!subjectsGrid) return;
    
    const subjects = JSON.parse(localStorage.getItem('subjects'));
    const tests = JSON.parse(localStorage.getItem('tests'));
    
    subjectsGrid.innerHTML = '';
    
    subjects.forEach(subject => {
        // Подсчет тестов по предмету
        const subjectTests = tests.filter(test => test.subject === subject.id);
        
        const subjectCard = document.createElement('div');
        subjectCard.className = `subject-card ${subject.color}`;
        subjectCard.innerHTML = `
            <div class="subject-icon">
                <i class="${subject.icon}"></i>
            </div>
            <h3>${subject.name}</h3>
            <p>${subject.description}</p>
            <div class="subject-tests">
                <i class="fas fa-clipboard-list"></i>
                Доступно тестов: ${subjectTests.length}
            </div>
            <button class="btn btn-primary mt-2" onclick="startSubjectTest('${subject.id}')">
                <i class="fas fa-play"></i> Выбрать тест
            </button>
        `;
        
        subjectsGrid.appendChild(subjectCard);
    });
}

// Начать тест по предмету
function startSubjectTest(subjectId) {
    // Сохраняем выбранный предмет
    sessionStorage.setItem('selectedSubject', subjectId);
    
    // Перенаправляем на страницу теста
    window.location.href = 'test.html';
}

// Загрузка тестов учителя
function loadTeacherTests() {
    const testsList = document.getElementById('testsList');
    if (!testsList) return;
    
    const tests = JSON.parse(localStorage.getItem('tests'));
    const currentTeacher = getCurrentTeacher();
    
    // Фильтруем тесты текущего учителя
    const teacherTests = tests.filter(test => test.teacher === currentTeacher);
    
    if (teacherTests.length === 0) {
        testsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list fa-3x"></i>
                <h3>У вас пока нет тестов</h3>
                <p>Создайте свой первый тест, нажав кнопку "Создать тест"</p>
            </div>
        `;
        return;
    }
    
    testsList.innerHTML = '';
    
    teacherTests.forEach((test, index) => {
        const testCard = document.createElement('div');
        testCard.className = 'test-card';
        testCard.innerHTML = `
            <div class="test-header">
                <h3>${test.title}</h3>
                <span class="test-subject">${getSubjectName(test.subject)}</span>
            </div>
            <div class="test-info">
                <p><i class="fas fa-question-circle"></i> Вопросов: ${test.questions.length}</p>
                <p><i class="fas fa-user-graduate"></i> Прошли: ${getTestResultsCount(test.id)} учеников</p>
            </div>
            <div class="test-actions">
                <button class="btn btn-secondary" onclick="editTest('${test.id}')">
                    <i class="fas fa-edit"></i> Редактировать
                </button>
                <button class="btn btn-danger" onclick="deleteTest('${test.id}')">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            </div>
        `;
        
        testsList.appendChild(testCard);
    });
}

// Получение названия предмета по ID
function getSubjectName(subjectId) {
    const subjects = JSON.parse(localStorage.getItem('subjects'));
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : subjectId;
}

// Получение количества результатов теста
function getTestResultsCount(testId) {
    const results = JSON.parse(localStorage.getItem('results'));
    return results.filter(result => result.testId === testId).length;
}

// Создание нового теста
function handleTestCreation(e) {
    e.preventDefault();
    
    const title = document.getElementById('testTitle').value;
    const subject = document.getElementById('testSubject').value;
    const description = document.getElementById('testDescription').value;
    
    // Сбор вопросов
    const questions = [];
    const questionElements = document.querySelectorAll('.question-item');
    
    questionElements.forEach((item, index) => {
        const questionText = item.querySelector('.question-text').value;
        const answers = [];
        
        // Сбор ответов
        const answerInputs = item.querySelectorAll('.answer-input');
        const correctAnswerIndex = parseInt(item.querySelector('.correct-answer').value);
        
        answerInputs.forEach((input) => {
            if (input.value.trim()) {
                answers.push(input.value.trim());
            }
        });
        
        if (questionText.trim() && answers.length >= 2) {
            questions.push({
                id: Date.now() + index,
                text: questionText,
                opts: answers,
                answer: correctAnswerIndex
            });
        }
    });
    
    if (questions.length === 0) {
        alert('Добавьте хотя бы один вопрос с ответами');
        return;
    }
    
    // Создание теста
    const test = {
        id: Date.now().toString(),
        title: title,
        subject: subject,
        description: description,
        teacher: getCurrentTeacher(),
        questions: questions,
        createdAt: new Date().toISOString()
    };
    
    // Сохранение теста
    const tests = JSON.parse(localStorage.getItem('tests'));
    tests.push(test);
    localStorage.setItem('tests', JSON.stringify(tests));
    
    alert('Тест успешно создан!');
    window.location.href = 'teacher-panel.html';
}

// Добавление поля вопроса
function addQuestionField() {
    const questionsContainer = document.getElementById('questionsContainer');
    const questionIndex = document.querySelectorAll('.question-item').length;
    
    const questionItem = document.createElement('div');
    questionItem.className = 'question-item';
    questionItem.innerHTML = `
        <div class="question-header">
            <h4>Вопрос ${questionIndex + 1}</h4>
            <button type="button" class="btn btn-danger btn-sm" onclick="removeQuestion(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="form-group">
            <label>Текст вопроса</label>
            <textarea class="question-text" rows="3" placeholder="Введите текст вопроса" required></textarea>
        </div>
        <div class="form-group">
            <label>Варианты ответов</label>
            <div class="answers-container">
                <input type="text" class="answer-input" placeholder="Вариант ответа 1" required>
                <input type="text" class="answer-input" placeholder="Вариант ответа 2" required>
                <input type="text" class="answer-input" placeholder="Вариант ответа 3">
                <input type="text" class="answer-input" placeholder="Вариант ответа 4">
            </div>
        </div>
        <div class="form-group">
            <label>Правильный ответ</label>
            <select class="correct-answer" required>
                <option value="0">Вариант 1</option>
                <option value="1">Вариант 2</option>
                <option value="2">Вариант 3</option>
                <option value="3">Вариант 4</option>
            </select>
        </div>
    `;
    
    questionsContainer.appendChild(questionItem);
}

// Удаление вопроса
function removeQuestion(button) {
    const questionItem = button.closest('.question-item');
    questionItem.remove();
    
    // Обновляем нумерацию вопросов
    const questions = document.querySelectorAll('.question-item');
    questions.forEach((item, index) => {
        const header = item.querySelector('.question-header h4');
        header.textContent = `Вопрос ${index + 1}`;
    });
}

// Редактирование теста
function editTest(testId) {
    sessionStorage.setItem('editingTestId', testId);
    window.location.href = 'test-editor.html';
}

// Удаление теста
function deleteTest(testId) {
    if (confirm('Вы уверены, что хотите удалить этот тест?')) {
        let tests = JSON.parse(localStorage.getItem('tests'));
        tests = tests.filter(test => test.id !== testId);
        localStorage.setItem('tests', JSON.stringify(tests));
        
        // Обновляем список тестов
        loadTeacherTests();
    }
}