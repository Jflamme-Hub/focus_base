export default class HelpModal {
    constructor() {
        this.createOverlay();
        this.setupListeners();
    }

    createOverlay() {
        if (document.getElementById('help-modal')) return;

        this.overlay = document.createElement('div');
        this.overlay.id = 'help-modal';
        this.overlay.className = 'modal-overlay';
        this.overlay.innerHTML = `
            <div class="modal-card" style="max-width: 500px; background: white; color: black; padding: 24px; border-radius: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h2 id="help-modal-title" style="display: flex; align-items: center; gap: 8px; margin: 0; color: black;">
                        <span class="material-symbols-rounded" style="color: var(--md-sys-color-primary);">info</span>
                        How to use this page
                    </h2>
                    <button class="icon-btn close-help-modal" title="Close" style="color: black;">
                        <span class="material-symbols-rounded">close</span>
                    </button>
                </div>
                <div class="modal-body" id="help-modal-body" style="font-size: 1.05rem; line-height: 1.6; color: black; margin-top: 1rem;">
                    <!-- Content injected based on active tab -->
                </div>
                <div class="modal-footer" style="display: flex; justify-content: flex-end; margin-top: 2rem;">
                    <button class="btn primary close-help-modal" style="background: var(--md-sys-color-primary); color: white; padding: 8px 16px; border-radius: 20px; border: none; font-weight: bold; cursor: pointer;">Got it!</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.overlay);
    }

    setupListeners() {
        if (!this.overlay) return;

        const closeBtns = this.overlay.querySelectorAll('.close-help-modal');
        closeBtns.forEach(btn => btn.addEventListener('click', () => this.close()));

        // Close on background click
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
    }

    open(pageId) {
        if (!this.overlay) this.createOverlay();

        const helpContent = this.getHelpTextForPage(pageId);
        document.getElementById('help-modal-body').innerHTML = helpContent;

        this.overlay.classList.add('open');
    }

    close() {
        if (this.overlay) {
            this.overlay.classList.remove('open');
        }
    }

    getHelpTextForPage(pageId) {
        const contentMap = {
            'dashboard': `
                <p>Welcome to your <strong>Dashboard</strong>!</p>
                <ul>
                    <li>This is your daily overview. It highlights tasks that are <strong>Due Today</strong> or coming up <strong>Soon</strong>.</li>
                    <li>Read the daily quote for a bit of encouragement and positive reinforcement.</li>
                    <li>If you miss tasks from previous days, they will appear here under "Missed Tasks" so you can choose to skip them, do them today, or safely delete them.</li>
                    <li>Click the <strong>+ New Task</strong> button to quickly add something without leaving the page.</li>
                </ul>
            `,
            'school': `
                <p>The <strong>School Work</strong> tab helps you organize class assignments, homework, and study sessions.</p>
                <ul>
                    <li>Assignments added here are color-coded so they are easy to identify on your Dashboard (you can change this color in Settings).</li>
                    <li>Check off tasks when you finish them to earn 100 Focus Points!</li>
                    <li>Assignments due today are separated from assignments due later in the week to help you prioritize.</li>
                </ul>
            `,
            'house': `
                <p>The <strong>House Work</strong> tab is for chores, errands, and maintaining your living space.</p>
                <ul>
                    <li>Use this to track cleaning, laundry, or grocery shopping.</li>
                    <li>Housework tasks reward you with 50 Focus Points when completed.</li>
                    <li>If you find yourself repeatedly doing the same chores every day, consider setting them up as a <strong>Routine</strong> instead!</li>
                </ul>
            `,
            'work': `
                <p>The <strong>Work</strong> tab keeps your professional life organized.</p>
                <ul>
                    <li>Use this space for your job, freelance gigs, or major side-hustle projects.</li>
                    <li>Work tasks are high-priority and reward you with 100 Focus Points.</li>
                </ul>
            `,
            'goals': `
                <p>The <strong>Personal Goals</strong> tab is your space for self-improvement and hobbies.</p>
                <ul>
                    <li>Want to read 10 pages a day? Learn a new language? Start a fitness journey? Track those goals here.</li>
                    <li>Break large goals down into smaller, actionable tasks so they don't feel overwhelming.</li>
                </ul>
            `,
            'notes': `
                <p>The <strong>Notes & Lists</strong> tab is your digital scratchpad.</p>
                <ul>
                    <li>Jot down quick thoughts, brainstorms, or specific checklists (like a packing list or grocery list).</li>
                    <li>Use the <strong>Checklist Mode</strong> button to toggle between a standard text paragraph and an interactive checklist.</li>
                    <li>You can categorize your notes using the folder drop-down to keep them organized.</li>
                </ul>
            `,
            'journal': `
                <p>The <strong>Journal</strong> is a safe, private space to reflect on your day.</p>
                <ul>
                    <li>Type freely on the lined paper. Don't worry about saving; your text is <strong>auto-saved</strong> as you type.</li>
                    <li>Use the left and right arrows at the top to look back at previous entries.</li>
                    <li>Journaling is highly recommended for processing thoughts, managing anxiety, and celebrating daily wins!</li>
                </ul>
            `,
            'routines': `
                <p>The <strong>Routines</strong> tab is for checklists that you want to reset automatically!</p>
                <ul>
                    <li>If you have chores, morning routines, or habits that you do over and over again, set them up here.</li>
                    <li>You can choose how often they reset: every day, on specific days of the week, or after a certain number of days pass.</li>
                    <li>Once you check everything off, you don't need to recreate the list. The app will automatically uncheck everything for you when the next due date arrives.</li>
                </ul>
            `,
            'calendar': `
                <p>The <strong>Calendar</strong> gives you a bird's-eye view of your month.</p>
                <ul>
                    <li>All your tasks that have a specific "Due Date" will automatically show up here.</li>
                    <li>You can add standalone events directly to the calendar using the <strong>New Event</strong> button.</li>
                    <li>Click the <strong>Share</strong> button to save a picture of your calendar and send it to friends or family so they know your schedule!</li>
                </ul>
            `,
            'focus': `
                <p><strong>Focus Mode</strong> is an immersive tool to help you concentrate on a single task.</p>
                <ul>
                    <li>Start the timer, put your phone away, and focus deeply until the timer rings.</li>
                    <li>Use the built-in ambient soundscapes (like Rain or Forest) to block out distracting background noise.</li>
                    <li>You can customize the length of the focus timer using the <strong>+</strong> and <strong>-</strong> buttons directly next to the timer before starting it.</li>
                </ul>
            `,
            'review': `
                <p>The <strong>Progress</strong> tab visualizes your hard work!</p>
                <ul>
                    <li>See how many tasks you've completed this week and across the lifetime of the app.</li>
                    <li>Review the "How to Earn Focus Points" section to understand the gamification system.</li>
                    <li>As you earn Weekly Points, you'll accumulate Bronze, Silver, and Gold badges to show off your consistency.</li>
                </ul>
            `,
            'settings': `
                <p>The <strong>Settings</strong> tab lets you customize the app to fit your brain.</p>
                <ul>
                    <li>Change the overall Theme Color and the specific colors assigned to each category (School, Work, etc).</li>
                    <li>Don't need a specific tab? Toggle features on and off under "Active Modules". Removing tabs you don't use helps reduce visual clutter.</li>
                </ul>
            `
        };

        return contentMap[pageId] || `<p>This page helps you stay organized and focused. Click around to explore its features!</p>`;
    }
}
