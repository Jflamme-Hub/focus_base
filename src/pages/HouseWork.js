import TaskCard from '../components/TaskCard.js';
import { store } from '../utils/Store.js';

export default class HouseWork {
    constructor(container) {
        this.container = container;
        this.render();
        this.unsubscribe = store.subscribe(() => this.updateView());
    }

    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <div>
                    <h2>House Work</h2>
                    <button id="add-house-btn" class="btn btn-primary" style="background-color: var(--md-sys-color-tertiary); margin-top: 8px;">
                        <span class="material-symbols-rounded">add</span>
                        New Chore
                    </button>
                </div>
                <div class="points-display">
                    <span class="material-symbols-rounded">star</span>
                    <span id="points-value">Loading...</span>
                </div>
            </div>

            <div class="gamification-banner">
                <p>keep up the streak! 🔥 <span id="streak-value">0</span> days in a row</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 70%"></div>
                </div>
            </div>

            <div class="task-sections">
                <section>
                    <h3>Daily Chores</h3>
                    <div id="house-daily" class="task-list"></div>
                </section>
                
                <section>
                    <h3>Weekly Tasks</h3>
                    <div id="house-weekly" class="task-list"></div>
                </section>
            </div>
        `;

        this.container.querySelector('#add-house-btn').addEventListener('click', () => {
            if (window.app && window.app.addModal) {
                window.app.addModal.open('house');
            }
        });

        this.updateView();
    }

    updateView() {
        const state = store.state;

        const ptsEl = this.container.querySelector('#points-value');
        if (ptsEl) ptsEl.textContent = `${state.points} Points`;

        const streakEl = this.container.querySelector('#streak-value');
        if (streakEl) streakEl.textContent = state.streak;

        const tasks = store.getTasks(t => t.type === 'house');
        // Simple logic for daily vs weekly
        const daily = tasks.filter(t => !t.time.toLowerCase().includes('sunday') && !t.time.toLowerCase().includes('saturday'));
        const weekly = tasks.filter(t => !daily.includes(t));

        const dailyContainer = this.container.querySelector('#house-daily');
        const weeklyContainer = this.container.querySelector('#house-weekly');

        if (dailyContainer) {
            dailyContainer.innerHTML = '';
            daily.forEach(t => dailyContainer.appendChild(new TaskCard(t).element));
        }

        if (weeklyContainer) {
            weeklyContainer.innerHTML = '';
            weekly.forEach(t => weeklyContainer.appendChild(new TaskCard(t).element));
        }
    }

    destroy() {
        if (this.unsubscribe) this.unsubscribe();
    }
}
