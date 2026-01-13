import { store } from '../utils/Store.js';

export default class Appointments {
    constructor(container) {
        this.container = container;
        // Start at current date, but only track Month/Year
        const now = new Date();
        this.displayDate = new Date(now.getFullYear(), now.getMonth(), 1);

        this.render();
        this.unsubscribe = store.subscribe(() => this.render());
    }

    render() {
        const monthName = this.displayDate.toLocaleString('default', { month: 'long' });
        const year = this.displayDate.getFullYear();

        this.container.innerHTML = `
            <div class="page-header">
                <h2>Calendar</h2>
                <div class="calendar-controls">
                    <button id="cal-prev" class="btn btn-icon"><span class="material-symbols-rounded">chevron_left</span></button>
                    <span style="min-width: 150px; text-align: center; font-weight: 500;">${monthName} ${year}</span>
                    <button id="cal-next" class="btn btn-icon"><span class="material-symbols-rounded">chevron_right</span></button>
                </div>
                <!-- Add Button for Calendar specifically -->
                 <button id="add-event-btn" class="btn btn-primary">
                    <span class="material-symbols-rounded">add</span>
                    New Event
                </button>
            </div>
            
            <div class="calendar-grid">
                <div class="weekday">Sun</div>
                <div class="weekday">Mon</div>
                <div class="weekday">Tue</div>
                <div class="weekday">Wed</div>
                <div class="weekday">Thu</div>
                <div class="weekday">Fri</div>
                <div class="weekday">Sat</div>
                
                ${this.generateDays()}
            </div>
        `;

        this.container.querySelector('#add-event-btn').addEventListener('click', () => {
            if (window.app && window.app.addModal) {
                window.app.addModal.open('appointment');
            }
        });

        this.container.querySelector('#cal-prev').addEventListener('click', () => this.changeMonth(-1));
        this.container.querySelector('#cal-next').addEventListener('click', () => this.changeMonth(1));
    }

    changeMonth(delta) {
        // Move by delta months
        this.displayDate.setMonth(this.displayDate.getMonth() + delta);
        this.render();
    }

    getHolidays(month, year) {
        const holidays = [];
        // Simple fixed holidays logic (Month is 0-indexed)
        if (month === 0 && 1) holidays.push({ day: 1, title: "New Year's Day" });
        if (month === 1 && 14) holidays.push({ day: 14, title: "Valentine's Day" });
        if (month === 2 && 17) holidays.push({ day: 17, title: "St. Patrick's Day" });
        if (month === 9 && 31) holidays.push({ day: 31, title: "Halloween" });
        if (month === 11 && 25) holidays.push({ day: 25, title: "Christmas" });
        if (month === 6 && 4) holidays.push({ day: 4, title: "Independence Day" });

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

        // Tasks with dates
        const tasks = store.getTasks(t => t.time && t.time !== 'No Due Date');

        // Holidays
        const holidays = this.getHolidays(month, year);

        // Filler for previous month
        for (let i = 0; i < firstDay; i++) { html += `<div class="day empty"></div>`; }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            // Check formatted date
            const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

            const dayTasks = tasks.filter(t => {
                if (!t.time) return false;
                return t.time.startsWith(dayStr);
            });

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

            dayTasks.forEach(t => {
                taskHtml += `
                    <div class="calendar-task type-${t.type} ${t.completed ? 'completed' : ''}" title="${t.title}">
                        ${t.title}
                    </div>
                `;
            });

            const hasEvent = dayTasks.length > 0 || holiday;

            html += `
                <div class="day ${hasEvent ? 'has-event' : ''}">
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
