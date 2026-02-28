import Sidebar from './components/Sidebar.js';
import FocusMode from './components/FocusMode.js';
import AddModal from './components/AddModal.js';
import RoutineModal from './components/RoutineModal.js';
import NotificationManager from './utils/NotificationManager.js';
import { store } from './utils/Store.js';

class App {
    constructor() {
        this.init();
        this.focusMode = new FocusMode();
        this.addModal = new AddModal();
        this.routineModal = new RoutineModal();
        this.notificationManager = new NotificationManager();

        // Expose app globally so pages can call modals easily
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

    getContrastYIQ(hexcolor) {
        // Remove hash if present
        let hex = hexcolor.replace("#", "");
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }

        // Convert to RGB
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // Calculate YIQ formula for perceived brightness
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

        // Return black or white emphasizing readability
        return (yiq >= 128) ? '#000000' : '#ffffff';
    }

    applySettings() {
        const settings = store.state.settings;
        if (settings) {
            const root = document.documentElement.style;

            if (settings.themeColor) {
                root.setProperty('--md-sys-color-primary', settings.themeColor);
            }

            // Apply category colors and contrast text colors
            const categories = [
                { key: 'colorSchool', varName: '--color-school' },
                { key: 'colorHouse', varName: '--color-house' },
                { key: 'colorWork', varName: '--color-work' },
                { key: 'colorEvent', varName: '--color-event' },
                { key: 'colorGoal', varName: '--color-goal' }
            ];

            categories.forEach(cat => {
                if (settings[cat.key]) {
                    const bgColor = settings[cat.key];
                    const textColor = this.getContrastYIQ(bgColor);
                    root.setProperty(cat.varName, bgColor);
                    root.setProperty(`${cat.varName}-text`, textColor);
                }
            });
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
                case 'routines':
                    module = await import('./pages/Routines.js');
                    if (header) header.textContent = `Daily Routines`;
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
                case 'goals':
                    module = await import('./pages/Goals.js');
                    if (header) header.textContent = `Personal Goals`;
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
