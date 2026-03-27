import { store } from '../utils/Store.js';

export default class Appointments {
    constructor(container) {
        this.container = container;
        // Start at current date, but only track Month/Year
        const now = new Date();
        this.displayDate = new Date(now.getFullYear(), now.getMonth(), 1);

        // Track the actively selected day for new events
        const monthStr = String(now.getMonth() + 1).padStart(2, '0');
        const dayStr = String(now.getDate()).padStart(2, '0');
        this.selectedDateStr = `${now.getFullYear()}-${monthStr}-${dayStr}`;

        this.render();
        this.unsubscribe = store.subscribe(() => this.render());

        // Ensure html2canvas is available for sharing
        this.loadHtml2Canvas();
    }

    loadHtml2Canvas() {
        if (!window.html2canvas && !document.getElementById('html2canvas-script')) {
            const script = document.createElement('script');
            script.id = 'html2canvas-script';
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            document.head.appendChild(script);
        }
    }

    render() {
        const monthName = this.displayDate.toLocaleString('default', { month: 'long' });
        const year = this.displayDate.getFullYear();

        this.container.innerHTML = `
            <div class="page-header">
                <div class="calendar-controls">
                    <button id="cal-prev" class="btn btn-icon"><span class="material-symbols-rounded">chevron_left</span></button>
                    <span style="min-width: 150px; text-align: center; font-weight: 500;">${monthName} ${year}</span>
                    <button id="cal-next" class="btn btn-icon"><span class="material-symbols-rounded">chevron_right</span></button>
                </div>
                <!-- Controls for Calendar -->
                <div style="display: flex; gap: 8px;">
                    <button id="share-cal-btn" class="btn secondary" title="Share Calendar Image">
                        <span class="material-symbols-rounded">share</span>
                    </button>
                    <button id="add-event-btn" class="btn btn-theme btn-theme-event">
                        <span class="material-symbols-rounded">add</span>
                        New Event
                    </button>
                </div>
            </div>
            
            <div class="calendar-container-wrapper">
                <div class="calendar-grid" id="calendar-capture-area" style="background: var(--surface); padding: 1rem; border-radius: 12px;">
                    <div class="weekday">Sun</div>
                    <div class="weekday">Mon</div>
                    <div class="weekday">Tue</div>
                    <div class="weekday">Wed</div>
                    <div class="weekday">Thu</div>
                    <div class="weekday">Fri</div>
                    <div class="weekday">Sat</div>
                    
                    ${this.generateDays()}
                </div>
            </div>
        `;

        this.container.querySelector('#add-event-btn').addEventListener('click', () => {
            if (window.app && window.app.addModal) {
                // If the user has explicitly selected a day, use it. Otherwise, use the 1st of the currently viewed month.
                let targetDateStr;
                if (this.selectedDateStr) {
                    // Check if selected date naturally falls within the displayed month/year view?
                    // Usually we just respect whatever they last clicked, or default strictly to the 1st if they changed months.
                    targetDateStr = this.selectedDateStr;
                } else {
                    const vYear = this.displayDate.getFullYear();
                    const vMonth = String(this.displayDate.getMonth() + 1).padStart(2, '0');
                    targetDateStr = `${vYear}-${vMonth}-01`;
                }

                window.app.addModal.open('appointment', targetDateStr);
            }
        });

        this.container.querySelector('#share-cal-btn').addEventListener('click', (e) => {
            const btn = e.currentTarget;
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span class="material-symbols-rounded spinning">refresh</span>';
            btn.disabled = true;

            this.shareCalendar().finally(() => {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
            });
        });

        this.container.querySelector('#cal-prev').addEventListener('click', () => this.changeMonth(-1));
        this.container.querySelector('#cal-next').addEventListener('click', () => this.changeMonth(1));

        // Attach click to days
        const grid = this.container.querySelector('.calendar-grid');
        grid.querySelectorAll('.day:not(.empty)').forEach(dayEl => {
            dayEl.addEventListener('click', (e) => {
                // If the user clicked directly on a task block
                const taskEl = e.target.closest('.calendar-task[data-id]');
                if (taskEl) {
                    e.stopPropagation();
                    const taskId = taskEl.getAttribute('data-id');
                    const task = store.state.tasks.find(t => t.id == taskId);
                    if (task && window.app && window.app.addModal) {
                        window.app.addModal.openForEdit(task);
                    }
                    return;
                }

                // Normal Day Selection (highlights the day, no list rendering needed)
                grid.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
                dayEl.classList.add('selected');

                // Add to clicked
                this.selectedDateStr = dayEl.getAttribute('data-date');
            });
        });
    }

    async shareCalendar() {
        if (!window.html2canvas) {
            alert("Share feature is still loading, please try again in a few seconds.");
            return;
        }

        try {
            const captureArea = this.container.querySelector('#calendar-capture-area');
            const monthName = this.displayDate.toLocaleString('default', { month: 'long' });
            const year = this.displayDate.getFullYear();

            // Render canvas
            const canvas = await window.html2canvas(captureArea, {
                scale: 2, // Higher resolution
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--surface') || '#fdf8fd',
                logging: false
            });

            // Convert to blob
            canvas.toBlob(async (blob) => {
                const fileName = `calendar-${monthName}-${year}.png`;
                const file = new File([blob], fileName, { type: 'image/png' });

                // Try native Web Share API
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: `${monthName} Schedule`,
                            text: `Here is my schedule for ${monthName} ${year}!`
                        });
                        return;
                    } catch (err) {
                        if (err.name !== 'AbortError') {
                            console.error("Error sharing:", err);
                        }
                    }
                }

                // Fallback: Download the image directly
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

            }, 'image/png');

        } catch (error) {
            console.error("Failed to capture calendar:", error);
            alert("Could not generate calendar image.");
        }
    }

    changeMonth(delta) {
        // Move by delta months
        this.displayDate.setMonth(this.displayDate.getMonth() + delta);
        this.render();
    }

    getHolidays(month, year) {
        const region = store.state.settings.region || 'US';
        const holidays = [];

        // --- Helper: Find the Nth specific day of a month ---
        // Ex: getNthDayOfMonth(year, 10, 4, 4) -> 4th Thursday (4) of Nov (10)
        const getNthDayOfMonth = (year, testMonth, dayOfWeek, n) => {
            let count = 0;
            for (let d = 1; d <= 31; d++) {
                const date = new Date(year, testMonth, d);
                if (date.getMonth() !== testMonth) break;
                if (date.getDay() === dayOfWeek) {
                    count++;
                    if (count === n) return d;
                }
            }
            return null;
        };

        // --- Helper: Find the Last specific day of a month ---
        // Ex: getLastDayOfMonth(year, 4, 1) -> Last Monday (1) of May (4)
        const getLastDayOfMonth = (year, testMonth, dayOfWeek) => {
            // Start from last day of month and work backwards
            const lastDate = new Date(year, testMonth + 1, 0).getDate();
            for (let d = lastDate; d >= 1; d--) {
                const date = new Date(year, testMonth, d);
                if (date.getDay() === dayOfWeek) return d;
            }
            return null;
        };

        // --- Shared Holidays (US & CA) ---
        if (region === 'US' || region === 'CA') {
            if (month === 0) holidays.push({ day: 1, title: "New Year's Day" });
            if (month === 1) holidays.push({ day: 14, title: "Valentine's Day" });
            if (month === 2) holidays.push({ day: 17, title: "St. Patrick's Day" });
            if (month === 9) holidays.push({ day: 31, title: "Halloween" });
            if (month === 11) holidays.push({ day: 25, title: "Christmas" });

            // Mother's Day (2nd Sunday in May)
            if (month === 4) {
                const mothersDay = getNthDayOfMonth(year, 4, 0, 2);
                if (mothersDay) holidays.push({ day: mothersDay, title: "Mother's Day" });
            }
            // Father's Day (3rd Sunday in June)
            if (month === 5) {
                const fathersDay = getNthDayOfMonth(year, 5, 0, 3);
                if (fathersDay) holidays.push({ day: fathersDay, title: "Father's Day" });
            }
        }

        // --- US Specific Holidays ---
        if (region === 'US') {
            if (month === 6) holidays.push({ day: 4, title: "Independence Day" });
            if (month === 10) holidays.push({ day: 11, title: "Veterans Day" });
            if (month === 5) holidays.push({ day: 19, title: "Juneteenth" });

            // MLK Day (3rd Monday in Jan)
            if (month === 0) {
                const mlk = getNthDayOfMonth(year, 0, 1, 3);
                if (mlk) holidays.push({ day: mlk, title: "MLK Jr. Day" });
            }
            // Presidents Day (3rd Monday in Feb)
            if (month === 1) {
                const pres = getNthDayOfMonth(year, 1, 1, 3);
                if (pres) holidays.push({ day: pres, title: "Presidents' Day" });
            }
            // Memorial Day (Last Monday in May)
            if (month === 4) {
                const memDay = getLastDayOfMonth(year, 4, 1);
                if (memDay) holidays.push({ day: memDay, title: "Memorial Day" });
            }
            // Labor Day (1st Monday in Sept)
            if (month === 8) {
                const laborDay = getNthDayOfMonth(year, 8, 1, 1);
                if (laborDay) holidays.push({ day: laborDay, title: "Labor Day" });
            }
            // Thanksgiving (4th Thursday in Nov)
            if (month === 10) {
                const tgiving = getNthDayOfMonth(year, 10, 4, 4);
                if (tgiving) holidays.push({ day: tgiving, title: "Thanksgiving" });
            }
        }

        // --- Canada Specific Holidays ---
        if (region === 'CA') {
            if (month === 6) holidays.push({ day: 1, title: "Canada Day" });
            if (month === 10) holidays.push({ day: 11, title: "Remembrance Day" });
            if (month === 11) holidays.push({ day: 26, title: "Boxing Day" });

            // Victoria Day (Last Monday preceding May 25)
            if (month === 4) {
                for (let d = 24; d >= 18; d--) {
                    if (new Date(year, 4, d).getDay() === 1) {
                        holidays.push({ day: d, title: "Victoria Day" });
                        break;
                    }
                }
            }
            // Canada Thanksgiving (2nd Monday in Oct)
            if (month === 9) {
                const tgiving = getNthDayOfMonth(year, 9, 1, 2);
                if (tgiving) holidays.push({ day: tgiving, title: "Thanksgiving" });
            }
            // Labour Day (1st Monday in Sept)
            if (month === 8) {
                const labourDay = getNthDayOfMonth(year, 8, 1, 1);
                if (labourDay) holidays.push({ day: labourDay, title: "Labour Day" });
            }
        }

        // GB and AU can be added similarly with their algorithms
        if (region === 'GB') {
            // Simplified GB list
            if (month === 11) holidays.push({ day: 25, title: "Christmas" }, { day: 26, title: "Boxing Day" });
            if (month === 0) holidays.push({ day: 1, title: "New Year's Day" });
        }

        if (region === 'AU') {
            // Simplified AU list
            if (month === 0) holidays.push({ day: 26, title: "Australia Day" });
            if (month === 3) holidays.push({ day: 25, title: "ANZAC Day" });
            if (month === 11) holidays.push({ day: 25, title: "Christmas" }, { day: 26, title: "Boxing Day" });
        }

        return holidays;
    }

    generateDays() {
        let html = '';
        const year = this.displayDate.getFullYear();
        const month = this.displayDate.getMonth(); // 0-indexed

        // First day of this month
        const firstDay = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
        // Days in this month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Calculate the date 7 days ago to hide old completed tasks
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        oneWeekAgo.setHours(0, 0, 0, 0);

        // Tasks with dates
        const tasks = store.getTasks(t => {
            if (!t.time || t.time === 'No Due Date') return false;

            // Hide automated occasion reminders from the calendar UI
            if (t.isOccasionReminder) return false;

            // If the task is completed, check how old it is
            if (t.completed) {
                const parts = t.time.split('-');
                if (parts.length === 3) {
                    const taskDate = new Date(parts[0], parts[1] - 1, parts[2]);
                    if (taskDate < oneWeekAgo) {
                        return false; // Hide if older than 7 days
                    }
                }
            }
            return true;
        });

        // Holidays
        const holidays = this.getHolidays(month, year);

        // Filler for previous month
        for (let i = 0; i < firstDay; i++) { html += `<div class="day empty"></div>`; }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            // Check formatted date
            const monthDayStr = `-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayStr = `${year}${monthDayStr}`;

            const dayTasks = tasks.filter(t => t.time && t.time.startsWith(dayStr));

            // Check Special Occasion
            const occasions = store.state.settings.specialOccasions || [];
            const dayOccasions = occasions.filter(o => o.date.slice(-5) === monthDayStr.substring(1)); // safely handle YYYY-MM-DD and MM-DD

            // Check holiday
            const holiday = holidays.find(h => h.day === i);

            let taskHtml = '';

            if (holiday) {
                taskHtml += `
                    <div class="calendar-task type-holiday">
                        🎉 ${holiday.title}
                    </div>
                `;
            }



            dayOccasions.forEach(occ => {
                taskHtml += `
                    <div class="calendar-task type-annual" title="${occ.name}">
                        ${occ.name}
                    </div>
                `;
            });

            dayTasks.forEach(t => {
                taskHtml += `
                    <div class="calendar-task type-${t.type} ${t.completed ? 'completed' : ''}" title="${t.title}" data-id="${t.id}">
                        ${t.title}
                    </div>
                `;
            });

            const hasEvent = dayTasks.length > 0 || holiday || dayOccasions.length > 0;

            html += `
                <div class="day ${hasEvent ? 'has-event' : ''} ${this.selectedDateStr === dayStr ? 'selected' : ''}" data-date="${dayStr}">
                    <span class="date-number">${i}</span>
                    <div class="day-events">
                        ${taskHtml}
                    </div>
                </div>
            `;
        }
        return html;
    }

    destroy() {
        if (this.unsubscribe) this.unsubscribe();
    }
}
