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
            <div class="page-header" style="justify-content: flex-end;">
                <button id="add-work-btn" class="btn btn-theme btn-theme-work">
                    <span class="material-symbols-rounded">add</span>
                    New Task
                </button>
            </div>
            
            <div class="task-sections">
                <section>
                    <h3>Upcoming Focus</h3>
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
