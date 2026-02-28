import TaskCard from '../components/TaskCard.js';
import { store } from '../utils/Store.js';

export default class Dashboard {
    constructor(container) {
        this.container = container;
        this.render();
        this.unsubscribe = store.subscribe(() => this.updateView());
    }

    render() {
        const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
        const dateStr = new Date().toLocaleDateString(undefined, dateOptions);

        const hour = new Date().getHours();
        let greeting = 'Good Morning';
        if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
        if (hour >= 17) greeting = 'Good Evening';

        const QUOTES = [
            "The secret of getting ahead is getting started.",
            "It does not matter how slowly you go as long as you do not stop.",
            "You don't have to be great to start, but you have to start to be great.",
            "Do what you can, with what you have, where you are.",
            "Small steps every day.",
            "Focus on being productive instead of busy.",
            "One thing at a time.",
            "Done is better than perfect.",
            "Progress, not perfection.",
            "Don't let yesterday take up too much of today.",
            "Your future is created by what you do today, not tomorrow.",
            "Believe you can and you're halfway there.",
            "You are capable of amazing things.",
            "Strive for progress, not perfection.",
            "Every day is a fresh start."
        ];

        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const dailyQuote = QUOTES[dayOfYear % QUOTES.length];

        this.container.innerHTML = `
            <div class="dashboard-grid">
                <section class="welcome-section">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h2>${greeting}! ☀️</h2>
                            <p class="date-header">${dateStr}</p>
                            <p class="daily-quote">"${dailyQuote}"</p>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
                            <div class="points-badge" style="background: var(--md-sys-color-tertiary-container); color: var(--md-sys-color-on-tertiary-container); padding: 8px 16px; border-radius: 16px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                                <span class="material-symbols-rounded">military_tech</span>
                                <span id="points-display">0</span> Focus Points
                            </div>
                            <button id="add-general-btn" class="btn btn-primary" style="padding: 6px 16px; font-size: 14px;">
                                <span class="material-symbols-rounded" style="font-size: 18px;">add</span>
                                New Task
                            </button>
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                         <p style="margin: 0;">You have <strong id="total-count">0</strong> items to focus on today.</p>
                    </div>
                </section>

                <div id="fresh-start-container"></div>

                <section class="task-column">
                    <div class="section-header">
                        <h3>Today</h3>
                        <span id="urgent-count" class="badge">0</span>
                    </div>
                    <div id="urgent-tasks" class="task-list"></div>
                </section>

                <section class="task-column">
                    <div class="section-header">
                        <h3>Up Next</h3>
                        <span id="later-count" class="badge">0</span>
                    </div>
                    <div id="later-tasks" class="task-list"></div>
                </section>
            </div>
        `;

        this.container.querySelector('#add-general-btn').addEventListener('click', () => {
            window.app.addModal.open();
        });

        this.updateView();
    }

    updateView() {
        // Fresh Start Logic
        const overdue = store.getOverdueTasks();
        const freshStartContainer = this.container.querySelector('#fresh-start-container');

        if (overdue.length > 0) {
            freshStartContainer.innerHTML = `
                <div class="fresh-start-card">
                    <div class="fs-header">
                        <span class="material-symbols-rounded" style="color: var(--md-sys-color-error);">warning</span>
                        <h3>Missed Tasks (${overdue.length})</h3>
                    </div>
                    <div class="fs-list"></div>
                </div>
            `;
            const list = freshStartContainer.querySelector('.fs-list');
            overdue.forEach(t => {
                list.appendChild(this.createMissedTaskRow(t));
            });
        } else {
            freshStartContainer.innerHTML = '';
        }

        const tasks = store.getTasks(t => !t.completed); // Only show pending

        const todayDate = new Date();
        const todayStr = todayDate.toISOString().split('T')[0];

        // 7 days from now
        const nextWeekDate = new Date(todayDate);
        nextWeekDate.setDate(todayDate.getDate() + 7);
        const nextWeekStr = nextWeekDate.toISOString().split('T')[0];

        // Urgent: Tasks due exactly today
        const urgent = tasks.filter(t => t.time && t.time.includes(todayStr));

        // Up Next: Tasks due in the next 7 days (excluding today) and tasks with no exact date
        const later = tasks.filter(t => {
            if (!t.time || t.time === 'No Due Date') return true;

            // Extract the date part assuming 'YYYY-MM-DD' or 'YYYY-MM-DDT...' format from Store
            const taskDateMatch = t.time.match(/^\d{4}-\d{2}-\d{2}/);
            if (!taskDateMatch) return false;

            const taskDateStr = taskDateMatch[0];
            return taskDateStr > todayStr && taskDateStr <= nextWeekStr;
        });

        // Update Counts
        const totalEl = this.container.querySelector('#total-count');
        if (totalEl) totalEl.textContent = tasks.length;

        const urgentBadge = this.container.querySelector('#urgent-count');
        if (urgentBadge) urgentBadge.textContent = urgent.length;

        const laterBadge = this.container.querySelector('#later-count');
        if (laterBadge) laterBadge.textContent = later.length;

        const pointsEl = this.container.querySelector('#points-display');
        if (pointsEl) pointsEl.textContent = store.state.points || 0;

        // Render Lists
        const urgentContainer = this.container.querySelector('#urgent-tasks');
        const laterContainer = this.container.querySelector('#later-tasks');

        if (urgentContainer) {
            urgentContainer.innerHTML = '';
            urgent.forEach(t => urgentContainer.appendChild(new TaskCard(t).element));
        }

        if (laterContainer) {
            laterContainer.innerHTML = '';
            later.forEach(t => laterContainer.appendChild(new TaskCard(t).element));
        }
    }

    createMissedTaskRow(task) {
        const div = document.createElement('div');
        div.className = 'fs-item';
        div.innerHTML = `
            <span class="fs-title">${task.title}</span>
            <div class="fs-actions">
                <button class="btn-micro action-done" title="I did this">Did it</button>
                <button class="btn-micro action-today" title="Do Today">Do Today</button>
                <button class="btn-micro action-skip" title="Skip / Backlog">Skip</button>
            </div>
        `;

        div.querySelector('.action-done').addEventListener('click', () => {
            store.toggleTask(task.id); // Completes it
        });

        div.querySelector('.action-today').addEventListener('click', () => {
            const today = new Date();
            const timeStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
            store.updateTask({ id: task.id, time: timeStr });
        });

        div.querySelector('.action-skip').addEventListener('click', () => {
            store.updateTask({ id: task.id, time: 'No Due Date' });
        });

        return div;
    }

    destroy() {
        this.unsubscribe();
    }
}
