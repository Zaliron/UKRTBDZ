// Функции для работы с архивом домашних заданий
const HomeworkArchive = {
    // Загрузка архива из localStorage
    loadArchive() {
        const data = localStorage.getItem('homework_archive');
        return data ? JSON.parse(data) : {};
    },

    // Сохранение архива в localStorage
    saveArchive(data) {
        localStorage.setItem('homework_archive', JSON.stringify(data));
    },

    // Архивация задания
    archiveAssignment(group, subject, assignment) {
        const archive = this.loadArchive();
        
        if (!archive[group]) {
            archive[group] = {};
        }
        if (!archive[group][subject]) {
            archive[group][subject] = [];
        }

        // Добавляем дату архивации
        const archivedAssignment = {
            ...assignment,
            archived_at: new Date().toLocaleString('ru-RU')
        };

        archive[group][subject].push(archivedAssignment);
        this.saveArchive(archive);
    },

    // Получение архивных заданий для предмета
    getArchivedAssignments(group, subject) {
        const archive = this.loadArchive();
        return archive[group]?.[subject] || [];
    },

    // Получение всех архивных заданий для группы
    getGroupArchive(group) {
        const archive = this.loadArchive();
        return archive[group] || {};
    },

    // Восстановление задания из архива
    restoreAssignment(group, subject, assignmentIndex) {
        const archive = this.loadArchive();
        if (!archive[group]?.[subject]?.[assignmentIndex]) {
            return null;
        }

        const assignment = archive[group][subject][assignmentIndex];
        archive[group][subject].splice(assignmentIndex, 1);
        this.saveArchive(archive);

        return assignment;
    }
};

// Экспорт для использования в других файлах
export default HomeworkArchive; 
