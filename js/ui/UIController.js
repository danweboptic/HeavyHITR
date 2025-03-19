class UIController {
    constructor() {
        this.screens = {
            config: document.getElementById('configScreen'),
            workout: document.getElementById('workoutScreen'),
            history: document.getElementById('historyScreen')
        };

        // Tab configuration
        this.tabs = new Map([
            ['config', { id: 'configTab', label: 'Create Workout' }],
            ['workout', { id: 'workoutTab', label: 'Current Workout' }],
            ['history', { id: 'historyTab', label: 'Workout History' }]
        ]);

        // Tab styling classes
        this.tabClasses = {
            base: 'py-2 px-4 font-medium border-b-2',
            inactive: 'border-transparent hover:border-primary dark:hover:border-primary-light text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
            active: 'border-primary dark:border-primary-light text-gray-900 dark:text-white'
        };
    }

    showScreen(screenId) {
        // Hide all screens first
        Object.values(this.screens).forEach(screen => {
            if (screen) {
                screen.classList.add('hidden');
            }
        });

        // Show the target screen
        const targetScreen = this.screens[screenId];
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
        }

        // Update tab states
        this.updateTabStates(screenId);
    }

    updateTabStates(activeTabId) {
        this.tabs.forEach((tabConfig, tabId) => {
            const tabElement = document.getElementById(tabConfig.id);
            if (tabElement) {
                const isActive = tabId === activeTabId;
                const classes = [
                    this.tabClasses.base,
                    isActive ? this.tabClasses.active : this.tabClasses.inactive
                ];
                tabElement.className = classes.join(' ');
            }
        });
    }

    updateUI(workout) {
        if (!workout) return;

        const elements = {
            workoutStatus: document.getElementById('workoutStatus'),
            currentExercise: document.getElementById('currentExercise'),
            currentRound: document.getElementById('currentRound'),
            totalRounds: document.getElementById('totalRounds'),
            roundType: document.getElementById('roundType'),
            progressBar: document.getElementById('progressBar'),
            timerDisplay: document.getElementById('timerDisplay')
        };

        // Check if all elements exist
        if (Object.values(elements).some(el => !el)) {
            console.error('Some UI elements are missing');
            return;
        }

        // Update UI elements
        elements.currentRound.textContent = workout.currentRound;
        elements.totalRounds.textContent = workout.rounds.length;
        elements.timerDisplay.textContent = this.formatTime(workout.timeRemaining);

        if (workout.status === 'ready') {
            elements.workoutStatus.textContent = 'Get Ready!';
            elements.currentExercise.textContent = 'Starting soon...';
            elements.roundType.textContent = '-';
        } else if (workout.status === 'complete') {
            elements.workoutStatus.textContent = 'Workout Complete!';
            elements.currentExercise.textContent = 'Great job!';
            elements.roundType.textContent = '-';
        } else {
            const currentRound = workout.rounds[workout.currentRound - 1];
            if (currentRound) {
                elements.workoutStatus.textContent = workout.status === 'rest' ? 'Rest' : currentRound.name;
                elements.currentExercise.textContent = workout.status === 'rest' ? 'Recover' : currentRound.combo;
                elements.roundType.textContent = currentRound.type;
            }
        }

        // Update progress bar
        let progressPercent = 0;
        if (workout.status !== 'ready' && workout.currentRound > 0) {
            const currentRound = workout.rounds[workout.currentRound - 1];
            const totalTime = workout.status === 'rest' ? currentRound.rest : currentRound.duration;
            progressPercent = ((totalTime - workout.timeRemaining) / totalTime) * 100;
        }
        elements.progressBar.style.width = `${progressPercent}%`;
    }

    updateWorkoutHistory(history) {
        const historyList = document.getElementById('workoutHistoryList');
        const emptyMessage = document.getElementById('emptyHistoryMessage');

        if (!historyList || !emptyMessage) return;

        if (!history || history.length === 0) {
            historyList.innerHTML = '';
            emptyMessage.classList.remove('hidden');
            return;
        }

        emptyMessage.classList.add('hidden');
        historyList.innerHTML = history.map(workout => this.createWorkoutCard(workout)).join('');
    }

    createWorkoutCard(workout) {
        return `
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-medium">${workout.name}</h3>
                    <span class="text-sm text-gray-500 dark:text-gray-400">${workout.date}</span>
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-300">
                    ${workout.rounds.length} rounds • ${workout.roundDuration}s work / ${workout.restDuration}s rest
                </div>
            </div>
        `;
    }

    updateStartPauseButton(text) {
        const button = document.getElementById('startPauseBtn');
        if (button) {
            button.textContent = text;
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.prepend(errorDiv);

        // Remove the error message after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    updateIntensityDisplay() {
        const intensityLevel = document.getElementById('intensityLevel');
        const intensityDisplay = document.getElementById('intensityDisplay');

        if (!intensityLevel || !intensityDisplay) return;

        const value = intensityLevel.value;
        const labels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
        intensityDisplay.textContent = labels[value - 1];
    }
}

export default UIController;