import { store } from '../utils/Store.js';

export default class WeekReview {
    constructor(container) {
        this.container = container;
        this.render();
        this.unsubscribe = store.subscribe(() => this.render());
    }

    destroy() {
        if (this.unsubscribe) this.unsubscribe();
    }

    render() {
        const stats = store.getWeeklyStats();
        const kudos = this.getKudos(stats.points);

        this.container.innerHTML = `
            <div class="page-header">
                <h2>Week in Review 🏆</h2>
            </div>
            
            <div style="max-width: 800px; padding: 16px;">
                <div class="stats-hero" style="background: linear-gradient(135deg, var(--md-sys-color-primary-container), white); padding: 32px; border-radius: 24px; text-align: center; margin-bottom: 32px;">
                    <h1 style="font-size: 3rem; margin: 0; color: var(--md-sys-color-primary);">${stats.total}</h1>
                    <p style="font-size: 1.2rem; margin: 8px 0 24px 0; opacity: 0.8;">Tasks Crushed This Week</p>
                    
                    <div style="background: white; display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <span class="material-symbols-rounded" style="color: #FD7F2C;">military_tech</span>
                        <strong>${stats.points} Total Points</strong>
                    </div>

                    <h3 style="margin-top: 24px; font-style: italic; color: var(--md-sys-color-primary);">"${kudos}"</h3>
                </div>

                <div class="breakdown-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
                    ${store.state.settings.showSchool ? this.createStatCard('School', stats.distribution.school, 'school', 'var(--md-sys-color-primary)') : ''}
                    ${store.state.settings.showHouse ? this.createStatCard('House', stats.distribution.house, 'home_work', 'var(--md-sys-color-tertiary)') : ''}
                    ${store.state.settings.showWork ? this.createStatCard('Work', stats.distribution.work, 'work', '#FD7F2C') : ''}
                    ${this.createStatCard('Events', stats.distribution.appointment, 'event', 'var(--md-sys-color-error)')}
                </div>
            </div>
        `;
    }

    createStatCard(label, count, icon, color) {
        return `
            <div style="background: white; padding: 16px; border-radius: 16px; border: 1px solid var(--md-sys-color-outline-variant); display: flex; flex-direction: column; align-items: center;">
                <span class="material-symbols-rounded" style="font-size: 24px; color: ${color}; margin-bottom: 8px;">${icon}</span>
                <span style="font-size: 2rem; font-weight: bold;">${count}</span>
                <span style="font-size: 0.9rem; opacity: 0.7;">${label}</span>
            </div>
        `;
    }

    getKudos(points) {
        if (points === 0) return "A fresh start awaits! Let's go!";
        if (points < 500) return "Good start! Keep building that momentum.";
        if (points < 1000) return "Solid effort! You're making real progress.";
        if (points < 2000) return "You are ON FIRE! Incredible focus!";
        return "UNSTOPPABLE! You are mastering your schedule!";
    }
}
