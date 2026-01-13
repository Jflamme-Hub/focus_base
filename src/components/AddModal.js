import { store } from '../utils/Store.js';

export default class AddModal {
    constructor() {
        this.overlay = this.createOverlay();
        document.body.appendChild(this.overlay);
        this.isOpen = false;
        this.isEditing = false;
        this.editingId = null;
    }

    createOverlay() {
        const div = document.createElement('div');
        div.className = 'modal-overlay';
        div.innerHTML = `
            <div class="modal-card">
                <div class="modal-header">
                    <h2 id="modal-title">New Task</h2>
                    <button class="btn btn-icon close-modal"><span class="material-symbols-rounded">close</span></button>
                </div>
                <form id="add-task-form">
                    <div class="form-group">
                        <label>Type</label>
                        <div class="type-selector">
                            <label class="type-option">
                                <input type="radio" name="type" value="school" checked>
                                <span class="chip">School</span>
                            </label>
                            <label class="type-option">
                                <input type="radio" name="type" value="house">
                                <span class="chip">House</span>
                            </label>
                            <label class="type-option">
                                <input type="radio" name="type" value="work">
                                <span class="chip">Work</span>
                            </label>
                            <label class="type-option">
                                <input type="radio" name="type" value="appointment">
                                <span class="chip">Event</span>
                            </label>
                            <label class="type-option">
                                <input type="radio" name="type" value="goal">
                                <span class="chip">Goal</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="task-title">What needs to be done?</label>
                        <input type="text" id="task-title" name="title" required placeholder="e.g. Shift at Coffee Shop">
                    </div>

                    <div class="form-group">
                        <label>When?</label>
                        <div style="display: flex; gap: 8px;">
                            <div style="flex: 1;">
                                <label for="task-date" style="font-size: 12px; margin-bottom: 4px;">Date</label>
                                <input type="date" id="task-date" name="date">
                            </div>
                            <div style="flex: 1;">
                                <label for="task-time" style="font-size: 12px; margin-bottom: 4px;">Time (Optional)</label>
                                <input type="time" id="task-time" name="time">
                            </div>
                        </div>
                    </div>

                    <!-- Dynamic Fields -->
                    <div id="field-location" class="form-group" style="display: none;">
                        <label for="task-location">Location / Address</label>
                        <input type="text" id="task-location" name="location" placeholder="e.g. 123 Main St">
                    </div>

                    <div id="field-notes" class="form-group">
                        <label for="task-notes">Notes</label>
                        <textarea id="task-notes" name="notes" rows="5" maxlength="200" style="min-height: 100px;" placeholder="Add details... (Max 200 chars)"></textarea>
                    </div>

                    <div class="modal-actions">
                        <button type="button" class="btn cancel-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary" id="submit-btn">Create Task</button>
                    </div>
                </form>
            </div>
        `;

        // Event Listeners
        div.querySelector('.close-modal').addEventListener('click', () => this.close());
        div.querySelector('.cancel-btn').addEventListener('click', () => this.close());

        // Type Change Listener
        const typeInputs = div.querySelectorAll('input[name="type"]');
        typeInputs.forEach(input => {
            input.addEventListener('change', (e) => this.handleTypeChange(e.target.value));
        });

        div.querySelector('#add-task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit(new FormData(e.target));
        });

        div.addEventListener('click', (e) => {
            if (e.target === div) this.close();
        });

        return div;
    }

    handleTypeChange(type) {
        const locField = this.overlay.querySelector('#field-location');
        // Both appointments AND work might have locations
        if (type === 'appointment' || type === 'work') {
            locField.style.display = 'block';
        } else {
            locField.style.display = 'none';
        }
    }

    open(defaultType = 'school') {
        this.resetForm();
        this.isEditing = false;
        this.overlay.querySelector('#modal-title').textContent = 'New Task';
        this.overlay.querySelector('#submit-btn').textContent = 'Create Task';

        const radio = this.overlay.querySelector(`input[value="${defaultType}"]`);
        if (radio) {
            radio.checked = true;
            this.handleTypeChange(defaultType);
        }

        this.overlay.classList.add('open');
        this.overlay.querySelector('input[name="title"]').focus();
        this.isOpen = true;
    }

    openForEdit(task) {
        this.resetForm();
        this.isEditing = true;
        this.editingId = task.id;
        this.overlay.querySelector('#modal-title').textContent = 'Edit Task';
        this.overlay.querySelector('#submit-btn').textContent = 'Save Changes';

        // Pre-fill fields
        this.overlay.querySelector('#task-title').value = task.title;
        this.overlay.querySelector('#task-location').value = task.location || '';
        this.overlay.querySelector('#task-notes').value = task.notes || '';

        const radio = this.overlay.querySelector(`input[value="${task.type}"]`);
        if (radio) {
            radio.checked = true;
            this.handleTypeChange(task.type);
        }

        if (task.time && task.time !== 'No Due Date') {
            if (task.time.includes('T')) {
                const [d, t] = task.time.split('T');
                this.overlay.querySelector('#task-date').value = d;
                this.overlay.querySelector('#task-time').value = t;
            } else {
                this.overlay.querySelector('#task-date').value = task.time;
            }
        }

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
        this.overlay.querySelector('#add-task-form').reset();
    }

    handleSubmit(formData) {
        const date = formData.get('date');
        const time = formData.get('time');

        let finalTime = '';
        if (date) {
            finalTime = date;
            if (time) {
                finalTime += `T${time}`;
            }
        }

        const taskData = {
            title: formData.get('title'),
            type: formData.get('type'),
            time: finalTime || 'No Due Date',
            location: formData.get('location'),
            notes: formData.get('notes')
        };

        // OVERLAP DETECTION
        // We only care if we are adding a NEW task or changing the time of an existing one
        // and if a specific time is set (since date-only overlaps are common/fine)
        if (finalTime && finalTime.includes('T')) {
            const potentialConflict = this.checkOverlap(finalTime, this.isEditing ? this.editingId : null);
            if (potentialConflict) {
                const confirmed = confirm(`Conflict Warning:\nYou already have "${potentialConflict.title}" at this time.\n\nType: ${potentialConflict.type}\n\nDo you want to double-book?`);
                if (!confirmed) return; // User cancelled
            }
        }

        if (this.isEditing && this.editingId) {
            store.updateTask({ id: this.editingId, ...taskData });
        } else {
            store.addTask(taskData);
        }

        this.close();
    }

    checkOverlap(newTimeISO, excludeId) {
        // Simple exact match check (could be range-based in future)
        const tasks = store.getTasks();
        return tasks.find(t => {
            if (t.id === excludeId) return false; // Don't conflict with self
            if (t.completed) return false; // Ignore completed
            return t.time === newTimeISO;
        });
    }
}
