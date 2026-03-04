import { store } from '../utils/Store.js';

export default class Routines {
    constructor(container) {
        this.container = container;
        this.render();
        this.unsubscribe = store.subscribe(() => this.render());
    }

    render() {
        // Find today's short name (e.g. "Mon", "Tue")
        const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short' });
        const allRoutines = store.state.routines || [];

        // Filter routines active for today
        const todaysRoutines = allRoutines.filter(r => r.days && r.days.includes(todayStr));

        this.container.innerHTML = `
            <div class="routines-page">
                <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                    <p style="color: var(--md-sys-color-on-surface-variant); max-width: 600px; font-size: 16px; line-height: 1.5;">
                        Build your morning, night, weekly, or daily routines here to help you stay structured. They will automatically reset every night at midnight to keep your progress fresh.
                    </p>
                    <button id="add-routine-btn" class="btn btn-primary" style="display: flex; align-items: center; gap: 8px; padding: 12px 24px; font-size: 16px;">
                        <span class="material-symbols-rounded">add</span> New Routine
                    </button>
                </div>

                <div class="routines-list">
                    ${todaysRoutines.length === 0 ? `
                        <div class="empty-state" style="text-align: center; padding: 64px 24px; color: var(--md-sys-color-outline); background: var(--md-sys-color-surface); border-radius: 24px;">
                            <span class="material-symbols-rounded" style="font-size: 64px; opacity: 0.5; margin-bottom: 16px;">sync_disabled</span>
                            <h3 style="font-size: 24px; color: var(--md-sys-color-on-surface); margin-bottom: 8px;">No Routines Scheduled For Today</h3>
                            <p style="font-size: 16px;">Click 'New Routine' to start building your daily habits and routines.</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        const listContainer = this.container.querySelector('.routines-list');
        todaysRoutines.forEach(routine => {
            listContainer.appendChild(this.createRoutineCard(routine));
        });

        this.container.querySelector('#add-routine-btn').addEventListener('click', () => {
            window.app.routineModal.open();
        });
    }

    createRoutineCard(routine) {
        const card = document.createElement('div');
        card.className = 'routine-card';
        card.style.cssText = `
            background: var(--md-sys-color-surface);
            border-radius: 16px;
            padding: var(--spacing-xl);
            margin-bottom: var(--spacing-lg);
            box-shadow: 0 4px 8px rgba(0,0,0,0.05);
            border-left: 8px solid var(--md-sys-color-secondary);
        `;

        const allDone = routine.checklist.length > 0 && routine.checklist.every(item => item.completed);

        let checklistHTML = routine.checklist.map(item => `
            <div class="routine-item" data-id="${item.id}" style="display: flex; align-items: center; gap: 16px; margin-top: 16px; cursor: pointer; opacity: ${item.completed ? 0.6 : 1}; transition: all 0.2s;">
                <span class="material-symbols-rounded" style="font-size: 28px; color: ${item.completed ? 'var(--md-sys-color-secondary)' : 'var(--md-sys-color-outline)'};">
                    ${item.completed ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span style="font-size: 18px; font-weight: 500; ${item.completed ? 'text-decoration: line-through;' : ''}">${item.text}</span>
            </div>
        `).join('');

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 8px; font-size: 24px; color: var(--md-sys-color-on-surface);">
                        ${routine.title} 
                        ${allDone ? '<span class="material-symbols-rounded" style="color: #4CAF50; font-size: 28px;" title="Routine Complete!">verified</span>' : ''}
                    </h3>
                    <div style="font-size: 15px; color: var(--md-sys-color-on-surface-variant); margin-top: 8px; display: flex; align-items: center; gap: 16px;">
                        <span><span class="material-symbols-rounded" style="font-size: 18px; vertical-align: middle;">schedule</span> ${routine.time || 'Anytime'}</span>
                        ${routine.remindersEnabled ? '<span><span class="material-symbols-rounded" style="font-size: 18px; vertical-align: middle;">notifications_active</span> Reminders On</span>' : ''}
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-icon edit-routine-btn" title="Edit Routine" style="background: var(--md-sys-color-surface-variant); padding: 8px; border-radius: 50%; border: none; cursor: pointer; color: var(--md-sys-color-on-surface-variant);">
                        <span class="material-symbols-rounded">edit</span>
                    </button>
                    <button class="btn-icon delete-routine-btn" title="Delete Routine" style="background: rgba(179, 38, 30, 0.1); padding: 8px; border-radius: 50%; border: none; cursor: pointer; color: var(--md-sys-color-error);">
                        <span class="material-symbols-rounded">delete</span>
                    </button>
                </div>
            </div>
            <div class="checklist-container" style="margin-top: 24px; border-top: 2px solid var(--md-sys-color-surface-variant); padding-top: 8px;">
                ${checklistHTML}
                ${routine.checklist.length === 0 ? '<p style="color: var(--md-sys-color-outline); font-style: italic; margin-top: 16px;">No checklist items added.</p>' : ''}
            </div>
        `;

        // Bind checklist toggles
        card.querySelectorAll('.routine-item').forEach(el => {
            el.addEventListener('click', () => {
                const itemId = el.getAttribute('data-id');
                // Ensure Store correctly parses the numeric/string IDs
                store.toggleRoutineItem(routine.id, (itemId.includes('c') ? itemId : Number(itemId)));
            });
        });

        // Edit
        card.querySelector('.edit-routine-btn').addEventListener('click', () => {
            window.app.routineModal.openForEdit(routine);
        });

        // Delete
        card.querySelector('.delete-routine-btn').addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete the routine "${routine.title}"?`)) {
                store.deleteRoutine(routine.id);
            }
        });

        return card;
    }

    destroy() {
        this.unsubscribe();
    }
}
