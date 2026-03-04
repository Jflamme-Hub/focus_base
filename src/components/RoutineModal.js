import { store } from '../utils/Store.js';

export default class RoutineModal {
    constructor() {
        this.overlay = this.createOverlay();
        document.body.appendChild(this.overlay);
        this.isOpen = false;
        this.isEditing = false;
        this.editingId = null;
        this.currentChecklist = []; // Array of {id, text, completed}
    }

    createOverlay() {
        const div = document.createElement('div');
        div.className = 'modal-overlay';
        div.innerHTML = `
            <div class="modal-card" style="max-width: 500px;">
                <div class="modal-header">
                    <h2 id="routine-modal-title">New Routine</h2>
                    <button class="btn btn-icon close-routine-modal"><span class="material-symbols-rounded">close</span></button>
                </div>
                <form id="routine-form">
                    <div class="form-group">
                        <label for="routine-title">Routine Name</label>
                        <input type="text" id="routine-title" name="title" required placeholder="e.g. Morning Wind-Up">
                    </div>

                    <div class="form-group">
                        <label>Repeat on Days</label>
                        <div class="day-selector" style="display: flex; gap: 8px; justify-content: space-between;">
                            ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => `
                                <label class="day-pill" style="flex:1; text-align:center;">
                                    <input type="checkbox" name="days" value="${day}" checked style="display:none;">
                                    <div class="day-chip" style="padding: 10px 4px; border-radius: 8px; border: 1px solid var(--md-sys-color-outline); cursor:pointer; font-size: 14px; font-weight: bold;">
                                        ${day.charAt(0)}
                                    </div>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <div class="form-group" style="display:flex; gap: 16px;">
                        <div style="flex: 1;">
                            <label for="routine-time">Time</label>
                            <input type="time" id="routine-time" name="time" required>
                        </div>
                        <div style="flex: 1; display:flex; flex-direction: column; justify-content: flex-end;">
                            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; margin-bottom: 8px; background: var(--md-sys-color-surface-variant); padding: 8px; border-radius: 8px;">
                                <input type="checkbox" id="routine-reminders" name="reminders" style="width:20px; height:20px; accent-color: var(--md-sys-color-primary);">
                                <span style="font-weight: 500;">Enable Reminders</span>
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Checklist Items</label>
                        <div style="display:flex; gap: 8px; margin-bottom: 8px;">
                            <input type="text" id="new-check-item" placeholder="Add step (e.g. Brush teeth)">
                            <button type="button" id="add-check-btn" class="btn" style="background: var(--md-sys-color-tertiary); color: white;">Add</button>
                        </div>
                        <ul id="routine-checklist-preview" style="list-style:none; padding:0; margin:0; max-height: 180px; overflow-y:auto;">
                            <!-- Items go here -->
                        </ul>
                    </div>

                    <div class="modal-actions" style="margin-top: 24px;">
                        <button type="button" class="btn cancel-routine-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary" id="routine-submit-btn">Save Routine</button>
                    </div>
                </form>
            </div>
        `;

        // Add CSS for the day pills
        const style = document.createElement('style');
        style.textContent = `
            .day-pill input:checked + .day-chip {
                background: var(--md-sys-color-primary);
                color: white;
                border-color: var(--md-sys-color-primary);
            }
            .day-chip {
                transition: all 0.2s ease;
            }
            .day-pill:hover .day-chip {
                background: rgba(103, 80, 164, 0.1);
            }
            .day-pill input:checked:hover + .day-chip {
                background: var(--md-sys-color-primary);
            }
        `;
        document.head.appendChild(style);

        // Listeners
        div.querySelector('.close-routine-modal').addEventListener('click', () => this.close());
        div.querySelector('.cancel-routine-btn').addEventListener('click', () => this.close());

        // Checklist Add
        div.querySelector('#add-check-btn').addEventListener('click', () => this.addChecklistItem());
        div.querySelector('#new-check-item').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addChecklistItem();
            }
        });

        div.querySelector('#routine-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit(new FormData(e.target));
        });

        div.addEventListener('click', (e) => {
            if (e.target === div) this.close();
        });

        return div;
    }

    addChecklistItem() {
        const input = this.overlay.querySelector('#new-check-item');
        const text = input.value.trim();
        if (text) {
            this.currentChecklist.push({ id: 'c' + Date.now(), text, completed: false });
            input.value = '';
            this.renderChecklist();
        }
    }

    removeChecklistItem(id) {
        this.currentChecklist = this.currentChecklist.filter(item => item.id !== id);
        this.renderChecklist();
    }

    renderChecklist() {
        const ul = this.overlay.querySelector('#routine-checklist-preview');
        ul.innerHTML = this.currentChecklist.map(item => `
            <li style="display:flex; justify-content:space-between; align-items:center; padding: 12px; background: var(--md-sys-color-surface-variant); margin-bottom: 8px; border-radius: 8px;">
                <span style="font-size: 15px;">${item.text}</span>
                <button type="button" class="btn-icon delete-item-btn" data-id="${item.id}" style="color:var(--md-sys-color-error); background:none; border:none; cursor:pointer;">
                    <span class="material-symbols-rounded" style="font-size:18px;">delete</span>
                </button>
            </li>
        `).join('');

        ul.querySelectorAll('.delete-item-btn').forEach(btn => {
            btn.addEventListener('click', () => this.removeChecklistItem(btn.getAttribute('data-id')));
        });
    }

    open() {
        this.resetForm();
        this.isEditing = false;
        this.editingId = null;
        this.currentChecklist = [];
        this.renderChecklist();

        this.overlay.querySelector('#routine-modal-title').textContent = 'New Routine';
        this.overlay.querySelector('#routine-submit-btn').textContent = 'Create Routine';

        this.overlay.classList.add('open');
        this.isOpen = true;
    }

    openForEdit(routine) {
        this.resetForm();
        this.isEditing = true;
        this.editingId = routine.id;

        this.overlay.querySelector('#routine-title').value = routine.title;
        this.overlay.querySelector('#routine-time').value = routine.time || '';
        this.overlay.querySelector('#routine-reminders').checked = !!routine.remindersEnabled;

        // Days
        const dayCheckboxes = this.overlay.querySelectorAll('input[name="days"]');
        dayCheckboxes.forEach(cb => {
            cb.checked = routine.days && routine.days.includes(cb.value);
        });

        // Checklist clone
        this.currentChecklist = JSON.parse(JSON.stringify(routine.checklist || []));
        this.renderChecklist();

        this.overlay.querySelector('#routine-modal-title').textContent = 'Edit Routine';
        this.overlay.querySelector('#routine-submit-btn').textContent = 'Save Changes';

        this.overlay.classList.add('open');
        this.isOpen = true;
    }

    close() {
        this.overlay.classList.remove('open');
        this.resetForm();
        this.isOpen = false;
        this.isEditing = false;
        this.editingId = null;
    }

    resetForm() {
        this.overlay.querySelector('#routine-form').reset();
        // default all days to checked
        this.overlay.querySelectorAll('input[name="days"]').forEach(cb => cb.checked = true);
        this.currentChecklist = [];
        this.renderChecklist();
    }

    handleSubmit(formData) {
        const title = formData.get('title');
        const time = formData.get('time');
        const remindersEnabled = formData.get('reminders') !== null;
        const days = formData.getAll('days');

        if (days.length === 0) {
            alert("Please select at least one day for this routine.");
            return;
        }

        const routineData = {
            title,
            time,
            remindersEnabled,
            days,
            checklist: this.currentChecklist
        };

        if (this.isEditing && this.editingId) {
            store.updateRoutine({ id: this.editingId, ...routineData });
        } else {
            store.addRoutine(routineData);
        }

        this.close();
    }
}
