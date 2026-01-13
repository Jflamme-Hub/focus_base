import TaskCard from '../components/TaskCard.js';
import { store } from '../utils/Store.js';

export default class Work {
    constructor(container) {
        this.container = container;
        this.render();
        this.unsubscribe = store.subscribe(() => this.updateView());
    }

    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h2>Work & Shifts</h2>
                <button id="add-work-btn" class="btn btn-primary" style="background-color: #FD7F2C;">
                    <span class="material-symbols-rounded">add</span>
                    New Shift
                </button>
            </div>
            
            <div class="task-sections">
                <section>
                    <h3>Upcoming Shifts</h3>
                    <div id="work-list" class="task-list"></div>
                </section>
            </div>
        `;

        this.container.querySelector('#add-work-btn').addEventListener('click', () => {
            if (window.app && window.app.addModal) {
                window.app.addModal.open('work');
            }
        });

        this.updateView();
    }

    updateView() {
        const listContainer = this.container.querySelector('#work-list');
        if (listContainer) listContainer.innerHTML = '';

        const tasks = store.getTasks(t => t.type === 'work');

        // Sort by date/time string roughly
        tasks.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

        if (tasks.length === 0) {
            listContainer.innerHTML = '<p style="opacity: 0.6; font-style: italic;">No work shifts scheduled.</p>';
        } else {
            tasks.forEach(t => listContainer.appendChild(new TaskCard(t).element));
        }
    }

    destroy() {
        if (this.unsubscribe) this.unsubscribe();
    }
}
