import { store } from '../utils/Store.js';

export default class Sidebar {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.render();
        store.subscribe(() => this.render()); // Re-render on settings change
    }

    render() {
        const s = store.state.settings || { showSchool: true, showHouse: true, showWork: true };

        this.container.innerHTML = `
            <div class="nav-item" data-page="dashboard" title="Dashboard">
                <span class="material-symbols-rounded">dashboard</span>
                <span class="nav-label">Dashboard</span>
            </div>
            ${s.showSchool ? `
            <div class="nav-item" data-page="school" title="School Work">
                <span class="material-symbols-rounded">school</span>
                <span class="nav-label">School</span>
            </div>` : ''}
            ${s.showHouse ? `
            <div class="nav-item" data-page="house" title="House Work">
                <span class="material-symbols-rounded">home_work</span>
                <span class="nav-label">House</span>
            </div>` : ''}
            ${s.showWork ? `
             <div class="nav-item" data-page="work" title="Work / Job">
                <span class="material-symbols-rounded">work</span>
                <span class="nav-label">Work</span>
            </div>` : ''}
            ${s.showGoals ? `
            <div class="nav-item" data-page="goals" title="Personal Goals">
                <span class="material-symbols-rounded">flag</span>
                <span class="nav-label">Goals</span>
            </div>` : ''}
            ${s.showNotes !== false ? `
            <div class="nav-item" data-page="notes" title="Notes & Lists">
                <span class="material-symbols-rounded">edit_note</span>
                <span class="nav-label">Notes</span>
            </div>` : ''}
            ${s.showJournal !== false ? `
            <div class="nav-item" data-page="journal" title="Journal">
                <span class="material-symbols-rounded">book</span>
                <span class="nav-label">Journal</span>
            </div>` : ''}
            ${s.showRoutines !== false ? `
            <div class="nav-item" data-page="routines" title="Daily Routines">
                <span class="material-symbols-rounded">sync</span>
                <span class="nav-label">Routines</span>
            </div>` : ''}
            <div class="nav-item" data-page="calendar" title="Calendar">
                <span class="material-symbols-rounded">calendar_month</span>
                <span class="nav-label">Calendar</span>
            </div>
            <div class="nav-item" data-page="focus" title="Focus Mode">
                <span class="material-symbols-rounded">self_improvement</span>
                <span class="nav-label">Focus</span>
            </div>
            <div class="nav-item" data-page="review" title="Week in Review">
                <span class="material-symbols-rounded">insights</span>
                <span class="nav-label">Progress</span>
            </div>
            <div class="spacer" style="flex:1"></div>
            <div class="nav-item" data-page="settings" title="Settings">
                <span class="material-symbols-rounded">settings</span>
                <span class="nav-label">Settings</span>
            </div>
        `;

        this.addEventListeners();
    }

    addEventListeners() {
        const items = this.container.querySelectorAll('.nav-item');
        items.forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.getAttribute('data-page');
                window.dispatchEvent(new CustomEvent('navigate', { detail: { page } }));

                // Update active state
                items.forEach(i => i.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Set initial active
        items[0].classList.add('active');
    }
}
