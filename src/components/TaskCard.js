import { store } from '../utils/Store.js';

export default class TaskCard {
    constructor(task) {
        this.task = task;
        this.element = this.create();
    }

    create() {
        const div = document.createElement('div');
        div.className = `card task-card type-${this.task.type} ${this.task.completed ? 'completed' : ''}`;

        const icon = this.getIcon(this.task.type);

        // Conditional Extras
        const extras = [];
        if (this.task.location) {
            extras.push(`<div class="task-extra"><span class="material-symbols-rounded">location_on</span>${this.task.location}</div>`);
        }
        if (this.task.notes) {
            extras.push(`<div class="task-extra"><span class="material-symbols-rounded">text_snippet</span>${this.task.notes}</div>`);
        }

        div.innerHTML = `
            <div class="task-icon-container">
                <span class="material-symbols-rounded">${icon}</span>
            </div>
            <div class="task-content">
                <h3 class="task-title">${this.task.title}</h3>
                <span class="task-time">${this.formatTime(this.task.time)}</span>
                ${extras.length ? `<div class="task-extras">${extras.join('')}</div>` : ''}
            </div>
            <div class="task-actions">
                <button class="btn btn-icon edit-btn" title="Edit Task">
                    <span class="material-symbols-rounded">edit</span>
                </button>
                <button class="btn btn-icon check-btn" title="Complete Task">
                    <span class="material-symbols-rounded">check</span>
                </button>
            </div>
        `;

        div.querySelector('.edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.editTask();
        });

        div.querySelector('.check-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleComplete();
        });



        return div;
    }

    getIcon(type) {
        switch (type) {
            case 'school': return 'menu_book';
            case 'house': return 'cleaning_services';
            case 'appointment': return 'event';
            case 'work': return 'work'; // Material symbol for briefcase
            default: return 'task';
        }
    }

    toggleComplete() {
        store.toggleTask(this.task.id);
    }

    editTask() {
        if (window.app && window.app.addModal) {
            window.app.addModal.openForEdit(this.task);
        }
    }

    formatTime(timeStr) {
        if (!timeStr) return 'No Date';

        // Check if it's a full ISO string (has 'T')
        if (timeStr.includes('T')) {
            const date = new Date(timeStr);
            if (isNaN(date.getTime())) return timeStr;
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            // It is just YYYY-MM-DD
            const parts = timeStr.split('-');
            if (parts.length === 3) {
                const date = new Date(parts[0], parts[1] - 1, parts[2]);
                return date.toLocaleDateString();
            }
            return timeStr;
        }
    }
}
