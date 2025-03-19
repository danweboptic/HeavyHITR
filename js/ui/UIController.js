import { formatTime } from '../utils/TimeFormatter.js';

class UIController {
    constructor() {
        this.elements = {
            workoutStatus: document.getElementById('workoutStatus'),
            currentExercise: document.getElementById('currentExercise'),
            timerDisplay: document.getElementById('timerDisplay'),
            currentRoundElement: document.getElementById('currentRound'),
            totalRoundsElement: document.getElementById('totalRounds'),
            roundTypeElement: document.getElementById('roundType'),
            progressBar: document.getElementById('progressBar'),
            startPauseBtn: document.getElementById('startPauseBtn'),
            configScreen: document.getElementById('configScreen'),
            historyScreen: document.getElementById('historyScreen'),
            workoutScreen: document.getElementById('workoutScreen'),
            workoutHistoryList: document.getElementById('workoutHistoryList'),
            emptyHistoryMessage: document.getElementById('emptyHistoryMessage'),
            volumeBtn: document.getElementById('volumeBtn'),
            volumeControl: document.getElementById('volumeControl')
        };

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Volume control listeners
        this.elements.volumeBtn.addEventListener('click', () => this.handleVolumeButtonClick());
        this.elements.volumeControl.addEventListener('input', () => this.updateVolumeIcon());
    }

    updateUI(workoutState) {
        this.updateTimer(workoutState.timeRemaining);
        
        switch (workoutState.status) {
            case 'ready':
                this.updateReadyState(workoutState);
                break;
            case 'round':
                this.updateRoundState(workoutState);
                break;
            case 'rest':
                this.updateRestState(workoutState);
                break;
            case 'complete':
                this.updateCompleteState(workoutState);
                break;
        }
    }

    updateTimer(timeRemaining) {
        this.elements.timerDisplay.textContent = formatTime(timeRemaining);
    }

    updateReadyState(workoutState) {
        this.elements.workoutStatus.textContent = 'Get Ready!';
        this.elements.currentExercise.textContent = `Workout will begin in ${workoutState.timeRemaining} seconds`;
        this.elements.currentRoundElement.textContent = '0';
        this.elements.roundTypeElement.textContent = 'Warm Up';
        this.elements.progressBar.style.width = '0%';
        this.elements.timerDisplay.classList.remove('pulse-animation');
    }

    updateRoundState(workoutState) {
        const currentRoundData = workoutState.rounds[workoutState.currentRound - 1];
        const totalDuration = currentRoundData.duration;
        const progress = ((totalDuration - workoutState.timeRemaining) / totalDuration) * 100;

        this.elements.workoutStatus.textContent = `Round ${workoutState.currentRound}`;
        this.elements.currentExercise.textContent = `${currentRoundData.name}: ${currentRoundData.combo}`;
        this.elements.currentRoundElement.textContent = workoutState.currentRound;
        this.elements.roundTypeElement.textContent = currentRoundData.name;
        this.elements.progressBar.style.width = `${progress}%`;

        // Add pulse animation when time is running low
        if (workoutState.timeRemaining <= 10) {
            this.elements.timerDisplay.classList.add('pulse-animation');
        } else {
            this.elements.timerDisplay.classList.remove('pulse-animation');
        }
    }

    updateRestState(workoutState) {
        const totalRest = workoutState.rounds[workoutState.currentRound - 1].rest;
        const progress = ((totalRest - workoutState.timeRemaining) / totalRest) * 100;

        this.elements.workoutStatus.textContent = 'Rest Period';
        this.elements.currentExercise.textContent = 'Recover and breathe';
        this.elements.progressBar.style.width = `${progress}%`;
        this.elements.timerDisplay.classList.remove('pulse-animation');
    }

    updateCompleteState(workoutState) {
        this.elements.workoutStatus.textContent = 'Workout Complete!';
        this.elements.currentExercise.textContent = 'Great job!';
        this.elements.progressBar.style.width = '100%';
        this.elements.startPauseBtn.textContent = 'Restart';
        this.elements.timerDisplay.classList.add('pulse-animation');
    }

    showScreen(screen) {
        this.elements.configScreen.classList.add('hidden');
        this.elements.historyScreen.classList.add('hidden');
        this.elements.workoutScreen.classList.add('hidden');

        this.elements[`${screen}Screen`].classList.remove('hidden');
    }

    updateWorkoutHistory(workoutHistory) {
        if (workoutHistory.length === 0) {
            this.elements.emptyHistoryMessage.classList.remove('hidden');
            this.elements.workoutHistoryList.classList.add('hidden');
            return;
        }

        this.elements.emptyHistoryMessage.classList.add('hidden');
        this.elements.workoutHistoryList.classList.remove('hidden');
        this.elements.workoutHistoryList.innerHTML = '';

        workoutHistory.forEach(workout => {
            const card = this.createWorkoutHistoryCard(workout);
            this.elements.workoutHistoryList.appendChild(card);
        });
    }

    createWorkoutHistoryCard(workout) {
        const card = document.createElement('div');
        card.className = 'workout-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow';

        const totalTime = workout.rounds.reduce((total, round) =>
            total + round.duration + (round.rest || 0), 0);

        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-medium">${workout.name}</h3>
                <span class="text-xs text-gray-500 dark:text-gray-400">${workout.date}</span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-300 mb-3">
                <div><span class="font-medium">${workout.rounds.length}</span> rounds · <span class="font-medium">${formatTime(totalTime)}</span> total</div>
                <div class="mt-1">${this.formatRoundDetails(workout)}</div>
            </div>
            <button class="load-workout-btn w-full bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-light text-sm font-medium py-1.5 px-3 rounded transition-colors" data-id="${workout.id}">
                Load Workout
            </button>
        `;

        return card;
    }

    formatRoundDetails(workout) {
        const exercises = [...new Set(workout.rounds.map(r => r.name))];
        return exercises.length > 3 
            ? `${exercises.length} different exercises`
            : exercises.join(' · ');
    }

    handleVolumeButtonClick() {
        const volumeControl = this.elements.volumeControl;
        if (parseInt(volumeControl.value) > 0) {
            volumeControl.dataset.previousValue = volumeControl.value;
            volumeControl.value = 0;
        } else {
            volumeControl.value = volumeControl.dataset.previousValue || 70;
        }

        volumeControl.dispatchEvent(new Event('input'));
        this.updateVolumeIcon();
    }

    updateVolumeIcon() {
        const volume = parseInt(this.elements.volumeControl.value);
        let iconPath = '';

        if (volume === 0) {
            iconPath = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>`;
        } else if (volume < 50) {
            iconPath = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM15.536 8.464a5 5 0 010 7.072"/>`;
        } else {
            iconPath = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728"/>`;
        }

        this.elements.volumeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">${iconPath}</svg>`;
    }
}

export default UIController;