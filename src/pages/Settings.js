import { store } from '../utils/Store.js';

export default class Settings {
    constructor(container) {
        this.container = container;
        this.render();
    }

    render() {
        const settings = store.state.settings || {
            showSchool: true, showHouse: true, showWork: true, themeColor: '#6750A4', font: 'Roboto'
        };

        this.container.innerHTML = `
            <div class="page-header">
                <h2>Settings</h2>
            </div>
            
            <div style="max-width: 600px; padding: 16px;">
                
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
                </section>

                <section style="margin-bottom: 32px;">
                    <h3>Appearance</h3>
                    
                    <div class="setting-item">
                        <label>Theme Color</label>
                        <input type="color" id="theme-color" value="${settings.themeColor}">
                    </div>
                </section>

                <section style="margin-bottom: 32px; border: 1px solid var(--md-sys-color-error); padding: 16px; border-radius: 8px;">
                    <h3 style="color: var(--md-sys-color-error);">Danger Zone</h3>
                    <p>Permanently delete all tasks and data.</p>
                    <button id="clear-data-btn" class="btn" style="background-color: var(--md-sys-color-error); color: white; width: 100%;">Clear All Data</button>
                </section>

                <button id="save-settings" class="btn btn-primary">Save Changes</button>
            </div>
        `;

        this.container.querySelector('#save-settings').addEventListener('click', (e) => {
            try {
                const newSettings = {
                    showSchool: this.container.querySelector('#toggle-school').checked,
                    showHouse: this.container.querySelector('#toggle-house').checked,
                    showWork: this.container.querySelector('#toggle-work').checked,
                    showGoals: this.container.querySelector('#toggle-goals').checked,
                    themeColor: this.container.querySelector('#theme-color').value,
                };

                store.updateSettings(newSettings);

                // Visual feedback
                const btn = e.target;
                const originalText = btn.textContent;
                btn.textContent = 'Saved!';
                btn.disabled = true;
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }, 1500);
            } catch (err) {
                console.error('Save failed:', err);
                alert('Failed to save settings: ' + err.message);
            }
        });

        this.container.querySelector('#clear-data-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete ALL tasks and points? This cannot be undone.')) {
                store.clearData();
                alert('All data cleared.');
            }
        });
    }
}
