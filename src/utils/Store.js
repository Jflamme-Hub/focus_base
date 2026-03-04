export default class Store {
    constructor() {
        this.STORAGE_KEY = 'adhd-app-data';
        this.listeners = [];
        this.state = this.load();
        this.checkWeeklyReset();
        this.cleanOldTasks();
        this.checkRoutineResets();
    }

    checkRoutineResets() {
        const todayStr = new Date().toISOString().split('T')[0];
        let changed = false;

        if (!this.state.routines) this.state.routines = [];

        this.state.routines.forEach(rtn => {
            if (rtn.lastResetDate !== todayStr) {
                rtn.checklist.forEach(item => item.completed = false);
                rtn.lastResetDate = todayStr;
                changed = true;
            }
        });

        if (changed) this.save();
    }

    getCurrentWeek() {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return d.getUTCFullYear() + '-W' + weekNo;
    }

    checkWeeklyReset() {
        const thisWeek = this.getCurrentWeek();
        if (this.state.currentWeek !== thisWeek) {
            this.state.currentWeek = thisWeek;
            this.state.weeklyPoints = 0;
            this.state.awardedThisWeek = { bronze: false, silver: false, gold: false };
            this.save();
        }
    }

    cleanOldTasks() {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        let tasksChanged = false;

        this.state.tasks = this.state.tasks.filter(t => {
            // Rule 1: Remove if completed > 7 days ago
            if (t.completed && t.completedAt) {
                const completedDate = new Date(t.completedAt);
                if (completedDate < sevenDaysAgo) {
                    tasksChanged = true;
                    return false; // delete task
                }
            }

            // Rule 2: Overdue pending task check
            if (!t.completed && t.time && t.time !== 'No Due Date') {
                let taskDate = t.time;
                if (t.time.includes('T')) {
                    taskDate = t.time.split('T')[0];
                }
                const tDateObj = new Date(taskDate + 'T12:00:00'); // set noon to avoid timezone shift

                if (tDateObj < sevenDaysAgo) {
                    // It's strictly 7+ days overdue. Prompt the user.
                    // This uses the native browser confirm API.
                    const keep = window.confirm(`The task "${t.title}" is over 7 days overdue. Keep it on your list?\n\nOK to keep, Cancel to delete as missed.`);

                    if (keep) {
                        // User wants to keep it. Move it to Today so we don't prompt again tomorrow.
                        t.time = now.toISOString().split('T')[0];
                        tasksChanged = true;
                        return true;
                    } else {
                        // User wants to delete it.
                        tasksChanged = true;
                        return false;
                    }
                }
            }

            return true; // default keep
        });

        if (tasksChanged) {
            this.save();
        }
    }

    updateBadges() {
        const points = this.state.weeklyPoints;
        let awarded = false;

        if (points >= 500 && !this.state.awardedThisWeek.bronze) {
            this.state.badges.bronze += 1;
            this.state.awardedThisWeek.bronze = true;
            awarded = true;
        }
        if (points >= 1000 && !this.state.awardedThisWeek.silver) {
            this.state.badges.silver += 1;
            this.state.awardedThisWeek.silver = true;
            awarded = true;
        }
        if (points >= 2000 && !this.state.awardedThisWeek.gold) {
            this.state.badges.gold += 1;
            this.state.awardedThisWeek.gold = true;
            awarded = true;
        }

        if (awarded) {
            this.save();
        }
    }

    load() {
        // Default Initial State
        const defaults = {
            tasks: [
                { id: 1, title: 'Welcome to your new organizer!', type: 'school', time: 'Today', completed: false, created: Date.now() }
            ],
            routines: [],
            notes: [],
            points: 0,
            streak: 0,
            weeklyPoints: 0,
            currentWeek: this.getCurrentWeek(),
            badges: { bronze: 0, silver: 0, gold: 0 },
            awardedThisWeek: { bronze: false, silver: false, gold: false },
            settings: {
                username: 'Friend',
                themeColor: '#6750A4', // Default Primary
                colorSchool: '#1565C0', // Changed to deep blue from purple
                colorHouse: '#006A60',
                colorWork: '#FD7F2C',
                colorEvent: '#B3261E',
                colorGoal: '#1E88E5',
                font: 'Roboto',
                showSchool: true,
                showHouse: true,
                showWork: true,
                showGoals: true,
                showCalendar: true
            }
        };

        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);

            // Migration for older clients without badge features
            if (!parsed.badges) parsed.badges = { bronze: 0, silver: 0, gold: 0 };
            if (typeof parsed.weeklyPoints !== 'number') parsed.weeklyPoints = 0;
            if (!parsed.currentWeek) parsed.currentWeek = this.getCurrentWeek();
            if (!parsed.awardedThisWeek) parsed.awardedThisWeek = { bronze: false, silver: false, gold: false };
            if (!parsed.routines) parsed.routines = [];
            if (!parsed.notes) parsed.notes = [];

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

        // Auto-Reminder Logic
        if (newTask.time && newTask.time !== 'No Due Date' && newTask.time.includes('T') === false) {
            const titleLower = newTask.title.toLowerCase();
            if (titleLower.includes('exam') || titleLower.includes('project') || titleLower.includes('study')) {

                const dueDate = new Date(newTask.time + 'T12:00:00'); // Use noon to avoid timezone shift to previous day

                // 7 Days Ahead
                const sevenDays = new Date(dueDate);
                sevenDays.setDate(sevenDays.getDate() - 7);

                // 3 Days Ahead
                const threeDays = new Date(dueDate);
                threeDays.setDate(threeDays.getDate() - 3);

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Only add if the reminder date hasn't already passed
                if (sevenDays >= today) {
                    this.state.tasks.push({
                        id: Date.now() + 1,
                        title: `Start preparing: ${newTask.title}`,
                        type: newTask.type,
                        time: sevenDays.toISOString().split('T')[0],
                        completed: false,
                        created: Date.now(),
                        notes: `Automated 7 - day reminder for: ${newTask.title} `
                    });
                }

                if (threeDays >= today) {
                    this.state.tasks.push({
                        id: Date.now() + 2,
                        title: `Final push: ${newTask.title} `,
                        type: newTask.type,
                        time: threeDays.toISOString().split('T')[0],
                        completed: false,
                        created: Date.now(),
                        notes: `Automated 3 - day reminder for: ${newTask.title} `
                    });
                }
            }
        }

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
        this.checkWeeklyReset();

        const task = this.state.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;

            // Gamification Logic - "Focus Points"
            // School/Work = 100, House/Appointment/Goal = 50
            const pointsMap = { 'school': 100, 'work': 100, 'house': 50, 'appointment': 50, 'goal': 50 };
            const reward = pointsMap[task.type] || 50;

            if (task.completed) {
                this.state.points += reward;
                this.state.weeklyPoints += reward;
                task.completedAt = new Date().toISOString();
            } else {
                this.state.points -= reward;
                this.state.weeklyPoints = Math.max(0, this.state.weeklyPoints - reward);
                delete task.completedAt;
            }

            this.updateBadges();
            this.save();
        }
    }

    deleteTask(id) {
        this.state.tasks = this.state.tasks.filter(t => t.id !== id);
        this.save();
    }

    // --- Routine CRUD ---
    addRoutine(routine) {
        const todayStr = new Date().toISOString().split('T')[0];
        const newRoutine = {
            id: Date.now(),
            lastResetDate: todayStr,
            checklist: [],
            ...routine
        };
        this.state.routines.push(newRoutine);
        this.save();
        return newRoutine;
    }

    updateRoutine(updatedRoutine) {
        const index = this.state.routines.findIndex(r => r.id === updatedRoutine.id);
        if (index !== -1) {
            this.state.routines[index] = { ...this.state.routines[index], ...updatedRoutine };
            this.save();
        }
    }

    deleteRoutine(id) {
        this.state.routines = this.state.routines.filter(r => r.id !== id);
        this.save();
    }

    toggleRoutineItem(routineId, itemId) {
        const routine = this.state.routines.find(r => r.id === routineId);
        if (routine) {
            const item = routine.checklist.find(i => i.id === itemId);
            if (item) {
                item.completed = !item.completed;
                this.save();
            }
        }
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
            points: this.state.points, // Current total points
            weeklyPoints: this.state.weeklyPoints,
            badges: this.state.badges
        };
    }

    updateSettings(newSettings) {
        this.state.settings = { ...this.state.settings, ...newSettings };
        this.save();
    }

    // --- Notes CRUD ---
    addNote(note) {
        const newNote = {
            id: Date.now(),
            title: '',
            content: '',
            tags: [],
            isChecklist: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...note
        };
        this.state.notes.push(newNote);
        this.save();
        return newNote;
    }

    updateNote(updatedNote) {
        const index = this.state.notes.findIndex(n => n.id === updatedNote.id);
        if (index !== -1) {
            this.state.notes[index] = {
                ...this.state.notes[index],
                ...updatedNote,
                updatedAt: new Date().toISOString()
            };
            this.save();
        }
    }

    deleteNote(id) {
        this.state.notes = this.state.notes.filter(n => n.id !== id);
        this.save();
    }

    clearData() {
        this.state.tasks = [];
        this.state.routines = [];
        this.state.points = 0;
        this.state.streak = 0;
        this.state.weeklyPoints = 0;
        this.state.badges = { bronze: 0, silver: 0, gold: 0 };
        this.state.awardedThisWeek = { bronze: false, silver: false, gold: false };

        // Wipe settings back to defaults entirely
        const freshState = this.load();

        // Because load() merges with what's in localStorage, 
        // we need to explicitly inject the clean defaults it returns when localStorage is empty.
        // We'll just hardcode the default wipe here for settings.
        this.state.settings = {
            username: 'Friend',
            themeColor: '#6750A4',
            colorSchool: '#1565C0',
            colorHouse: '#006A60',
            colorWork: '#FD7F2C',
            colorEvent: '#B3261E',
            colorGoal: '#1E88E5',
            font: 'Roboto',
            showSchool: true,
            showHouse: true,
            showWork: true,
            showGoals: true,
            showCalendar: true
        };

        this.state.notes = [];
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
