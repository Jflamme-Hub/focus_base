import { store } from '../utils/Store.js';

export default class Journal {
    constructor(container) {
        this.container = container;
        this.currentDate = new Date().toISOString().split('T')[0];
        this.currentEntry = null;

        // Ensure store has journal initialized
        if (!store.state.journal) {
            store.state.journal = [];
            store.save();
        }

        this.render();
        this.loadEntryForDate(this.currentDate);

        // Inject CSS if not present
        if (!document.getElementById('journal-styles')) {
            const link = document.createElement('link');
            link.id = 'journal-styles';
            link.rel = 'stylesheet';
            link.href = './src/styles/journal.css';
            document.head.appendChild(link);
        }
    }

    destroy() {
        this.container.innerHTML = '';
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
    }

    render() {
        // Format the date nicely for the UI (e.g., "Monday, March 4, 2026")
        const dateObj = new Date(this.currentDate + 'T12:00:00'); // Use noon to avoid timezone shift
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = dateObj.toLocaleDateString(undefined, options);

        this.container.innerHTML = `
            <div class="journal-container fade-in">
                <div class="journal-header">
                    <div class="journal-date-selector">
                        <button class="icon-btn" id="prev-day-btn" title="Previous Day">
                            <span class="material-symbols-rounded">chevron_left</span>
                        </button>
                        <h2 class="journal-current-date">${formattedDate}</h2>
                        <button class="icon-btn" id="next-day-btn" title="Next Day">
                            <span class="material-symbols-rounded">chevron_right</span>
                        </button>
                    </div>
                    <button class="btn secondary" id="today-btn">Today</button>
                </div>
                
                <div class="journal-paper-wrapper">
                    <div class="journal-paper">
                        <div class="journal-margin-line"></div>
                        <textarea id="journal-textarea" class="journal-textarea" placeholder="Dear Journal..."></textarea>
                    </div>
                </div>

                <div class="journal-footer">
                    <span id="journal-save-status" class="save-status"></span>
                </div>
            </div>
        `;

        this.setupListeners();
    }

    setupListeners() {
        const prevBtn = document.getElementById('prev-day-btn');
        const nextBtn = document.getElementById('next-day-btn');
        const todayBtn = document.getElementById('today-btn');
        const textarea = document.getElementById('journal-textarea');

        prevBtn.addEventListener('click', () => this.changeDate(-1));
        nextBtn.addEventListener('click', () => this.changeDate(1));
        todayBtn.addEventListener('click', () => {
            this.currentDate = new Date().toISOString().split('T')[0];
            this.render(); // Re-render to update the date string
            this.loadEntryForDate(this.currentDate);
        });

        textarea.addEventListener('input', () => {
            this.showSaveStatus('Saving...');
            if (this.saveTimeout) clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(() => this.saveEntry(), 1000);
        });
    }

    changeDate(offsetDays) {
        const current = new Date(this.currentDate + 'T12:00:00');
        current.setDate(current.getDate() + offsetDays);
        this.currentDate = current.toISOString().split('T')[0];

        // Quick save current before switching
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
            this.saveEntrySync();
        }

        this.render(); // Re-render to update the header
        this.loadEntryForDate(this.currentDate);
    }

    loadEntryForDate(dateStr) {
        const entry = store.state.journal.find(j => j.date === dateStr);
        this.currentEntry = entry || null;

        const textarea = document.getElementById('journal-textarea');
        if (textarea) {
            textarea.value = entry ? entry.content : '';
            this.adjustTextareaHeight(textarea);
            this.showSaveStatus(entry ? 'Loaded' : 'New Entry');
        }
    }

    saveEntry() {
        this.saveEntrySync();
        this.showSaveStatus('Saved');
        setTimeout(() => this.showSaveStatus(''), 2000);
    }

    saveEntrySync() {
        const textarea = document.getElementById('journal-textarea');
        if (!textarea) return;

        const content = textarea.value.trim();

        // If it's empty and we have no existing entry, do nothing
        if (!content && !this.currentEntry) return;

        // If it's empty but we DO have an entry, maybe delete it or set to empty
        if (!content && this.currentEntry) {
            store.deleteJournalEntry(this.currentEntry.id);
            this.currentEntry = null;
            return;
        }

        if (this.currentEntry) {
            // Update
            // Only update if content changed
            if (this.currentEntry.content !== content) {
                store.updateJournalEntry({ id: this.currentEntry.id, content: content });
                // We don't replace this.currentEntry because store update happens in place 
                // but we should keep our ref in sync just in case
                this.currentEntry.content = content;
            }
        } else {
            // Create
            const newEntry = store.addJournalEntry({
                date: this.currentDate,
                content: content
            });
            this.currentEntry = newEntry;
        }
    }

    showSaveStatus(msg) {
        const statusEl = document.getElementById('journal-save-status');
        if (statusEl) {
            statusEl.textContent = msg;
        }
    }

    adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto'; // Reset
        textarea.style.height = (textarea.scrollHeight) + 'px';
    }
}
