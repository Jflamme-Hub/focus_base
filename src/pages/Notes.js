import { store } from '../utils/Store.js';

export default class Notes {
    constructor(container) {
        this.container = container;
        this.activeFilter = '';
        this.searchQuery = '';
        this.editingNote = null;
        this.isChecklistView = false;

        this.render();
        this.unsubscribe = store.subscribe(() => this.renderList());

        // Inject CSS if not present
        if (!document.getElementById('notes-styles')) {
            const link = document.createElement('link');
            link.id = 'notes-styles';
            link.rel = 'stylesheet';
            link.href = './src/styles/notes.css';
            document.head.appendChild(link);
        }
    }

    destroy() {
        if (this.unsubscribe) this.unsubscribe();
        this.container.innerHTML = '';
    }

    render() {
        this.container.innerHTML = `
            <div class="notes-container fade-in">
                <!-- Search and Filters Section -->
                <div class="notes-header">
                    <div class="notes-search-bar" style="max-width: 600px; margin: 0 auto; width: 100%;">
                        <span class="material-symbols-rounded">search</span>
                        <input type="text" id="notes-search" placeholder="Search your notes...">
                    </div>
                </div>
                
                <div class="note-tags" id="quick-filters" style="justify-content: center; margin-bottom: 2rem;">
                    <!-- Filters injected here -->
                </div>

                <!-- Always-visible Note Creator -->
                <div class="persistent-note-editor" style="background: var(--surface, #fdf8fd); border: 1px solid var(--outline, #79747e); border-radius: 12px; padding: 1rem; margin: 0 auto 2rem auto; max-width: 600px; width: 100%; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                       <input type="text" id="inline-note-title" placeholder="Title" style="font-size: 1.25rem; font-weight: bold; border:none; background: transparent; flex: 1; outline: none;">
                       <button id="inline-toggle-chk-btn" class="icon-btn" title="Toggle Checklist Mode">
                           <span class="material-symbols-rounded">checklist</span>
                       </button>
                    </div>

                    <div class="note-editor-tags" id="inline-note-tag-editor" style="padding: 0 0 1rem 0; display: flex; align-items: center; gap: 8px;">
                        <span class="material-symbols-rounded" style="color:#666; font-size:1.2rem;">folder_open</span>
                        <select id="inline-note-tags-input" style="border:none; background:transparent; border-bottom:1px solid #ccc; outline:none; padding:4px; font-family:inherit;">
                            <option value="">No Category</option>
                            <option value="School">School</option>
                            <option value="Work">Work</option>
                            <option value="House">House</option>
                            <option value="Personal">Personal</option>
                            <option value="Ideas">Ideas</option>
                        </select>
                    </div>

                    <!-- Standard Textarea -->
                    <textarea id="inline-note-content-text" class="note-editor-textarea" placeholder="Take a note..." style="min-height: 80px; width: 100%; border: none; outline: none; resize: none; background: transparent;"></textarea>
                    
                    <!-- Checklist Container -->
                    <div id="inline-note-content-checklist" class="checklist-editor" style="display:none; width: 100%;">
                        <div id="inline-checklist-items"></div>
                        <div class="add-checklist-item" id="inline-add-chk-line" style="margin-top: 0.5rem;">
                            <span class="material-symbols-rounded">add</span> List item
                        </div>
                    </div>

                    <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
                        <button id="inline-save-note-btn" class="btn primary" style="font-size: 0.9rem; padding: 6px 16px;">Save</button>
                    </div>
                </div>

                <!-- Saved Notes Grid -->
                <div class="notes-masonry" id="notes-list">
                    <!-- Notes injected here -->
                </div>
            </div>

            <!-- Edit Existing Note Modal -->
            <div id="note-modal" class="modal-overlay note-editor-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="note-modal-title">Edit Note</h2>
                        <div>
                            <button id="toggle-chk-btn" class="icon-btn" title="Toggle Checklist Mode">
                                <span class="material-symbols-rounded">checklist</span>
                            </button>
                            <button class="icon-btn close-modal" title="Discard/Close">
                                <span class="material-symbols-rounded">close</span>
                            </button>
                        </div>
                    </div>
                    
                    <input type="text" id="note-title" placeholder="Title" class="modal-input" style="font-size: 1.25rem; font-weight: bold; border:none;">
                    
                    <div class="note-editor-tags" id="note-tag-editor" style="padding: 0 0.5rem 1rem 0.5rem; display: flex; align-items: center; gap: 8px;">
                        <span class="material-symbols-rounded" style="color:#666; font-size:1.2rem;">folder_open</span>
                        <select id="note-tags-input" style="border:none; background:transparent; border-bottom:1px solid #ccc; outline:none; padding:4px; font-family:inherit;">
                            <option value="">No Category</option>
                            <option value="School">School</option>
                            <option value="Work">Work</option>
                            <option value="House">House</option>
                            <option value="Personal">Personal</option>
                            <option value="Ideas">Ideas</option>
                        </select>
                    </div>

                    <div class="note-editor-body">
                        <!-- Standard Textarea -->
                        <textarea id="note-content-text" class="note-editor-textarea" placeholder="Take a note..."></textarea>
                        
                        <!-- Checklist Container -->
                        <div id="note-content-checklist" class="checklist-editor" style="display:none;">
                            <div id="checklist-items"></div>
                            <div class="add-checklist-item" id="add-chk-line">
                                <span class="material-symbols-rounded">add</span> List item
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer" style="display: flex; align-items: center; justify-content: space-between; margin-top: 1rem; gap: 8px;">
                        <button id="save-note-btn" class="btn primary">Save Changes</button>
                        <div style="flex:1"></div>
                        <button class="btn secondary close-modal">Close</button>
                        <button id="delete-note-btn" class="btn" style="background: var(--md-sys-color-error, #B3261E); color: white; display: none;">Delete</button>
                    </div>
                </div>
            </div>
        `;

        this.setupListeners();
        this.renderList();
    }

    setupListeners() {
        const searchInput = document.getElementById('notes-search');
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderList();
        });

        // Global Add Button Override
        const globalBtn = document.getElementById('global-add-btn');
        if (globalBtn) {
            const newBtn = globalBtn.cloneNode(true);
            globalBtn.parentNode.replaceChild(newBtn, globalBtn);
            newBtn.innerHTML = '<span class="material-symbols-rounded">add</span>';
            newBtn.addEventListener('click', () => {
                const titleInput = document.getElementById('inline-note-title');
                if (titleInput) {
                    titleInput.scrollIntoView({ behavior: 'smooth' });
                    titleInput.focus();
                }
            });
        }

        // --- Inline Creator Listeners ---
        document.getElementById('inline-save-note-btn').addEventListener('click', () => this.saveInlineNote());

        // Setup inline checklist tracking
        this.inlineChecklistMode = false;
        document.getElementById('inline-toggle-chk-btn').addEventListener('click', () => {
            this.inlineChecklistMode = !this.inlineChecklistMode;
            this.applyInlineChecklistMode();
        });

        document.getElementById('inline-add-chk-line').addEventListener('click', () => {
            this.addChecklistUI('', false, null, 'inline');
        });

        // Auto-bullet feature for inline
        this.setupAutoBullet('inline-note-content-text');

        // --- Modal Edit Listeners ---
        const modal = document.getElementById('note-modal');
        const closeBtns = modal.querySelectorAll('.close-modal');
        closeBtns.forEach(btn => btn.addEventListener('click', () => {
            modal.classList.remove('open');
        }));

        document.getElementById('save-note-btn').addEventListener('click', () => this.saveModalNote());
        document.getElementById('delete-note-btn').addEventListener('click', () => {
            if (this.editingNote && confirm("Delete this note permanently?")) {
                store.deleteNote(this.editingNote.id);
                modal.classList.remove('open');
            }
        });

        document.getElementById('toggle-chk-btn').addEventListener('click', () => this.toggleModalChecklistMode());
        document.getElementById('add-chk-line').addEventListener('click', () => this.addChecklistUI('', false, null, 'modal'));
        this.setupAutoBullet('note-content-text');
    }

    setupAutoBullet(textareaId) {
        const contentText = document.getElementById(textareaId);
        if (!contentText) return;

        contentText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cursorPosition = contentText.selectionStart;
                const textBeforeCursor = contentText.value.substring(0, cursorPosition);
                // Find start of current line
                const lastNewlineIndex = textBeforeCursor.lastIndexOf('\n');
                const currentLine = textBeforeCursor.substring(lastNewlineIndex === -1 ? 0 : lastNewlineIndex + 1);

                // Match exactly: spaces/tabs followed by hyphen/asterisk followed by space
                const bulletMatch = currentLine.match(/^([ \t]*)[-*] /);

                if (bulletMatch) {
                    e.preventDefault();

                    // If the line is JUST a bullet without text, remove the bullet instead of creating a new one
                    if (currentLine.replace(/^([ \t]*)[-*] /, '').trim() === '') {
                        const newText = contentText.value.substring(0, lastNewlineIndex === -1 ? 0 : lastNewlineIndex + 1)
                            + contentText.value.substring(cursorPosition);
                        contentText.value = newText;
                        contentText.selectionStart = contentText.selectionEnd = lastNewlineIndex === -1 ? 0 : lastNewlineIndex + 1;
                        return;
                    }

                    // Otherwise, grab the exact whitespace block + bullet + space and inject it
                    const textToInsert = '\n' + bulletMatch[0];
                    const textAfterCursor = contentText.value.substring(cursorPosition);

                    contentText.value = textBeforeCursor + textToInsert + textAfterCursor;
                    // Move cursor past the newly inserted text
                    contentText.selectionStart = contentText.selectionEnd = cursorPosition + textToInsert.length;
                }
            }
        });
    }

    // --- Inline Editor Logic ---

    applyInlineChecklistMode() {
        const textEl = document.getElementById('inline-note-content-text');
        const chkEl = document.getElementById('inline-note-content-checklist');
        const toggleBtn = document.getElementById('inline-toggle-chk-btn');

        if (this.inlineChecklistMode) {
            // Converts text to list items if missing
            const rows = chkEl.querySelectorAll('.checklist-item');
            if (rows.length === 0) {
                const lines = textEl.value.split('\\n').filter(l => l.trim().length > 0);
                if (lines.length > 0) {
                    lines.forEach(line => this.addChecklistUI(line.replace(/^- /, '').trim(), false, null, 'inline'));
                } else {
                    this.addChecklistUI('', false, null, 'inline');
                }
            }

            textEl.style.display = 'none';
            chkEl.style.display = 'flex';
            toggleBtn.style.color = 'var(--md-sys-color-primary, #6750A4)';
            toggleBtn.style.background = 'var(--primary-container, #eaddff)';
        } else {
            // Converting checklist to text
            const rows = document.getElementById('inline-checklist-items').querySelectorAll('.checklist-item');
            let text = '';
            rows.forEach(r => {
                const val = r.querySelector('input[type="text"]').value;
                const isChecked = r.querySelector('input[type="checkbox"]').checked;
                if (val) text += (isChecked ? '[x] ' : '- ') + val + '\\n';
            });
            if (text) textEl.value = text.trim();

            textEl.style.display = 'block';
            chkEl.style.display = 'none';
            toggleBtn.style.color = '';
            toggleBtn.style.background = '';
        }
    }

    saveInlineNote() {
        const titleEl = document.getElementById('inline-note-title');
        const tagsInput = document.getElementById('inline-note-tags-input');

        const title = titleEl.value.trim();
        const tagsRaw = tagsInput.value;
        const tags = tagsRaw ? [tagsRaw] : [];

        let content = '';
        let validData = false;

        if (this.inlineChecklistMode) {
            const rows = document.getElementById('inline-checklist-items').querySelectorAll('.checklist-item');
            const data = [];
            rows.forEach(r => {
                const val = r.querySelector('input[type="text"]').value.trim();
                const isChecked = r.querySelector('input[type="checkbox"]').checked;
                if (val) {
                    data.push({ text: val, done: isChecked });
                    validData = true;
                }
            });
            content = JSON.stringify(data);
        } else {
            content = document.getElementById('inline-note-content-text').value;
            if (content.trim()) validData = true;
        }

        if (!title && !validData) {
            alert('Cannot save an empty note.');
            return;
        }

        const noteData = {
            title: title || 'Untitled Note',
            content,
            tags,
            isChecklist: this.inlineChecklistMode
        };

        store.addNote(noteData);

        // Reset Creator
        titleEl.value = '';
        tagsInput.value = '';
        document.getElementById('inline-note-content-text').value = '';
        document.getElementById('inline-checklist-items').innerHTML = '';
        if (this.inlineChecklistMode) {
            this.inlineChecklistMode = false;
            this.applyInlineChecklistMode();
        }
    }

    // --- Modal Editor Logic ---

    openEditor(note) {
        this.editingNote = note;
        const modal = document.getElementById('note-modal');
        const titleEl = document.getElementById('note-title');
        const tagsInput = document.getElementById('note-tags-input');
        const deleteBtn = document.getElementById('delete-note-btn');
        const modalTitle = document.getElementById('note-modal-title');

        const contentText = document.getElementById('note-content-text');
        const contentChecklistContainer = document.getElementById('note-content-checklist');
        const chkItemsContainer = document.getElementById('checklist-items');

        chkItemsContainer.innerHTML = '';

        if (note) {
            modalTitle.textContent = "Edit Note";
            titleEl.value = note.title;
            tagsInput.value = (note.tags && note.tags.length > 0) ? note.tags[0] : '';
            deleteBtn.style.display = 'block';
            this.isChecklistView = note.isChecklist;

            if (note.isChecklist) {
                // Parse lines
                try {
                    const lines = JSON.parse(note.content);
                    lines.forEach(line => this.addChecklistUI(line.text, line.done, null, 'modal'));
                } catch (e) {
                    // Fallback if parsing fails
                    this.addChecklistUI(note.content, false, null, 'modal');
                }
                contentText.value = ''; // Ensure text view is empty
            } else {
                // If it's pure text, just set the value. 
                // Don't format as JSON because it breaks regular text.
                contentText.value = note.content;
            }
        } else {
            modalTitle.textContent = "New Note";
            titleEl.value = '';
            tagsInput.value = '';
            contentText.value = '';
            deleteBtn.style.display = 'none';
            this.isChecklistView = false;
        }

        this.applyModalChecklistViewMode();
        modal.classList.add('open');
        titleEl.focus();
    }

    addChecklistUI(text = '', checked = false, afterNode = null, context = 'modal') {
        const containerId = context === 'inline' ? 'inline-checklist-items' : 'checklist-items';
        const container = document.getElementById(containerId);

        const row = document.createElement('div');
        row.className = `checklist-item ${checked ? 'done' : ''}`;

        row.innerHTML = `
            <span class="material-symbols-rounded" style="cursor:grab; color:#ccc;">drag_indicator</span>
            <input type="checkbox" ${checked ? 'checked' : ''}>
            <input type="text" value="${text.replace(/"/g, '&quot;')}" placeholder="List item">
            <span class="material-symbols-rounded remove-chk" style="cursor:pointer; color:#ccc; font-size:1.2rem;">close</span>
        `;

        const chk = row.querySelector('input[type="checkbox"]');
        chk.addEventListener('change', (e) => {
            if (e.target.checked) row.classList.add('done');
            else row.classList.remove('done');
        });

        const textInput = row.querySelector('input[type="text"]');
        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                // If enter pressed on empty line, do nothing
                if (textInput.value.trim() === '') return;
                this.addChecklistUI('', false, row, context);
            }
        });

        row.querySelector('.remove-chk').addEventListener('click', () => {
            row.remove();
        });

        if (afterNode) {
            afterNode.after(row);
        } else {
            container.appendChild(row);
        }

        // Auto focus new items if empty
        if (!text) textInput.focus();
    }

    toggleModalChecklistMode() {
        this.isChecklistView = !this.isChecklistView;
        const textEl = document.getElementById('note-content-text');

        if (this.isChecklistView) {
            // Converting text to checklist
            const lines = textEl.value.split('\\n').filter(l => l.trim().length > 0);
            document.getElementById('checklist-items').innerHTML = '';
            lines.forEach(line => {
                const text = line.replace(/^- /, '').trim();
                if (text) this.addChecklistUI(text, false, null, 'modal');
            });
            if (lines.length === 0) this.addChecklistUI('', false, null, 'modal');
        } else {
            // Converting checklist to text
            const rows = document.getElementById('checklist-items').querySelectorAll('.checklist-item');
            let text = '';
            rows.forEach(r => {
                const val = r.querySelector('input[type="text"]').value;
                const isChecked = r.querySelector('input[type="checkbox"]').checked;
                if (val) text += (isChecked ? '[x] ' : '- ') + val + '\\n';
            });
            textEl.value = text.trim();
        }

        this.applyModalChecklistViewMode();
    }

    applyModalChecklistViewMode() {
        const textEl = document.getElementById('note-content-text');
        const chkEl = document.getElementById('note-content-checklist');
        const toggleBtn = document.getElementById('toggle-chk-btn');

        if (this.isChecklistView) {
            textEl.style.display = 'none';
            chkEl.style.display = 'flex';
            toggleBtn.style.color = 'var(--md-sys-color-primary, #6750A4)';
            toggleBtn.style.background = 'var(--primary-container, #eaddff)';
        } else {
            textEl.style.display = 'block';
            chkEl.style.display = 'none';
            toggleBtn.style.color = '';
            toggleBtn.style.background = '';
        }
    }

    saveModalNote() {
        const title = document.getElementById('note-title').value.trim();
        const tagsRaw = document.getElementById('note-tags-input').value;
        const tags = tagsRaw ? [tagsRaw] : [];

        let content = '';
        if (this.isChecklistView) {
            const rows = document.getElementById('checklist-items').querySelectorAll('.checklist-item');
            const data = [];
            rows.forEach(r => {
                const val = r.querySelector('input[type="text"]').value.trim();
                const isChecked = r.querySelector('input[type="checkbox"]').checked;
                if (val) data.push({ text: val, done: isChecked });
            });
            content = JSON.stringify(data);
        } else {
            content = document.getElementById('note-content-text').value;
        }

        if (!title && !content.trim()) {
            // Empty note, do nothing
            document.getElementById('note-modal').classList.remove('open');
            return;
        }

        const noteData = {
            title: title || 'Untitled Note',
            content,
            tags,
            isChecklist: this.isChecklistView
        };

        if (this.editingNote) {
            store.updateNote({ id: this.editingNote.id, ...noteData });
        } else {
            store.addNote(noteData);
        }

        document.getElementById('note-modal').classList.remove('open');
    }

    // --- Rendering List ---

    renderList() {
        const listContainer = document.getElementById('notes-list');
        const filtersContainer = document.getElementById('quick-filters');
        if (!listContainer) return;

        let notes = store.state.notes || [];

        // Extract all unique tags
        const allTags = new Set();
        notes.forEach(n => n.tags && n.tags.forEach(t => allTags.add(t)));

        // Render Quick Filters
        filtersContainer.innerHTML = '';
        if (allTags.size > 0) {
            const allBtn = document.createElement('div');
            allBtn.className = `note-tag ${!this.activeFilter ? 'active' : ''}`;
            allBtn.textContent = 'All';
            allBtn.style.cursor = 'pointer';
            if (!this.activeFilter) allBtn.style.background = 'var(--md-sys-color-primary, #6750A4)';
            if (!this.activeFilter) allBtn.style.color = '#fff';
            allBtn.addEventListener('click', () => { this.activeFilter = ''; this.renderList(); });
            filtersContainer.appendChild(allBtn);

            allTags.forEach(tag => {
                const tagBtn = document.createElement('div');
                const isActive = this.activeFilter === tag;
                tagBtn.className = `note-tag`;
                tagBtn.textContent = tag;
                tagBtn.style.cursor = 'pointer';
                if (isActive) {
                    tagBtn.style.background = 'var(--md-sys-color-primary, #6750A4)';
                    tagBtn.style.color = '#fff';
                }
                tagBtn.addEventListener('click', () => { this.activeFilter = tag; this.renderList(); });
                filtersContainer.appendChild(tagBtn);
            });
        }

        // Apply Search and Filters
        notes = notes.filter(n => {
            const matchesSearch = (n.title && n.title.toLowerCase().includes(this.searchQuery)) ||
                (n.content && n.content.toLowerCase().includes(this.searchQuery));
            const matchesFilter = this.activeFilter ? (n.tags && n.tags.includes(this.activeFilter)) : true;
            return matchesSearch && matchesFilter;
        });

        // Use descending date sort
        notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        listContainer.innerHTML = notes.map(note => this.getNoteCardHTML(note)).join('');

        // Attach click listeners to cards
        listContainer.querySelectorAll('.note-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = parseInt(card.getAttribute('data-id'));
                const note = store.state.notes.find(n => n.id === id);
                if (note) this.openEditor(note);
            });
        });
    }

    getNoteCardHTML(note) {
        let contentPreview = '';

        if (note.isChecklist) {
            try {
                const lines = JSON.parse(note.content);
                // Preview first 5
                contentPreview = '<div class="checklist-preview">';
                lines.slice(0, 5).forEach(l => {
                    contentPreview += `<div class="chk-line ${l.done ? 'done' : ''}">
                        <span class="material-symbols-rounded" style="font-size:1rem; color:#888;">${l.done ? 'check_box' : 'check_box_outline_blank'}</span>
                        <span>${l.text}</span>
                    </div>`;
                });
                if (lines.length > 5) contentPreview += `<div class="chk-line"><span style="color:#888; font-size:0.8rem; margin-top:4px;">+${lines.length - 5} more items</span></div>`;
                contentPreview += '</div>';
            } catch (e) {
                contentPreview = "Invalid format";
            }
        } else {
            // Escape HTML for text preview and respect line breaks
            contentPreview = note.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        const tagsHtml = (note.tags || []).map(t => `<span class="note-tag">${t}</span>`).join('');

        return `
            <div class="note-card" data-id="${note.id}">
                <h3>${note.title.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</h3>
                <div class="note-card-content">${contentPreview}</div>
                ${tagsHtml ? `<div class="note-tags">${tagsHtml}</div>` : ''}
            </div>
        `;
    }
}
