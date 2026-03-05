export default class FocusMode {
    constructor() {
        this.isActive = false;
        this.timerInterval = null;
        this.timeLeft = 25 * 60; // 25 minutes default
        this.overlay = this.createOverlay();
        document.body.appendChild(this.overlay);
    }

    createOverlay() {
        const div = document.createElement('div');
        div.id = 'focus-overlay';
        div.innerHTML = `
            <button id="focus-back-btn" class="btn btn-icon" title="Back to Dashboard" style="position: absolute; top: 24px; left: 24px; color: var(--text-color, white); background: rgba(0,0,0,0.2);">
                <span class="material-symbols-rounded" style="font-size: 28px;">arrow_back</span>
            </button>
            <div class="focus-content">
                <span class="material-symbols-rounded focus-icon">self_improvement</span>
                <h2>Focus Mode</h2>
                <div style="display: flex; align-items: center; justify-content: center; gap: 16px;">
                    <button class="btn btn-icon adjust-timer-btn" data-amount="-5" title="Decrease 5 minutes">
                        <span class="material-symbols-rounded">remove</span>
                    </button>
                    <div class="timer-display" style="font-variant-numeric: tabular-nums;">25:00</div>
                    <button class="btn btn-icon adjust-timer-btn" data-amount="5" title="Increase 5 minutes">
                        <span class="material-symbols-rounded">add</span>
                    </button>
                </div>
                <div class="focus-controls">
                    <button id="start-timer" class="btn btn-primary">Start Focus</button>
                    <button id="exit-focus" class="btn">Exit</button>
                </div>
                <p class="focus-quote">"One thing at a time."</p>
            </div>
        `;

        div.querySelector('#start-timer').addEventListener('click', () => this.toggleTimer());
        div.querySelector('#exit-focus').addEventListener('click', () => this.hide());
        div.querySelectorAll('.adjust-timer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = parseInt(e.currentTarget.dataset.amount);
                this.adjustTimer(amount);
            });
        });
        div.querySelector('#focus-back-btn').addEventListener('click', () => {
            this.hide();
            window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'dashboard' } }));

            // Force sidebar UI update to dashboard
            const items = document.querySelectorAll('.nav-item');
            items.forEach(i => i.classList.remove('active'));
            const dash = document.querySelector('.nav-item[data-page="dashboard"]');
            if (dash) dash.classList.add('active');
        });

        return div;
    }

    show() {
        this.overlay.classList.add('visible');
        this.isActive = true;
    }

    hide() {
        this.overlay.classList.remove('visible');
        this.isActive = false;
        this.stopTimer();
    }

    toggleTimer() {
        if (this.timerInterval) {
            this.stopTimer();
            this.overlay.querySelector('#start-timer').textContent = "Resume";
            this.setAdjustmentButtonsDisabled(false);
        } else {
            this.startTimer();
            this.overlay.querySelector('#start-timer').textContent = "Pause";
            this.setAdjustmentButtonsDisabled(true);
        }
    }

    setAdjustmentButtonsDisabled(disabled) {
        this.overlay.querySelectorAll('.adjust-timer-btn').forEach(btn => {
            btn.disabled = disabled;
            btn.style.opacity = disabled ? '0.3' : '1';
            btn.style.cursor = disabled ? 'not-allowed' : 'pointer';
        });
    }

    adjustTimer(minutes) {
        this.timeLeft += (minutes * 60);
        if (this.timeLeft < 60) this.timeLeft = 60; // minimum 1 minute
        if (this.timeLeft > 120 * 60) this.timeLeft = 120 * 60; // Max 2 hours
        this.updateDisplay();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                this.updateDisplay();
            } else {
                this.stopTimer();
                // Play sound or notify
                alert("Great work! Take a break.");
            }
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    }

    updateDisplay() {
        const m = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
        const s = (this.timeLeft % 60).toString().padStart(2, '0');
        this.overlay.querySelector('.timer-display').textContent = `${m}:${s}`;
    }
}
