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
        const kudos = this.getKudos(stats.weeklyPoints);

        this.container.innerHTML = `
            <div class="page-header">
                <h2>Week in Review 🏆</h2>
            </div>
            
            <div style="max-width: 800px; padding: 16px;">
                <div class="stats-hero" style="background: linear-gradient(135deg, var(--md-sys-color-primary-container), white); padding: 32px; border-radius: 24px; text-align: center; margin-bottom: 32px;">
                    <h1 style="font-size: 3rem; margin: 0; color: var(--md-sys-color-primary);">${stats.total}</h1>
                    <p style="font-size: 1.2rem; margin: 8px 0 24px 0; opacity: 0.8;">Tasks Crushed This Week</p>
                    
                    <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
                        <div class="points-badge" style="background: white; display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <span class="material-symbols-rounded" style="color: #FD7F2C;">local_fire_department</span>
                            <strong>${stats.weeklyPoints} Weekly Points</strong>
                        </div>
                        <div class="points-badge" style="background: white; display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <span class="material-symbols-rounded" style="color: var(--md-sys-color-primary);">star</span>
                            <strong>${stats.points} Lifetime Points</strong>
                        </div>
                    </div>

                    <h3 style="margin-top: 24px; font-style: italic; color: var(--md-sys-color-primary);">"${kudos}"</h3>
                </div>

                <!-- Badges Earned Section -->
                ${(stats.badges.bronze > 0 || stats.badges.silver > 0 || stats.badges.gold > 0) ? `
                <div style="background: white; padding: 24px; border-radius: 24px; border: 1px solid var(--md-sys-color-outline-variant); margin-bottom: 32px; text-align: center;">
                    <h3 style="margin-bottom: 16px; color: var(--md-sys-color-on-surface); font-size: 1.25rem;">Lifetime Badges</h3>
                    <div style="display: flex; justify-content: center; gap: 24px; flex-wrap: wrap;">
                        ${this.createBadgeBadge('Starter', stats.badges.bronze, '#CD7F32')}
                        ${this.createBadgeBadge('Pro', stats.badges.silver, '#C0C0C0')}
                        ${this.createBadgeBadge('Master', stats.badges.gold, '#FFD700')}
                    </div>
                </div>
                ` : `
                <div style="background: white; padding: 24px; border-radius: 24px; border: 1px dashed var(--md-sys-color-outline-variant); margin-bottom: 32px; text-align: center; opacity: 0.7;">
                    <span class="material-symbols-rounded" style="font-size: 32px; color: var(--md-sys-color-outline);">emoji_events</span>
                    <p style="margin-top: 8px;">Earn 500 weekly points to unlock your first badge!</p>
                </div>
                `}

                <div class="breakdown-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
                    ${store.state.settings.showSchool ? this.createStatCard('School', stats.distribution.school, 'school', 'var(--md-sys-color-primary)') : ''}
                    ${store.state.settings.showHouse ? this.createStatCard('House', stats.distribution.house, 'home_work', 'var(--md-sys-color-tertiary)') : ''}
                    ${store.state.settings.showWork ? this.createStatCard('Work', stats.distribution.work, 'work', '#FD7F2C') : ''}
                    ${this.createStatCard('Events', stats.distribution.appointment, 'event', 'var(--md-sys-color-error)')}
                </div>
                
                <!-- How to Earn Points Info Card -->
                <div style="background: var(--surface, #fdf8fd); padding: 24px; border-radius: 24px; border: 1px solid var(--outline-variant, #cac4d0); margin-top: 32px;">
                    <h3 style="margin-top: 0; margin-bottom: 16px; color: var(--on-surface); display: flex; align-items: center; gap: 8px;">
                        <span class="material-symbols-rounded" style="color: var(--md-sys-color-primary);">info</span>
                        How to Earn Focus Points
                    </h3>
                    <ul style="margin: 0; padding-left: 24px; color: var(--on-surface-variant); line-height: 1.6;">
                        <li><strong>100 Points:</strong> Completing a School or Work task.</li>
                        <li><strong>50 Points:</strong> Completing a House chore, Personal Goal, or attending an Event.</li>
                        <li><strong>Badges:</strong> Earn 500, 1000, and 2000 points in a single week to earn Bronze, Silver, and Gold badges!</li>
                    </ul>
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

    createBadgeBadge(label, count, color) {
        if (count === 0) return '';
        return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="background: ${color}20; width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative;">
                    <span class="material-symbols-rounded" style="font-size: 40px; color: ${color};">military_tech</span>
                    ${count > 1 ? `<span style="position: absolute; top: -4px; right: -4px; background: var(--md-sys-color-error); color: white; font-size: 12px; font-weight: bold; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white;">${count}</span>` : ''}
                </div>
                <span style="font-weight: 500; font-size: 0.9rem;">${label}</span>
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
