// Функции для работы с домашними заданиями
const HomeworkManager = {
    // Загрузка данных из localStorage
    loadHomework() {
        const data = localStorage.getItem('homework');
        return data ? JSON.parse(data) : this.initializeEmptyData();
    },

    // Сохранение данных в localStorage
    saveHomework(data) {
        localStorage.setItem('homework', JSON.stringify(data));
    },

    // Инициализация пустой структуры данных
    initializeEmptyData() {
        const groups = ['9ИСП-12К-24', '9КСК-10-24', '9ИСП-111К-24', '9ИКСС-13-24'];
        const subjects = [
            'Башкирский язык', 'Биология', 'География', 'Иностранный язык',
            'Информатика', 'История', 'Литература', 'Математика',
            'Обществознание: право', 'Обществознание: экономика',
            'Основы безопасности и защиты Родины', 'Русский язык',
            'Физика', 'Физическая культура', 'Химия'
        ];

        const data = {};
        groups.forEach(group => {
            data[group] = {};
            subjects.forEach(subject => {
                data[group][subject] = {
                    text: "Пока нет заданий",
                    files: [],
                    date: new Date().toLocaleString('ru-RU'),
                    author: "System"
                };
            });
            data[group].files = [];
        });

        return data;
    },

    // Добавление нового задания
    addAssignment(group, subject, text, files, author) {
        const data = this.loadHomework();
        if (!data[group]) {
            data[group] = {};
        }
        if (!data[group][subject]) {
            data[group][subject] = {};
        }

        data[group][subject] = {
            text,
            files: files || [],
            date: new Date().toLocaleString('ru-RU'),
            author
        };

        this.saveHomework(data);
        
        // Добавляем в архив старое задание, если оно было
        const oldAssignment = data[group][subject];
        if (oldAssignment && oldAssignment.text !== "Пока нет заданий") {
            HomeworkArchive.archiveAssignment(group, subject, oldAssignment);
        }
    },

    // Получение задания
    getAssignment(group, subject) {
        const data = this.loadHomework();
        return data[group]?.[subject] || null;
    },

    // Получение всех заданий для группы
    getGroupAssignments(group) {
        const data = this.loadHomework();
        return data[group] || {};
    }
};

// Экспорт для использования в других файлах
export default HomeworkManager; 
