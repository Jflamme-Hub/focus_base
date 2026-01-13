import Sidebar from './components/Sidebar.js';
import FocusMode from './components/FocusMode.js';
import AddModal from './components/AddModal.js';
import { store } from './utils/Store.js';

class App {
    constructor() {
        this.init();
        this.focusMode = new FocusMode();
        this.addModal = new AddModal();

        // Expose modal globally so pages can call it easily (simple bus)
        window.app = this;
    }

    init() {
        // Initialize Components
        new Sidebar('sidebar');

        // Listen for navigation
        window.addEventListener('navigate', (e) => {
            if (e.detail.page === 'focus') {
                this.focusMode.show();
            } else {
                this.handleNavigation(e.detail.page);
            }
        });

        // React to store changes (Global Settings/Theme)
        store.subscribe((state) => {
            this.applySettings();
        });

        // Initial Load
        this.applySettings();
        this.setupGlobalListeners();
        this.handleNavigation('dashboard');
    }

    applySettings() {
        const settings = store.state.settings;
        if (settings && settings.themeColor) {
            document.documentElement.style.setProperty('--md-sys-color-primary', settings.themeColor);

            // Also update the 'School Work' color implicitly if we want, but sidebar uses primary for active state
        }
    }

    setupGlobalListeners() {
        const btn = document.getElementById('global-add-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                // Default to general or context aware if we want
                this.addModal.open();
            });
        }
    }

    async handleNavigation(page) {
        const container = document.getElementById('view-container');
        const header = document.querySelector('#top-bar h1'); // Target H1 specifically to avoid wiping button

        let module;
        try {
            switch (page) {
                case 'dashboard':
                    module = await import('./pages/Dashboard.js');
                    if (header) header.textContent = `Today's Focus`;
                    break;
                case 'school':
                    module = await import('./pages/SchoolWork.js');
                    if (header) header.textContent = `School Work`;
                    break;
                case 'house':
                    module = await import('./pages/HouseWork.js');
                    if (header) header.textContent = `House Work`;
                    break;
                case 'work':
                    module = await import('./pages/Work.js');
                    if (header) header.textContent = `Work`;
                    break;
                case 'calendar':
                    module = await import('./pages/Appointments.js');
                    if (header) header.textContent = `Calendar`;
                    break;
                case 'settings':
                    module = await import('./pages/Settings.js');
                    if (header) header.textContent = `Settings`;
                    break;
                case 'review':
                    module = await import('./pages/WeekReview.js');
                    if (header) header.textContent = `Progress`;
                    break;
                default:
                    container.innerHTML = '<h2>Page not found</h2>';
                    return;
            }

            // Clean up old view
            if (this.currentView && typeof this.currentView.destroy === 'function') {
                this.currentView.destroy();
            }

            container.innerHTML = '';
            this.currentView = new module.default(container);

        } catch (error) {
            console.error("Failed to load page", error);
            container.innerHTML = `<p class="error">Error loading ${page}</p>`;
        }
    }
}

// Start the app
new App();
