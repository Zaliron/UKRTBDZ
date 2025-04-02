let tg = window.Telegram.WebApp;
tg.expand(); // Расширяем на весь экран 

// Получаем данные от бота
const initData = tg.initDataUnsafe || {};
const user = initData.user || {};

// Константы из бота
const GROUPS = {
    "9ИСП-12К-24": "9isp12k24",
    "9КСК-10-24": "9ksk1024",
    "9ИСП-111К-24": "9isp111k24",
    "9ИКСС-13-24": "9ikss1324"
};

// Предметы с эмодзи
const SUBJECTS = {
    "Башкирский язык": "📚",
    "Биология": "🧬",
    "География": "🌍",
    "Иностранный язык": "🌐",
    "Информатика": "💻",
    "История": "📜",
    "Литература": "📖",
    "Математика": "🔢",
    "Обществознание: право": "⚖️",
    "Обществознание: экономика": "📊",
    "Основы безопасности и защиты Родины": "🛡️",
    "Русский язык": "✍️",
    "Физика": "⚡",
    "Физическая культура": "🏃",
    "Химия": "🧪"
};

const STATUS_EMOJI = {
    'new': '🆕',
    'updated': '🔄',
    'loading': '⏳',
    'success': '✅',
    'error': '❌'
};

// Состояние приложения
const state = {
    currentGroup: null,
    currentSubject: null,
    currentView: 'groups', // Всегда начинаем с выбора группы
    isSubscribed: false
};

// Функция для отображения выбора группы
function renderGroupSelector() {
    // Если пользователь уже выбрал группу в боте, пропускаем выбор
    if (initData.start_param) {
        selectGroup(initData.start_param);
        return;
    }
    
    const groupSelector = document.getElementById('group-selector');
    groupSelector.style.display = 'block';
    const groups = Object.entries(GROUPS);
    
    const groupButtons = groups.map(([name, id]) => `
        <button class="group-button action-button" onclick="selectGroup('${id}', '${name}')">
            👥 ${name}
        </button>
    `).join('');
    
    groupSelector.innerHTML = `
        <div class="group-selector">
            <h2>Выберите группу:</h2>
            ${groupButtons}
        </div>
    `;
}

// Функция выбора группы
function selectGroup(groupId, groupName) {
    state.currentGroup = groupId;
    state.currentView = 'subjects';
    
    // Сохраняем выбор группы через бота
    tg.sendData(JSON.stringify({
        action: 'select_group',
        group: groupId
    }));
    
    renderSubjects();
}

// Функция для отображения списка предметов
function renderSubjects() {
    document.getElementById('group-selector').style.display = 'none';
    const subjectsList = document.getElementById('subjects-list');
    subjectsList.style.display = 'block';
    
    const subjectsHtml = Object.entries(SUBJECTS).map(([subject, emoji]) => `
        <div class="subject-card" onclick="viewSubject('${subject}')">
            <div class="subject-title">${emoji} ${subject}</div>
            <div class="subject-status">Нажмите для просмотра</div>
        </div>
    `).join('');
    
    subjectsList.innerHTML = `
        <div class="subjects-header">
            <h2>Предметы</h2>
            <button class="action-button back-button" onclick="goBack()">« Назад</button>
            <button class="action-button" onclick="showNotificationSettings()">
                🔔 Уведомления
            </button>
        </div>
        ${subjectsHtml}
    `;
}

// Функция для просмотра предмета
function viewSubject(subject) {
    state.currentSubject = subject;
    state.currentView = 'homework';
    
    document.getElementById('subjects-list').style.display = 'none';
    const homeworkView = document.getElementById('homework-view');
    homeworkView.style.display = 'block';
    
    // Запрашиваем данные через бота
    tg.sendData(JSON.stringify({
        action: 'get_homework',
        subject: subject,
        group: state.currentGroup
    }));
    
    // Показываем загрузку
    renderHomeworkPlaceholder(subject);
}

// Функция для отображения заглушки домашнего задания
function renderHomeworkPlaceholder(subject) {
    const content = document.getElementById('homework-content');
    
    content.innerHTML = `
        <div class="homework-header">
            <h2>${SUBJECTS[subject]} ${subject}</h2>
            <button class="action-button back-button" onclick="goBack()">« Назад</button>
        </div>
        <div class="homework-content">
            <div class="loading">
                ${STATUS_EMOJI.loading} Загрузка задания...
            </div>
        </div>
    `;
}

// Функция для возврата назад
function goBack() {
    if (state.currentView === 'homework') {
        state.currentView = 'subjects';
        state.currentSubject = null;
        document.getElementById('homework-view').style.display = 'none';
        document.getElementById('subjects-list').style.display = 'block';
    } else if (state.currentView === 'subjects') {
        state.currentView = 'groups';
        state.currentGroup = null;
        document.getElementById('subjects-list').style.display = 'none';
        document.getElementById('group-selector').style.display = 'block';
    }
}

// Функции для работы с уведомлениями
function showNotificationSettings() {
    const notificationSettings = document.getElementById('notification-settings');
    notificationSettings.style.display = 'block';
    
    const subscribeBtn = document.getElementById('subscribe-btn');
    subscribeBtn.textContent = state.isSubscribed ? 
        '🔕 Отписаться от уведомлений' : 
        '🔔 Подписаться на уведомления';
}

function toggleNotifications() {
    tg.sendData(JSON.stringify({
        action: state.isSubscribed ? 'unsubscribe' : 'subscribe'
    }));
}

// Обработчик событий от Telegram WebApp
tg.onEvent('viewportChanged', function(){
    // Обновляем размеры при изменении viewport
    tg.expand();
});

// В начале файла добавим обработчик сообщений от бота
tg.onEvent('message', function(message) {
    try {
        const data = JSON.parse(message.text);
        if (data.type === 'homework_data') {
            renderHomework(data);
        }
    } catch (e) {
        console.error('Error parsing message:', e);
    }
});

// Обновим функцию renderHomework
function renderHomework(homework) {
    const content = document.getElementById('homework-content');
    const files = document.getElementById('homework-files');
    const actions = document.getElementById('homework-actions');
    
    content.innerHTML = `
        <div class="homework-header">
            <h2>${SUBJECTS[homework.subject]} ${homework.subject}</h2>
            <button class="action-button back-button" onclick="goBack()">« Назад</button>
        </div>
        <div class="homework-content">
            <p>${homework.text}</p>
            <div class="homework-info">
                <small>Добавлено: ${homework.date}</small>
                <small>Автор: ${homework.author}</small>
            </div>
        </div>
    `;
    
    // Отображаем файлы, если они есть
    if (homework.files && homework.files.length > 0) {
        files.innerHTML = homework.files.map(file => `
            <div class="homework-file">
                ${file.file_type === 'photo' 
                    ? `<img src="${file.file_id}" class="file-preview" />`
                    : `<a href="#" class="file-link" onclick="downloadFile('${file.file_id}')">
                        📎 Скачать файл
                      </a>`
                }
            </div>
        `).join('');
    }
    
    // Добавляем кнопки действий
    actions.innerHTML = `
        <button class="action-button" onclick="markAsComplete()">
            ✅ Отметить выполненным
        </button>
    `;
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    renderGroupSelector(); // Всегда начинаем с выбора группы
    tg.ready();
}); 
