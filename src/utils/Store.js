export default class Store {
    constructor() {
        this.STORAGE_KEY = 'adhd-app-data';
        this.listeners = [];
        this.state = this.load();
    }

    load() {
        // Default Initial State
        const defaults = {
            tasks: [
                { id: 1, title: 'Welcome to your new organizer!', type: 'school', time: 'Today', completed: false, created: Date.now() }
            ],
            points: 0,
            streak: 0,
            settings: {
                username: 'Friend',
                themeColor: '#6750A4', // Default Primary
                font: 'Roboto',
                showSchool: true,
                showHouse: true,
                showWork: true,
                showWork: true,
                showGoals: true,
                showCalendar: true
            }
        };

        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Deep merge simply: ensure settings exist
            return {
                ...defaults,
                ...parsed,
                settings: { ...defaults.settings, ...(parsed.settings || {}) }
            };
        }

        return defaults;
    }

    save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
        this.notify();
    }

    // CRUD
    addTask(task) {
        const newTask = {
            id: Date.now(),
            completed: false,
            created: Date.now(),
            ...task
        };
        this.state.tasks.push(newTask);
        this.save();
        return newTask;
    }

    updateTask(updatedTask) {
        const index = this.state.tasks.findIndex(t => t.id === updatedTask.id);
        if (index !== -1) {
            this.state.tasks[index] = { ...this.state.tasks[index], ...updatedTask };
            this.save();
        }
    }

    toggleTask(id) {
        const task = this.state.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;

            // Gamification Logic - "Focus Points"
            // School/Work = 100, House/Appointment/Goal = 50
            const pointsMap = { 'school': 100, 'work': 100, 'house': 50, 'appointment': 50, 'goal': 50 };
            const reward = pointsMap[task.type] || 50;

            if (task.completed) {
                this.state.points += reward;
                task.completedAt = new Date().toISOString();
            } else {
                this.state.points -= reward;
                delete task.completedAt;
            }

            this.save();
        }
    }

    deleteTask(id) {
        this.state.tasks = this.state.tasks.filter(t => t.id !== id);
        this.save();
    }

    getTasks(filterFn) {
        if (!filterFn) return this.state.tasks;
        return this.state.tasks.filter(filterFn);
    }

    getOverdueTasks() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        return this.state.tasks.filter(t => {
            if (t.completed) return false;
            if (!t.time || t.time === 'No Due Date') return false;

            // Check if date is before today
            let taskDateStr = t.time;
            if (t.time.includes('T')) {
                taskDateStr = t.time.split('T')[0];
            }
            return taskDateStr < todayStr;
        });
    }

    addPoints(amount) {
        this.state.points += amount;
        this.save();
    }

    getWeeklyStats() {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Filter completed tasks within last 7 days
        const completed = this.state.tasks.filter(t => {
            if (!t.completed) return false;
            // We don't have a 'completedAt' timestamp yet, so we'll use 'created' or just assume manual toggle = done recently for this MVP
            // Ideally we'd add 'completedAt' to the task object when toggling.
            // For now, let's just count ALL completed tasks as a simple "Total Completed" stat, 
            // OR we can add completedAt logic now. Let's add completedAt logic to toggleTask for better accuracy.
            return t.completedAt && new Date(t.completedAt) > oneWeekAgo;
        });

        // Distribution
        const distribution = { school: 0, house: 0, work: 0, appointment: 0 };
        completed.forEach(t => {
            if (distribution[t.type] !== undefined) distribution[t.type]++;
        });

        return {
            total: completed.length,
            distribution,
            points: this.state.points // Current total points
        };
    }

    updateSettings(newSettings) {
        this.state.settings = { ...this.state.settings, ...newSettings };
        this.save();
    }

    clearData() {
        this.state.tasks = [];
        this.state.points = 0;
        this.state.streak = 0;
        this.save();
    }



    // Pub/Sub for Reactivity
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}

// Singleton instance
export const store = new Store();
