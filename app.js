let tg = window.Telegram.WebApp;
let currentSubject = null;
let userGroup = null;

const isDarkTheme = window.Telegram.WebApp.colorScheme === 'dark';

const SUBJECT_EMOJI = {
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

const SUBJECTS = Object.keys(SUBJECT_EMOJI);

const STATUS_EMOJI = {
    'new': '🆕',
    'viewed': '👁️',
    'completed': '✅'
};

const GROUPS = {
    "9ИСП-12К-24": "9isp12k24",
    "9КСК-10-24": "9ksk1024",
    "9ИСП-111К-24": "9isp111k24",
    "9ИКСС-13-24": "9ikss1324"
};

tg.MainButton.textColor = '#FFFFFF';
tg.MainButton.color = '#2481cc';

document.addEventListener('DOMContentLoaded', () => {
    tg.expand();
    initializeApp();
});

async function initializeApp() {
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
    }
    // Получаем группу пользователя из параметров URL или из бота
    const urlParams = new URLSearchParams(window.location.search);
    userGroup = urlParams.get('group') || await getUserGroup();

    if (!userGroup) {
        showGroupSelection();
    } else {
        showSubjects();
    }

    setupEventListeners();
}

function setupEventListeners() {
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', () => {
            showSubjects();
        });
    });

    document.getElementById('mark-done').addEventListener('click', () => {
        markHomeworkDone(currentSubject);
    });

    document.getElementById('upload-solution').addEventListener('click', () => {
        uploadSolution(currentSubject);
    });
}

async function getUserGroup() {
    try {
        tg.sendData(JSON.stringify({
            action: 'get_user_group'
        }));
        return new Promise((resolve) => {
            tg.onEvent('message', (message) => {
                resolve(message.group);
            });
        });
    } catch (error) {
        showNotification('Ошибка получения группы');
        return null;
    }
}

function showGroupSelection() {
    const container = document.getElementById('subjects-container');
    container.innerHTML = `
        <h2>Выберите вашу группу</h2>
        <div class="group-buttons">
            ${Object.entries(GROUPS).map(([name, code]) => `
                <button class="subject-button" data-group="${code}">
                    👥 ${name}
                </button>
            `).join('')}
        </div>
    `;

    container.querySelectorAll('[data-group]').forEach(button => {
        button.addEventListener('click', () => {
            selectGroup(button.dataset.group);
        });
    });
}

async function selectGroup(group) {
    try {
        await tg.sendData(JSON.stringify({
            action: 'select_group',
            group: group
        }));
        userGroup = group;
        showSubjects();
    } catch (error) {
        showNotification('Ошибка при выборе группы');
    }
}

function showSubjects() {
    const container = document.getElementById('subjects-container');
    container.classList.remove('hidden');
    document.getElementById('homework-container').classList.add('hidden');
    document.getElementById('archive-container').classList.add('hidden');

    container.innerHTML = SUBJECTS.map(subject => `
        <button class="subject-button" data-subject="${subject}">
            <span class="subject-emoji">${SUBJECT_EMOJI[subject]}</span>
            ${subject}
            <span class="status-badge" id="status-${subject}"></span>
        </button>
    `).join('');

    container.querySelectorAll('[data-subject]').forEach(button => {
        button.addEventListener('click', () => {
            showHomework(button.dataset.subject);
        });
    });

    updateSubjectStatuses();
}

async function updateSubjectStatuses() {
    try {
        const response = await tg.sendData(JSON.stringify({
            action: 'get_statuses',
            group: userGroup
        }));

        Object.entries(response.statuses).forEach(([subject, status]) => {
            const badge = document.getElementById(`status-${subject}`);
            if (badge) {
                badge.className = `status-badge status-${status}`;
                badge.textContent = STATUS_EMOJI[status];
            }
        });
    } catch (error) {
        console.error('Ошибка при обновлении статусов:', error);
    }
}

async function showHomework(subject) {
    currentSubject = subject;
    try {
        const response = await tg.sendData(JSON.stringify({
            action: 'get_homework',
            subject: subject,
            group: userGroup
        }));

        document.getElementById('subjects-container').classList.add('hidden');
        const homeworkContainer = document.getElementById('homework-container');
        homeworkContainer.classList.remove('hidden');

        document.getElementById('current-subject').textContent = 
            `${SUBJECT_EMOJI[subject]} ${subject}`;

        const content = document.getElementById('homework-content');
        content.innerHTML = `
            <div class="homework-text">${response.text}</div>
            <div class="homework-info">
                <div>📅 Дата: ${response.date}</div>
                <div>👤 Автор: ${response.author}</div>
            </div>
        `;

        const filesContainer = document.getElementById('homework-files');
        filesContainer.innerHTML = response.files.map(file => `
            <div class="file-item">
                <span class="file-icon">${file.type === 'photo' ? '🖼️' : '📎'}</span>
                <span class="file-name">Прикрепленный файл</span>
            </div>
        `).join('');

        updateHomeworkActions(response.status);
    } catch (error) {
        showNotification('Ошибка при загрузке задания');
    }
}

function updateHomeworkActions(status) {
    const markDoneButton = document.getElementById('mark-done');
    const uploadSolutionButton = document.getElementById('upload-solution');

    if (status === 'completed') {
        markDoneButton.style.display = 'none';
        uploadSolutionButton.style.display = 'none';
    } else {
        markDoneButton.style.display = 'block';
        uploadSolutionButton.style.display = 'block';
    }
}

async function markHomeworkDone(subject) {
    try {
        await tg.sendData(JSON.stringify({
            action: 'mark_done',
            subject: subject,
            group: userGroup
        }));
        showNotification('Задание отмечено как выполненное');
        updateSubjectStatuses();
    } catch (error) {
        showNotification('Ошибка при отметке задания');
    }
}

async function uploadSolution(subject) {
    try {
        tg.MainButton.setText('Загрузить решение');
        tg.MainButton.show();
        tg.MainButton.onClick(() => {
            tg.sendData(JSON.stringify({
                action: 'upload_solution',
                subject: subject,
                group: userGroup
            }));
        });
    } catch (error) {
        showNotification('Ошибка при загрузке решения');
    }
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Добавляем обработчик для получения данных от бота
tg.onEvent('viewportChanged', () => {
    tg.expand();
});

document.addEventListener("DOMContentLoaded", function() {
    const groupInfo = document.getElementById('group-info');

    // Пример функции для получения данных о группе
    function fetchGroupData() {
        // Здесь должен быть ваш код для получения данных
        // Например, через fetch или XMLHttpRequest
        fetch('/api/group')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    groupInfo.textContent = `Группа: ${data.groupName}`;
                } else {
                    showError('Ошибка получения группы');
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                showError('Ошибка получения группы');
            });
    }

    function showError(message) {
        const errorContainer = document.getElementById('error-container');
        errorContainer.querySelector('.error-message').textContent = message;
    }

    fetchGroupData();
});
