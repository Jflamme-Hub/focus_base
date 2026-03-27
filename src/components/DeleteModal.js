import { store } from '../utils/Store.js';

export default class DeleteModal {
    constructor() {
        this.createDOM();
    }

    createDOM() {
        const template = `
            <div id="delete-modal" class="modal-overlay">
                <div class="modal-card">
                    <button class="close-modal material-symbols-rounded" style="position: absolute; right: 16px; top: 16px; background: none; border: none; cursor: pointer;">close</button>
                    <h2 style="margin-top: 0; color: var(--md-sys-color-error, #B3261E); display: flex; align-items: center; gap: 8px;">
                        <span class="material-symbols-rounded">warning</span>
                        Delete Data
                    </h2>
                    
                    <p style="margin-bottom: 24px; font-size: 14px; opacity: 0.8;">
                        Select the specific categories of data you want to permanently erase from your device.
                    </p>

                    <div style="background: var(--surface-variant, #dee3eb); padding: 16px; border-radius: 8px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 12px;">
                        <div>
                            <button id="modal-delete-select-all" class="btn text-btn" style="padding: 0; font-size: 13px; color: var(--primary);">Select All</button>
                            <span style="opacity: 0.5; margin: 0 4px;">|</span>
                            <button id="modal-delete-select-none" class="btn text-btn" style="padding: 0; font-size: 13px; color: var(--primary);">Select None</button>
                        </div>
                        
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 15px; cursor: pointer;">
                            <input type="checkbox" id="del-school" class="del-cb"> School Work
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 15px; cursor: pointer;">
                            <input type="checkbox" id="del-house" class="del-cb"> House Work / Chores
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 15px; cursor: pointer;">
                            <input type="checkbox" id="del-work" class="del-cb"> Work / Job
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 15px; cursor: pointer;">
                            <input type="checkbox" id="del-goals" class="del-cb"> Personal Goals
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 15px; cursor: pointer;">
                            <input type="checkbox" id="del-notes" class="del-cb"> Notes & Lists
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 15px; cursor: pointer;">
                            <input type="checkbox" id="del-journal" class="del-cb"> Journal Entries
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 15px; cursor: pointer;">
                            <input type="checkbox" id="del-routines" class="del-cb"> Daily Routines
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 15px; cursor: pointer;">
                            <input type="checkbox" id="del-points" class="del-cb"> Focus Points & Badges
                        </label>
                    </div>
                    
                    <div class="modal-actions" style="display: flex; flex-direction: column; gap: 12px;">
                        <button id="modal-delete-selected-btn" class="btn" style="background-color: var(--md-sys-color-error, #B3261E); color: white; width: 100%;">
                            Delete Selected Data
                        </button>
                        <button id="modal-delete-all-btn" class="btn text-btn" style="color: var(--md-sys-color-error, #B3261E); font-size: 12px;">
                            Nuke Entire Database (Clear All)
                        </button>
                    </div>
                </div>
            </div>
        `;

        const div = document.createElement('div');
        div.innerHTML = template;
        document.body.appendChild(div.firstElementChild);
        this.element = document.getElementById('delete-modal');

        // Event Listeners
        this.element.querySelector('.close-modal').addEventListener('click', () => this.close());

        // Background click to close
        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) this.close();
        });

        const checkboxes = this.element.querySelectorAll('.del-cb');

        this.element.querySelector('#modal-delete-select-all').addEventListener('click', () => {
            checkboxes.forEach(cb => cb.checked = true);
        });

        this.element.querySelector('#modal-delete-select-none').addEventListener('click', () => {
            checkboxes.forEach(cb => cb.checked = false);
        });

        // The "Delete Selected" Button
        const delSelectedBtn = this.element.querySelector('#modal-delete-selected-btn');
        let selectedConfirmTimeout = null;

        delSelectedBtn.addEventListener('click', () => {
            let anyChecked = false;
            const config = {
                school: document.getElementById('del-school').checked,
                house: document.getElementById('del-house').checked,
                work: document.getElementById('del-work').checked,
                goals: document.getElementById('del-goals').checked,
                notes: document.getElementById('del-notes').checked,
                journal: document.getElementById('del-journal').checked,
                routines: document.getElementById('del-routines').checked,
                points: document.getElementById('del-points').checked
            };

            for (const key in config) {
                if (config[key]) anyChecked = true;
            }

            if (!anyChecked) {
                delSelectedBtn.textContent = "Please select a category first";
                delSelectedBtn.style.backgroundColor = 'var(--md-sys-color-outline, #79747E)';
                setTimeout(() => {
                    delSelectedBtn.textContent = "Delete Selected Data";
                    delSelectedBtn.style.backgroundColor = 'var(--md-sys-color-error, #B3261E)';
                }, 2000);
                return;
            }

            if (delSelectedBtn.textContent !== "Click again to confirm deletion") {
                delSelectedBtn.textContent = "Click again to confirm deletion";
                delSelectedBtn.style.backgroundColor = '#7F1D1D'; // darker red

                clearTimeout(selectedConfirmTimeout);
                selectedConfirmTimeout = setTimeout(() => {
                    delSelectedBtn.textContent = "Delete Selected Data";
                    delSelectedBtn.style.backgroundColor = 'var(--md-sys-color-error, #B3261E)';
                }, 3000);
                return;
            }

            // Confirmed execution
            clearTimeout(selectedConfirmTimeout);
            store.clearSpecificData(config);

            delSelectedBtn.textContent = "Erased successfully!";
            delSelectedBtn.style.backgroundColor = '#146c2e'; // green success

            setTimeout(() => {
                delSelectedBtn.textContent = "Delete Selected Data";
                delSelectedBtn.style.backgroundColor = 'var(--md-sys-color-error, #B3261E)';
                this.close();
            }, 1000);
        });

        // The "Nuke All" Button
        const nukeBtn = this.element.querySelector('#modal-delete-all-btn');
        let nukeConfirmTimeout = null;

        nukeBtn.addEventListener('click', () => {
            if (nukeBtn.textContent !== "Tap again to NUKE EVERYTHING") {
                nukeBtn.textContent = "Tap again to NUKE EVERYTHING";
                nukeBtn.style.color = '#7F1D1D';
                nukeBtn.style.fontWeight = 'bold';

                clearTimeout(nukeConfirmTimeout);
                nukeConfirmTimeout = setTimeout(() => {
                    nukeBtn.textContent = "Nuke Entire Database (Clear All)";
                    nukeBtn.style.color = 'var(--md-sys-color-error, #B3261E)';
                    nukeBtn.style.fontWeight = 'normal';
                }, 3000);
                return;
            }

            // Confirmed execution
            clearTimeout(nukeConfirmTimeout);
            store.clearData();

            nukeBtn.textContent = "All data wiped!";
            nukeBtn.style.color = '#146c2e';
            nukeBtn.style.fontWeight = 'bold';

            setTimeout(() => {
                nukeBtn.textContent = "Nuke Entire Database (Clear All)";
                nukeBtn.style.color = 'var(--md-sys-color-error, #B3261E)';
                nukeBtn.style.fontWeight = 'normal';
                this.close();
            }, 1000);
        });
    }

    open() {
        // Reset checkboxes when opening
        const checkboxes = this.element.querySelectorAll('.del-cb');
        checkboxes.forEach(cb => cb.checked = false);
        this.element.classList.add('open');
    }

    close() {
        this.element.classList.remove('open');
        store.notify();
    }
}
