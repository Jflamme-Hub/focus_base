import { store } from './Store.js';

export default class NotificationManager {
    constructor() {
        this.checkInterval = null;
        this.notifiedTasks = new Set(); // Track things we've already alerted
        this.init();
    }

    async init() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.scheduleDailySummary();
                this.startPolling();
            }
        }
    }

    startPolling() {
        // Check every minute
        this.checkInterval = setInterval(() => this.checkReminders(), 60000);
        this.checkReminders(); // Initial check
    }

    checkReminders() {
        const now = new Date();
        const tasks = store.getTasks(t => !t.completed && t.time);

        tasks.forEach(task => {
            if (this.notifiedTasks.has(task.id)) return;

            // Only warn for tasks with specific times
            if (!task.time.includes('T')) return;

            const taskTime = new Date(task.time);
            if (isNaN(taskTime.getTime())) return; // Invalid date (maybe old "text" format)

            const diffMs = taskTime - now;
            const diffMinutes = Math.floor(diffMs / 60000);

            // Notify if between 14-16 minutes remaining (15 min warning)
            if (diffMinutes >= 14 && diffMinutes <= 16) {
                this.sendNotification(`Upcoming: ${task.title}`, `Starting in 15 minutes!`);
                this.notifiedTasks.add(task.id);
            }
        });

        // Routine Reminders
        const todayWeekday = new Date().toLocaleDateString('en-US', { weekday: 'short' });
        const routines = store.state.routines || [];

        routines.forEach(routine => {
            if (!routine.remindersEnabled || !routine.time) return;
            if (!routine.days || !routine.days.includes(todayWeekday)) return;

            // Only alert if all checklist items ARE NOT completed
            if (routine.checklist.length > 0 && routine.checklist.every(item => item.completed)) return;

            const routineTimeParts = routine.time.split(':');
            if (routineTimeParts.length !== 2) return;

            const routineDate = new Date();
            routineDate.setHours(parseInt(routineTimeParts[0], 10), parseInt(routineTimeParts[1], 10), 0, 0);

            const diffMs = routineDate - now;
            const diffMinutes = Math.floor(diffMs / 60000);
            const notifId = `routine_${routine.id}_${now.toDateString()}`; // unique per day

            // Notify if exactly on time or up to 1 minute late
            if (diffMinutes >= -1 && diffMinutes <= 0 && !this.notifiedTasks.has(notifId)) {
                let bodyHtml = `It's time for: <strong>${routine.title}</strong>`;
                if (routine.checklist && routine.checklist.length > 0) {
                    bodyHtml += `<ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px;">`;
                    routine.checklist.forEach(item => {
                        bodyHtml += `<li style="margin-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 2px;">${item.text}</li>`;
                    });
                    bodyHtml += `</ul>`;
                }

                this.sendNotification(`Routine Reminder 🕒`, bodyHtml, 25000);
                this.notifiedTasks.add(notifId);
            }
        });
    }

    scheduleDailySummary() {
        setTimeout(() => {
            const now = new Date();
            const todayStr = now.toISOString().slice(0, 10);

            // Only show the summary once per day to avoid spamming on reload
            const lastSummaryDate = localStorage.getItem('lastDailySummary');
            if (lastSummaryDate === todayStr) return;

            const hour = now.getHours();

            let greeting = 'Good Evening! 🌙';
            if (hour >= 5 && hour < 12) greeting = 'Good Morning! ☀️';
            else if (hour >= 12 && hour < 17) greeting = 'Good Afternoon! ☕';

            const tasks = store.getTasks(t => !t.completed && t.time && t.time.startsWith(todayStr));
            if (tasks.length > 0) {
                // We won't chime the daily summary, just silent toast
                this.showToast(greeting, `You have ${tasks.length} tasks scheduled for today.`);
                localStorage.setItem('lastDailySummary', todayStr);
            }
        }, 2000);
    }

    sendNotification(title, body, durationMs = 12000) {
        // Native OS Notification (often hidden by Windows Focus Assist)
        const plainBody = body.replace(/<[^>]*>?/gm, ''); // strip html for native
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body: plainBody,
                icon: 'https://fonts.gstatic.com/s/i/materialiconsoutlined/notifications_active/v14/24px.svg'
            });
        }

        this.playChime();
        this.showToast(title, body, durationMs);
        console.log(`Notification: ${title} - ${plainBody}`);
    }

    playChime() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const playTone = (freq, startTime, duration) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, startTime);

                // Attack / Release envelope
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

                osc.start(startTime);
                osc.stop(startTime + duration);
            };

            const now = ctx.currentTime;
            playTone(880.00, now, 0.4);       // A5
            playTone(1046.50, now + 0.15, 0.6); // C6
        } catch (e) {
            console.error("Audio failed to play", e);
        }
    }

    showToast(title, body, durationMs = 12000) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                bottom: 24px;
                right: 24px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                z-index: 99999;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.style.cssText = `
            background: var(--md-sys-color-primary, #6750A4);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
            display: flex;
            align-items: flex-start;
            gap: 16px;
            transform: translateX(120%);
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            max-width: 350px;
            max-height: 80vh;
            overflow-y: auto;
            pointer-events: auto;
        `;

        // Add custom scrollbar styling for the toast just once
        if (!document.getElementById('toast-scroll-style')) {
            const style = document.createElement('style');
            style.id = 'toast-scroll-style';
            style.textContent = `
                #toast-container > div::-webkit-scrollbar { width: 6px; }
                #toast-container > div::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 8px; }
                #toast-container > div::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.4); border-radius: 8px; }
                #toast-container > div::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.6); }
            `;
            document.head.appendChild(style);
        }

        toast.innerHTML = `
            <span class="material-symbols-rounded" style="font-size: 32px; color: #FFD700; margin-top: 2px;">notifications_active</span>
            <div style="flex: 1;">
                <strong style="display: block; font-size: 16px; margin-bottom: 4px;">${title}</strong>
                <div style="font-size: 14px; opacity: 0.9;">${body}</div>
            </div>
            <button class="btn-icon close-toast" style="color: white; margin-left: 8px; background: rgba(255,255,255,0.1); border: none; cursor: pointer; padding: 4px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span class="material-symbols-rounded" style="font-size: 18px;">close</span>
            </button>
        `;

        container.appendChild(toast);

        // Slide in
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.style.transform = 'translateX(0)';
            });
        });

        const closeToast = () => {
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => toast.remove(), 400);
        };

        toast.querySelector('.close-toast').addEventListener('click', closeToast);

        // Auto close after durationMs
        setTimeout(closeToast, durationMs);
    }
}
