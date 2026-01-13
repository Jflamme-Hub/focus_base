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
            <div class="focus-content">
                <span class="material-symbols-rounded focus-icon">self_improvement</span>
                <h2>Focus Mode</h2>
                <div class="timer-display">25:00</div>
                <div class="focus-controls">
                    <button id="start-timer" class="btn btn-primary">Start Focus</button>
                    <button id="exit-focus" class="btn">Exit</button>
                </div>
                <p class="focus-quote">"One thing at a time."</p>
            </div>
        `;

        div.querySelector('#start-timer').addEventListener('click', () => this.toggleTimer());
        div.querySelector('#exit-focus').addEventListener('click', () => this.hide());

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
        } else {
            this.startTimer();
            this.overlay.querySelector('#start-timer').textContent = "Pause";
        }
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
