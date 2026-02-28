import TaskCard from '../components/TaskCard.js';
import { store } from '../utils/Store.js';

export default class SchoolWork {
    constructor(container) {
        this.container = container;
        this.render();
        this.unsubscribe = store.subscribe(() => this.loadTasks());
    }

    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h2>School Work</h2>
                <button id="add-school-btn" class="btn btn-theme btn-theme-school">
                    <span class="material-symbols-rounded">add</span>
                    New Assignment
                </button>
            </div>
            
            <div class="task-sections">
                <section>
                    <h3>Due Today</h3>
                    <div id="school-today" class="task-list"></div>
                </section>
                
                <section>
                    <h3>This Week</h3>
                    <div id="school-week" class="task-list"></div>
                </section>
            </div>
        `;

        this.container.querySelector('#add-school-btn').addEventListener('click', () => {
            if (window.app && window.app.addModal) {
                window.app.addModal.open('school');
            } else {
                console.error("Modal not initialized");
            }
        });

        this.loadTasks();
    }

    loadTasks() {
        const todayContainer = this.container.querySelector('#school-today');
        const weekContainer = this.container.querySelector('#school-week');

        if (todayContainer) todayContainer.innerHTML = '';
        if (weekContainer) weekContainer.innerHTML = '';

        const tasks = store.getTasks(t => t.type === 'school');

        // Simple mock "Date" logic 
        const todayTasks = tasks.filter(t =>
            t.time.toLowerCase().includes('today') ||
            t.time.toLowerCase().includes('am') ||
            t.time.toLowerCase().includes('pm')
        );
        const weekTasks = tasks.filter(t => !todayTasks.includes(t));

        todayTasks.forEach(t => todayContainer.appendChild(new TaskCard(t).element));
        weekTasks.forEach(t => weekContainer.appendChild(new TaskCard(t).element));
    }

    destroy() {
        if (this.unsubscribe) this.unsubscribe();
    }
}
