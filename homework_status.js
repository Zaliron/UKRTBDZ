// Функции для работы со статусами домашних заданий
const HomeworkStatus = {
    // Загрузка статусов из localStorage
    loadStatus() {
        const data = localStorage.getItem('homework_status');
        return data ? JSON.parse(data) : {};
    },

    // Сохранение статусов в localStorage
    saveStatus(data) {
        localStorage.setItem('homework_status', JSON.stringify(data));
    },

    // Обновление статуса задания для пользователя
    updateStatus(userId, group, subject, status) {
        const statusData = this.loadStatus();
        
        if (!statusData[group]) {
            statusData[group] = {};
        }
        if (!statusData[group][subject]) {
            statusData[group][subject] = {};
        }
        if (!statusData[group][subject][userId]) {
            statusData[group][subject][userId] = {};
        }

        statusData[group][subject][userId] = {
            status,
            updated_at: new Date().toLocaleString('ru-RU')
        };

        this.saveStatus(statusData);
    },

    // Получение статуса задания для пользователя
    getStatus(userId, group, subject) {
        const statusData = this.loadStatus();
        return statusData[group]?.[subject]?.[userId] || { status: 'new', updated_at: null };
    },

    // Получение всех статусов пользователя для группы
    getUserGroupStatus(userId, group) {
        const statusData = this.loadStatus();
        const groupStatus = {};
        
        if (statusData[group]) {
            Object.keys(statusData[group]).forEach(subject => {
                groupStatus[subject] = statusData[group][subject][userId] || { status: 'new', updated_at: null };
            });
        }

        return groupStatus;
    },

    // Сброс статусов при обновлении задания
    resetSubjectStatus(group, subject) {
        const statusData = this.loadStatus();
        
        if (statusData[group]?.[subject]) {
            Object.keys(statusData[group][subject]).forEach(userId => {
                statusData[group][subject][userId] = {
                    status: 'new',
                    updated_at: new Date().toLocaleString('ru-RU')
                };
            });
            this.saveStatus(statusData);
        }
    }
}; 
