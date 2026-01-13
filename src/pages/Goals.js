import TaskCard from '../components/TaskCard.js';
import { store } from '../utils/Store.js';

export default class Goals {
    constructor(container) {
        this.container = container;
        this.render();
        this.unsubscribe = store.subscribe(() => this.render());
    }

    render() {
        const tasks = store.getTasks(t => t.type === 'goal' && !t.completed);

        // Group by time (Today vs Later/No Date)
        const today = new Date().toISOString().split('T')[0];

        const priority = tasks.filter(t => t.time && t.time.includes(today));
        const others = tasks.filter(t => !t.time || !t.time.includes(today));

        this.container.innerHTML = `
            <div class="page-header">
                <div>
                    <h2>Personal Goals</h2>
                    <button id="add-goal-btn" class="btn btn-primary" style="background-color: #00BFA5; margin-top: 8px;">
                        <span class="material-symbols-rounded">add</span>
                        New Goal
                    </button>
                </div>
            </div>

            <div class="task-list-container">
                ${priority.length > 0 ? `
                    <h3 class="list-section-title">Today's Focus</h3>
                    <div id="priority-list" class="task-list"></div>
                ` : ''}

                <h3 class="list-section-title">All Goals</h3>
                <div id="goals-list" class="task-list"></div>
            </div>
        `;

        const priorityList = this.container.querySelector('#priority-list');
        if (priorityList) {
            priority.forEach(t => priorityList.appendChild(new TaskCard(t).element));
        }

        const list = this.container.querySelector('#goals-list');
        others.forEach(t => list.appendChild(new TaskCard(t).element));

        if (tasks.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <span class="material-symbols-rounded" style="font-size: 48px; color: var(--md-sys-color-outline); margin-bottom: 16px;">flag</span>
                    <p>What do you want to achieve for yourself?</p>
                </div>
            `;
        }

        this.container.querySelector('#add-goal-btn').addEventListener('click', () => {
            window.app.addModal.open('goal');
        });
    }

    destroy() {
        this.unsubscribe();
    }
}
