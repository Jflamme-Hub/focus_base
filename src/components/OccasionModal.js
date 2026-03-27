import { store } from '../utils/Store.js';

export default class OccasionModal {
    constructor() {
        this.overlay = this.createOverlay();
        document.body.appendChild(this.overlay);
        this.isOpen = false;

        // Listen for store changes to re-render the list when an occasion is added/deleted
        store.subscribe(() => {
            if (this.isOpen) {
                this.renderList();
            }
        });
    }

    createOverlay() {
        const div = document.createElement('div');
        div.className = 'modal-overlay';
        div.innerHTML = `
            <div class="modal-card">
                <div class="modal-header">
                    <h2>Special Occasions</h2>
                    <button class="btn btn-icon close-modal"><span class="material-symbols-rounded">close</span></button>
                </div>
                
                <div style="padding: 16px; min-height: 200px;">
                    <p style="margin-bottom: 16px; opacity: 0.7;">Add birthdays and anniversaries. They'll automatically appear on your calendar.</p>
                    
                    <div style="background: var(--surface-variant, #dee3eb); padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                        <div style="display: flex; gap: 8px; align-items: flex-end; flex-wrap: wrap;">
                            <div style="flex: 2; min-width: 150px;">
                                <label style="font-size: 12px; margin-bottom: 4px; display: block;">Occasion Name</label>
                                <input type="text" id="modal-occasion-name" placeholder="e.g. Mom's Birthday" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--outline);">
                            </div>
                            <div style="flex: 1; min-width: 120px;">
                                <label style="font-size: 12px; margin-bottom: 4px; display: block;">Date (MM-DD or YYYY-MM-DD)</label>
                                <input type="text" id="modal-occasion-date" placeholder="03-14 or 1978-03-14" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--outline);">
                            </div>
                            <button id="modal-add-occasion-btn" class="btn btn-primary" style="padding: 8px 16px; flex-shrink: 0;">Add</button>
                        </div>
                    </div>

                    <!-- Rendering Occasions List -->
                    <div id="modal-occasions-list" style="display: flex; flex-direction: column; gap: 4px; max-height: 300px; overflow-y: auto; padding-right: 4px;">
                        <!-- List goes here -->
                    </div>
                </div>
                
                <div class="modal-actions" style="padding: 16px; border-top: 1px solid var(--outline); display: flex; justify-content: flex-end;">
                    <button class="btn btn-primary close-modal-btn">Done</button>
                </div>
            </div>
        `;

        // Event Listeners
        div.querySelector('.close-modal').addEventListener('click', () => this.close());
        div.querySelector('.close-modal-btn').addEventListener('click', () => this.close());

        // Add Occasion
        div.querySelector('#modal-add-occasion-btn').addEventListener('click', () => {
            const nameInput = div.querySelector('#modal-occasion-name');
            const dateInput = div.querySelector('#modal-occasion-date');

            const dateVal = dateInput.value.trim();

            if (!nameInput.value.trim() || !dateVal) {
                alert('Please provide both a name and a date.');
                return;
            }

            // Simple validation to ensure it looks vaguely like MM-DD or YYYY-MM-DD
            if (!dateVal.match(/^(\d{4}-)?\d{2}-\d{2}$/)) {
                alert('Date must be in MM-DD or YYYY-MM-DD format (e.g., 03-14 or 1978-03-14).');
                return;
            }

            const currentOccasions = store.state.settings.specialOccasions || [];
            currentOccasions.push({
                id: Date.now().toString(),
                name: nameInput.value.trim(),
                date: dateVal
            });

            store.updateSettings({ specialOccasions: currentOccasions });

            // Clear inputs
            nameInput.value = '';
            dateInput.value = '';
        });

        // Event delegation for delete buttons
        div.querySelector('#modal-occasions-list').addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-occasion-btn');
            if (deleteBtn) {
                const idToRemove = deleteBtn.getAttribute('data-id');
                const currentOccasions = store.state.settings.specialOccasions || [];
                const updated = currentOccasions.filter(o => o.id !== idToRemove);
                store.updateSettings({ specialOccasions: updated });
            }
        });

        return div;
    }

    renderList() {
        const listContainer = this.overlay.querySelector('#modal-occasions-list');
        const occasions = store.state.settings.specialOccasions || [];

        if (!occasions || occasions.length === 0) {
            listContainer.innerHTML = `<div style="text-align: center; padding: 16px; opacity: 0.5; border: 1px dashed var(--outline); border-radius: 8px;">No special occasions added yet.</div>`;
            return;
        }

        const sorted = [...occasions].sort((a, b) => a.date.localeCompare(b.date));

        listContainer.innerHTML = sorted.map(occ => {
            const mmdd = occ.date.slice(-5); // Handles both "YYYY-MM-DD" and "MM-DD" robustly
            const parts = mmdd.split('-');
            const displayDate = new Date(2000, parseInt(parts[0]) - 1, parseInt(parts[1])).toLocaleDateString('default', { month: 'short', day: 'numeric' });

            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--surface); border: 1px solid var(--outline); border-radius: 8px; flex-shrink: 0;">
                    <div>
                        <div style="font-weight: 500;">${occ.name}</div>
                        <div style="font-size: 12px; opacity: 0.7;">${displayDate}</div>
                    </div>
                    <button class="btn btn-icon delete-occasion-btn" data-id="${occ.id}" style="color: var(--md-sys-color-error);"><span class="material-symbols-rounded">delete</span></button>
                </div>
            `;
        }).join('');
    }

    open() {
        this.renderList();
        this.overlay.classList.add('open');
        this.isOpen = true;
    }

    close() {
        this.overlay.classList.remove('open');
        this.isOpen = false;
    }
}
