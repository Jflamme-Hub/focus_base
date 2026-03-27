import { store } from '../utils/Store.js';

export default class Settings {
    constructor(container) {
        this.container = container;
        this.render();
    }

    render() {
        // Provide fallbacks if they don't exist yet
        const settings = store.state.settings || {};
        const cSchool = settings.colorSchool || '#1565C0';
        const cHouse = settings.colorHouse || '#006A60';
        const cWork = settings.colorWork || '#FD7F2C';
        const cEvent = settings.colorEvent || '#B3261E';
        const cGoal = settings.colorGoal || '#1E88E5';

        this.container.innerHTML = `
            <div>
                <section style="margin-bottom: 32px;">
                    <h3>Calendar Region</h3>
                    <p style="margin-bottom: 16px; opacity: 0.7;">Set your region to automatically show local holidays on your calendar.</p>
                    <div style="max-width: 300px; display: flex;">
                        <select id="region-select" style="flex: 1; padding: 10px 24px; border-radius: 100px; background: var(--md-sys-color-surface-variant); color: var(--md-sys-color-on-surface-variant); border: none; font-size: 14px; font-weight: 500; font-family: inherit; cursor: pointer; height: 40px; box-sizing: border-box; outline: none;">
                            <option value="US" ${settings.region === 'US' ? 'selected' : ''}>United States</option>
                            <option value="CA" ${settings.region === 'CA' ? 'selected' : ''}>Canada</option>
                            <option value="GB" ${settings.region === 'GB' ? 'selected' : ''}>United Kingdom</option>
                            <option value="AU" ${settings.region === 'AU' ? 'selected' : ''}>Australia</option>
                            <option value="none" ${settings.region === 'none' ? 'selected' : ''}>None (No Holidays)</option>
                        </select>
                    </div>
                </section>

                <section style="margin-bottom: 32px;">
                    <h3>Customize Categories</h3>
                    <p style="margin-bottom: 16px; opacity: 0.7;">Turn off what you don't need.</p>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="toggle-school" ${settings.showSchool ? 'checked' : ''}>
                            School Work
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="toggle-house" ${settings.showHouse ? 'checked' : ''}>
                            House Work / Chores
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="toggle-work" ${settings.showWork ? 'checked' : ''}>
                            Work / Job
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="toggle-goals" ${settings.showGoals ? 'checked' : ''}>
                            Personal Goals
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="toggle-notes" ${settings.showNotes !== false ? 'checked' : ''}>
                            Notes & Lists
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="toggle-journal" ${settings.showJournal !== false ? 'checked' : ''}>
                            Journal
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="toggle-routines" ${settings.showRoutines !== false ? 'checked' : ''}>
                            Daily Routines
                        </label>
                    </div>
                </section>

                <section style="margin-bottom: 32px;">
                    <h3>Special Occasions</h3>
                    <p style="margin-bottom: 16px; opacity: 0.7;">Add birthdays and anniversaries. They'll automatically appear on your calendar.</p>
                    <button id="manage-occasions-btn" class="btn secondary" style="font-size: 14px; font-family: inherit; font-weight: 500; background-color: var(--md-sys-color-surface-variant); color: var(--md-sys-color-on-surface-variant); height: 40px; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; padding: 10px 24px; border-radius: 100px; border: none; cursor: pointer; white-space: nowrap;">Manage Occasions</button>

                <section style="margin-bottom: 32px;">
                    <h3>Appearance & Category Colors</h3>
                    
                    <div class="setting-item" style="display: flex; justify-content: space-between; align-items: center; max-width: 300px;">
                        <label>Global Theme</label>
                        <input type="color" id="theme-color" value="${settings.themeColor || '#6750A4'}">
                    </div>
                    <div class="setting-item" style="display: flex; justify-content: space-between; align-items: center; max-width: 300px;">
                        <label>School Work Color</label>
                        <input type="color" id="color-school" value="${cSchool}">
                    </div>
                    <div class="setting-item" style="display: flex; justify-content: space-between; align-items: center; max-width: 300px;">
                        <label>House Work Color</label>
                        <input type="color" id="color-house" value="${cHouse}">
                    </div>
                    <div class="setting-item" style="display: flex; justify-content: space-between; align-items: center; max-width: 300px;">
                        <label>Work Color</label>
                        <input type="color" id="color-work" value="${cWork}">
                    </div>
                    <div class="setting-item" style="display: flex; justify-content: space-between; align-items: center; max-width: 300px;">
                        <label>Event Color</label>
                        <input type="color" id="color-event" value="${cEvent}">
                    </div>
                    <div class="setting-item" style="display: flex; justify-content: space-between; align-items: center; max-width: 300px;">
                        <label>Goal Color</label>
                        <input type="color" id="color-goal" value="${cGoal}">
                    </div>
                </section>

                <section style="margin-bottom: 32px; background: var(--primary-container, #eaddff); padding: 16px; border-radius: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span class="material-symbols-rounded" style="color: var(--md-sys-color-primary, #6750A4);">lock</span>
                        <h3 style="margin: 0; color: var(--md-sys-color-primary, #6750A4);">Privacy & Data Security</h3>
                    </div>
                    <p style="margin: 0; font-size: 0.9rem; line-height: 1.4; margin-bottom: 12px;">
                        <strong>Your data is 100% yours.</strong> All of your tasks, routines, and notes are saved directly on your personal device. Focus Base works completely offline and never uploads your personal data to any servers or the cloud.
                    </p>
                    <a href="./privacy.html" target="_blank" style="color: var(--md-sys-color-primary, #6750A4); font-size: 0.9rem; font-weight: 500; text-decoration: underline;">View Full Privacy Policy</a>
                </section>

                <section style="margin-bottom: 32px; border: 1px solid var(--md-sys-color-error); padding: 16px; border-radius: 8px;">
                    <h3 style="color: var(--md-sys-color-error);">Danger Zone</h3>
                    <p>Permanently delete tasks, journals, or completely wipe your app.</p>
                    <button id="clear-data-btn" class="btn" style="background-color: var(--md-sys-color-error); color: white; width: 100%;">Manage Data Deletion</button>
                </section>
            </div>
        `;

        const saveSettings = () => {
            try {
                const newSettings = {
                    showSchool: this.container.querySelector('#toggle-school').checked,
                    showHouse: this.container.querySelector('#toggle-house').checked,
                    showWork: this.container.querySelector('#toggle-work').checked,
                    showGoals: this.container.querySelector('#toggle-goals').checked,
                    showNotes: this.container.querySelector('#toggle-notes').checked,
                    showJournal: this.container.querySelector('#toggle-journal').checked,
                    showRoutines: this.container.querySelector('#toggle-routines').checked,
                    themeColor: this.container.querySelector('#theme-color').value,
                    colorSchool: this.container.querySelector('#color-school').value,
                    colorHouse: this.container.querySelector('#color-house').value,
                    colorWork: this.container.querySelector('#color-work').value,
                    colorEvent: this.container.querySelector('#color-event').value,
                    colorGoal: this.container.querySelector('#color-goal').value,
                    region: this.container.querySelector('#region-select').value,
                };
                store.updateSettings(newSettings);
            } catch (err) {
                console.error('Save failed:', err);
            }
        };

        // Auto-save on any input change
        const checkInputs = this.container.querySelectorAll('input[type="checkbox"], select');
        checkInputs.forEach(input => input.addEventListener('change', saveSettings));

        // Auto-save on color picker changes (both as they drag and when they close)
        const colorInputs = this.container.querySelectorAll('input[type="color"]');
        colorInputs.forEach(input => {
            input.addEventListener('input', saveSettings);
            input.addEventListener('change', saveSettings);
        });

        this.container.querySelector('#clear-data-btn').addEventListener('click', () => {
            if (window.app && window.app.deleteModal) {
                window.app.deleteModal.open();
            }
        });

        // Special Occasions Logic
        this.container.querySelector('#manage-occasions-btn').addEventListener('click', () => {
            if (window.app && window.app.occasionModal) {
                window.app.occasionModal.open();
            }
        });
    }

}
