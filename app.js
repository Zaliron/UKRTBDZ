let tg = window.Telegram.WebApp;
tg.expand();

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

// Функция для отображения списка предметов
function renderSubjects() {
    const subjectsList = document.getElementById('subjects-list');
    
    Object.entries(SUBJECTS).forEach(([subject, emoji]) => {
        const card = document.createElement('div');
        card.className = 'subject-card';
        card.onclick = () => viewSubject(subject);
        
        card.innerHTML = `
            <div class="subject-title">${emoji} ${subject}</div>
            <div class="subject-status">Нажмите для просмотра</div>
        `;
        
        subjectsList.appendChild(card);
    });
}

// Функция для просмотра предмета
function viewSubject(subject) {
    tg.sendData(JSON.stringify({
        action: 'view_subject',
        subject: subject
    }));
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    renderSubjects();
    tg.ready();
}); 
