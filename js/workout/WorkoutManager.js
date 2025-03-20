import { CONFIG } from '../config.js';
import motivationalPhrases from '../data/MotivationalPhrases.js';
import { formatTime } from '../utils/TimeFormatter.js';

class WorkoutManager {
    constructor(audioManager, speechManager, uiController) {
        this.audioManager = audioManager;
        this.speechManager = speechManager;
        this.uiController = uiController;
        this.workout = {
            name: '',
            rounds: [],
            currentRound: 0,
            isRunning: false,
            status: 'ready',
            timeRemaining: CONFIG.COUNTDOWN_TIME,
            timer: null,
            isPaused: false
        };
    }

    generateWorkout(settings) {
        const { numRounds, roundDuration, restDuration, intensity, workoutType, workoutName, exerciseTemplates } = settings;

        this.workout.name = workoutName;
        this.workout.rounds = [];

        if (workoutType === 'pyramid') {
            this.generatePyramidWorkout(numRounds, roundDuration, restDuration, intensity, exerciseTemplates);
        } else {
            this.generateRegularWorkout(numRounds, roundDuration, restDuration, intensity, workoutType, exerciseTemplates);
        }

        this.initializeWorkout();
        return this.workout;  // Return the workout object
    }

    generateRegularWorkout(numRounds, roundDuration, restDuration, intensity, workoutType, exerciseTemplates) {
        for (let i = 0; i < numRounds; i++) {
            const exercises = exerciseTemplates[workoutType].exercises;
            const exercise = exercises[i % exercises.length];
            
            this.workout.rounds.push({
                type: workoutType,
                duration: roundDuration,
                rest: restDuration,
                name: exercise.name,
                combo: exercise.combo,
                cues: [...exercise.cues],
                intensity: intensity
            });
        }
    }

    generatePyramidWorkout(numRounds, roundDuration, restDuration, maxIntensity, exerciseTemplates) {
        const midpoint = Math.ceil(numRounds / 2);

        for (let i = 0; i < numRounds; i++) {
            // Calculate round intensity (build up to max, then reduce)
            let roundIntensity;
            if (i < midpoint) {
                roundIntensity = Math.max(1, Math.min(5, Math.floor((i + 1) * (maxIntensity / midpoint))));
            } else {
                roundIntensity = Math.max(1, Math.min(5, Math.floor((numRounds - i) * (maxIntensity / (numRounds - midpoint + 1)))));
            }

            // Select type based on intensity
            let roundType;
            if (roundIntensity <= 2) roundType = 'beginner';
            else if (roundIntensity <= 4) roundType = 'intermediate';
            else roundType = 'advanced';

            // Select exercise
            const exercises = exerciseTemplates[roundType].exercises;
            const exercise = exercises[i % exercises.length];

            this.workout.rounds.push({
                type: roundType,
                duration: roundDuration,
                rest: restDuration,
                name: exercise.name,
                combo: exercise.combo,
                cues: [...exercise.cues],
                intensity: roundIntensity
            });
        }
    }

    initializeWorkout() {
        this.workout.currentRound = 0;
        this.workout.isRunning = false;
        this.workout.status = 'ready';
        this.workout.timeRemaining = CONFIG.COUNTDOWN_TIME;
        this.uiController.updateUI(this.workout);
    }

    async start() {
        if (this.workout.isPaused) {
            return this.resume();
        }

        try {
            await this.audioManager.ensureAudioContext();

            this.workout.isRunning = true;
            this.workout.isPaused = false;

            if (this.workout.status === 'ready') {
                await this.audioManager.startBeat();
                await this.speechManager.speak("Get ready! Starting in 5 seconds.", true);
            }

            // Use requestAnimationFrame for better timer accuracy
            let lastTime = performance.now();
            const timerCallback = (currentTime) => {
                if (!this.workout.isRunning) return;

                const deltaTime = currentTime - lastTime;
                if (deltaTime >= 1000) { // Update every second
                    this.update();
                    lastTime = currentTime;
                }

                if (this.workout.isRunning) {
                    this.workout.timer = requestAnimationFrame(timerCallback);
                }
            };

            this.workout.timer = requestAnimationFrame(timerCallback);
        } catch (error) {
            console.error('Error starting workout:', error);
            throw new Error('Failed to start workout. Please check your audio settings.');
        }
    }

    async pause() {
        try {
            this.workout.isRunning = false;
            this.workout.isPaused = true;

            if (this.workout.timer) {
                cancelAnimationFrame(this.workout.timer);
                this.workout.timer = null;
            }

            await this.audioManager.stopBeat();
            await this.speechManager.stop();

            // Save current state for resume
            this.workout.pauseState = {
                timeRemaining: this.workout.timeRemaining,
                status: this.workout.status,
                currentRound: this.workout.currentRound
            };

            this.uiController.updateUI(this.workout);
        } catch (error) {
            console.error('Error pausing workout:', error);
            throw new Error('Failed to pause workout');
        }
    }

    async resume() {
        try {
            if (!this.workout.pauseState) {
                throw new Error('No pause state found');
            }

            await this.audioManager.ensureAudioContext();

            // Restore state from pause
            this.workout.timeRemaining = this.workout.pauseState.timeRemaining;
            this.workout.status = this.workout.pauseState.status;
            this.workout.currentRound = this.workout.pauseState.currentRound;

            this.workout.isRunning = true;
            this.workout.isPaused = false;

            // Resume audio if in a round
            if (this.workout.status === 'round') {
                const roundData = this.workout.rounds[this.workout.currentRound - 1];
                await this.audioManager.startBeat(roundData.intensity);
            }

            await this.start(); // This will restart the timer
        } catch (error) {
            console.error('Error resuming workout:', error);
            throw new Error('Failed to resume workout');
        }
    }

    async reset() {
        try {
            if (this.workout.timer) {
                cancelAnimationFrame(this.workout.timer);
                this.workout.timer = null;
            }

            await this.audioManager.stopBeat();
            await this.speechManager.stop();

            this.workout.currentRound = 0;
            this.workout.isRunning = false;
            this.workout.isPaused = false;
            this.workout.status = 'ready';
            this.workout.timeRemaining = CONFIG.COUNTDOWN_TIME;
            this.workout.pauseState = null;

            this.uiController.updateUI(this.workout);
        } catch (error) {
            console.error('Error resetting workout:', error);
            throw new Error('Failed to reset workout');
        }
    }

    update() {
        // Decrease remaining time
        this.workout.timeRemaining--;

        // Handle voice cues based on current status and time
        this.handleVoiceCues();

        // Check if current period is complete
        if (this.workout.timeRemaining <= 0) {
            if (this.workout.status === 'ready') {
                // Ready countdown complete, start first round
                this.workout.status = 'round';
                this.workout.currentRound = 1;
                this.workout.timeRemaining = this.workout.rounds[0].duration;

                const roundData = this.workout.rounds[0];
                this.speechManager.speak(`Round ${this.workout.currentRound}! ${roundData.name}! ${roundData.combo}! Begin!`, true);
                this.audioManager.startBeat(roundData.intensity);

            } else if (this.workout.status === 'round') {
                // Round complete, enter rest period or finish workout
                if (this.workout.currentRound < this.workout.rounds.length) {
                    this.workout.status = 'rest';
                    this.workout.timeRemaining = this.workout.rounds[this.workout.currentRound - 1].rest;

                    this.speechManager.speak(`Round ${this.workout.currentRound} complete! Rest for ${this.workout.timeRemaining} seconds. Take deep breaths.`, true);
                    this.audioManager.stopBeat();

                } else {
                    // Workout complete
                    this.workout.status = 'complete';
                    this.workout.timeRemaining = 0;
                    this.workout.isRunning = false;
                    clearInterval(this.workout.timer);

                    this.speechManager.speak(`Workout complete! Great job! You've finished all ${this.workout.rounds.length} rounds. Take a moment to cool down and stretch.`, true);
                    this.audioManager.stopBeat();
                }

            } else if (this.workout.status === 'rest') {
                // Rest complete, start next round
                this.workout.status = 'round';
                this.workout.currentRound++;
                this.workout.timeRemaining = this.workout.rounds[this.workout.currentRound - 1].duration;

                const roundData = this.workout.rounds[this.workout.currentRound - 1];
                this.speechManager.speak(`Round ${this.workout.currentRound}! ${roundData.name}! ${roundData.combo}! Begin!`, true);
                this.audioManager.startBeat(roundData.intensity);
            }
        }

        // Update UI
        this.uiController.updateUI(this.workout);
    }

    handleVoiceCues() {
        if (!this.workout.isRunning) return;

        if (this.workout.status === 'ready') {
            // Countdown cues
            if (this.workout.timeRemaining <= 3 && this.workout.timeRemaining > 0) {
                this.speechManager.speak(`${this.workout.timeRemaining}...`);
            }
        } else if (this.workout.status === 'round') {
            const roundData = this.workout.rounds[this.workout.currentRound - 1];
            const totalDuration = roundData.duration;

            // Early round cues
            if (this.workout.timeRemaining === totalDuration - 5) {
                this.speechManager.speak(roundData.cues[0]);
            }

            // Middle round cues
            if (this.workout.timeRemaining === Math.floor(totalDuration / 2)) {
                this.speechManager.speak("Halfway through the round!");

                // Add a motivational phrase
                const intensityLevel = roundData.intensity <= 2 ? 'low' : (roundData.intensity <= 4 ? 'medium' : 'high');
                const motivation = motivationalPhrases[intensityLevel][Math.floor(Math.random() * motivationalPhrases[intensityLevel].length)];
                this.speechManager.speak(motivation);

                // Add workout-specific cue
                this.speechManager.speak(roundData.cues[1]);
            }

            // Third quarter cue
            if (this.workout.timeRemaining === Math.floor(totalDuration / 4)) {
                this.speechManager.speak(roundData.cues[2]);
            }

            // Final round cues
            if (this.workout.timeRemaining === 10) {
                this.speechManager.speak("10 seconds left! Finish strong!");
                this.speechManager.speak(roundData.cues[3]);
            }

            // Countdown last 5 seconds
            if (this.workout.timeRemaining <= 5 && this.workout.timeRemaining > 0) {
                this.speechManager.speak(`${this.workout.timeRemaining}...`);
            }
        } else if (this.workout.status === 'rest') {
            // Rest period cues
            const totalRest = this.workout.rounds[this.workout.currentRound - 1].rest;

            // Initial rest cue
            if (this.workout.timeRemaining === totalRest - 3) {
                this.speechManager.speak("Take deep breaths. Recover.");
            }

            // Middle rest cue
            if (this.workout.timeRemaining === Math.floor(totalRest / 2)) {
                // Preview next round
                if (this.workout.currentRound < this.workout.rounds.length) {
                    const nextRound = this.workout.rounds[this.workout.currentRound];
                    this.speechManager.speak(`Coming up next: ${nextRound.name}. ${nextRound.combo}.`);
                }
            }

            // End of rest countdown
            if (this.workout.timeRemaining <= 5 && this.workout.timeRemaining > 0) {
                this.speechManager.speak(`${this.workout.timeRemaining}...`);
            }
        }
    }

    loadWorkout(savedWorkout) {
        this.workout.name = savedWorkout.name;
        this.workout.rounds = savedWorkout.rounds.map(round => ({...round}));
        this.initializeWorkout();
    }

    isRunning() {
        return this.workout.isRunning;
    }

    getWorkout() {
        return {...this.workout};
    }
}

export default WorkoutManager;