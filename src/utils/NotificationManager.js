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
    }

    scheduleDailySummary() {
        // In a real dedicated app, this would run at a specific time (e.g. 8 AM).
        // For this web-app, we'll run it on load if there are items due today.
        setTimeout(() => {
            const todayStr = new Date().toISOString().slice(0, 10);
            const tasks = store.getTasks(t => !t.completed && t.time && t.time.startsWith(todayStr));

            if (tasks.length > 0) {
                this.sendNotification(`Good Morning! ☀️`, `You have ${tasks.length} tasks scheduled for today.`);
            }
        }, 2000); // Small delay after load
    }

    sendNotification(title, body) {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: 'https://fonts.gstatic.com/s/i/materialiconsoutlined/notifications_active/v14/24px.svg' // Generic icon
            });
        }

        // Also show in-app toast later if requested
        console.log(`Notification: ${title} - ${body}`);
    }
}
