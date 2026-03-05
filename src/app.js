import Sidebar from './components/Sidebar.js';
import FocusMode from './components/FocusMode.js';
import AddModal from './components/AddModal.js';
import RoutineModal from './components/RoutineModal.js';
import HelpModal from './components/HelpModal.js';
import NotificationManager from './utils/NotificationManager.js';
import { store } from './utils/Store.js?v=9';

class App {
    constructor() {
        this.init();
        this.focusMode = new FocusMode();
        this.addModal = new AddModal();
        this.routineModal = new RoutineModal();
        this.helpModal = new HelpModal();
        this.notificationManager = new NotificationManager();

        this.currentPageName = 'dashboard';

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

        // Handle PWA URL Intents (Share Target / New Note)
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');

        if (action === 'share' || action === 'new-note') {
            const title = urlParams.get('title') || '';
            const text = urlParams.get('text') || '';
            const url = urlParams.get('url') || '';

            // Wait a tick for router to settle, then open note editor
            setTimeout(() => {
                this.handleNavigation('notes');
                setTimeout(() => {
                    if (this.currentView && this.currentView.openEditor) {
                        const content = [text, url].filter(Boolean).join('\n\n');
                        this.currentView.openEditor({ title, content, tags: ['Shared'], isChecklist: false });
                    }
                }, 300); // 300ms wait for view to mount
            }, 100);

            // Clean up URL so refresh doesn't trigger it again
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        }

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

        const helpBtn = document.getElementById('global-help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                this.helpModal.open(this.currentPageName);
            });
        }
    }

    async handleNavigation(page) {
        const container = document.getElementById('view-container');
        const header = document.querySelector('#top-bar h1'); // Target H1 specifically to avoid wiping button
        this.currentPageName = page;

        let module;
        try {
            switch (page) {
                case 'dashboard':
                    module = await import('./pages/Dashboard.js?v=8');
                    if (header) header.textContent = `Today's Focus`;
                    break;
                case 'routines':
                    module = await import('./pages/Routines.js?v=8');
                    if (header) header.textContent = `Daily Routines`;
                    break;
                case 'school':
                    module = await import('./pages/SchoolWork.js?v=8');
                    if (header) header.textContent = `School Work`;
                    break;
                case 'house':
                    module = await import('./pages/HouseWork.js?v=8');
                    if (header) header.textContent = `House Work`;
                    break;
                case 'work':
                    module = await import('./pages/Work.js?v=8');
                    if (header) header.textContent = `Work`;
                    break;
                case 'calendar':
                    module = await import('./pages/Appointments.js?v=8');
                    if (header) header.textContent = `Calendar`;
                    break;
                case 'goals':
                    module = await import('./pages/Goals.js?v=8');
                    if (header) header.textContent = `Personal Goals`;
                    break;
                case 'notes':
                    module = await import('./pages/Notes.js?v=8');
                    if (header) header.textContent = `Notes & Lists`;
                    break;
                case 'journal':
                    module = await import('./pages/Journal.js?v=8');
                    if (header) header.textContent = `Journal`;
                    break;
                case 'settings':
                    module = await import('./pages/Settings.js?v=9');
                    if (header) header.textContent = `Settings`;
                    break;
                case 'review':
                    module = await import('./pages/WeekReview.js?v=8');
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
