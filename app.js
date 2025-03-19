import { CONFIG } from './config.js';
import AudioManager from './audio/AudioManager.js';
import SpeechManager from './audio/SpeechManager.js';
import UIController from './ui/UIController.js';
import WorkoutManager from './workout/WorkoutManager.js';
import StorageManager from './storage/StorageManager.js';
import exerciseTemplates from './data/ExerciseTemplates.js'; // Add this import

class App {
    constructor() {
        this.storageManager = new StorageManager();
        this.audioManager = new AudioManager();
        this.speechManager = new SpeechManager();
        this.uiController = new UIController();
        this.workoutManager = new WorkoutManager(
            this.audioManager,
            this.speechManager,
            this.uiController
        );

        this.applyTheme();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Workout generation and control
        document.getElementById('generateWorkoutBtn').addEventListener('click', () => this.handleGenerateWorkout());
        document.getElementById('startPauseBtn').addEventListener('click', () => this.handleStartPause());
        document.getElementById('resetBtn').addEventListener('click', () => this.workoutManager.reset());
        document.getElementById('backToConfigBtn').addEventListener('click', () => this.handleBackToConfig());

        // Tab switching
        document.getElementById('configTab').addEventListener('click', () => this.handleTabSwitch('config'));
        document.getElementById('historyTab').addEventListener('click', () => this.handleTabSwitch('history'));

        // Theme toggling
        document.getElementById('themeToggle').addEventListener('click', () => this.handleThemeToggle());

        // Volume control
        document.getElementById('volumeBtn').addEventListener('click', () => this.uiController.handleVolumeButtonClick());
        document.getElementById('volumeControl').addEventListener('input', (e) => {
            this.audioManager.setVolume(e.target.value);
            this.uiController.updateVolumeIcon();
        });

        // Intensity level changes
        document.getElementById('intensityLevel').addEventListener('input', (e) => {
            const value = ((e.target.value - e.target.min) / (e.target.max - e.target.min)) * 100;
            e.target.style.setProperty('--range-progress', `${value}%`);
            this.uiController.updateIntensityDisplay();
        });
    }

    handleGenerateWorkout() {
        const settings = {
            numRounds: parseInt(document.getElementById('numRounds').value),
            roundDuration: parseInt(document.getElementById('roundDuration').value),
            restDuration: parseInt(document.getElementById('restDuration').value),
            intensity: parseInt(document.getElementById('intensityLevel').value),
            workoutType: document.getElementById('workoutType').value,
            workoutName: document.getElementById('workoutName').value || 'Unnamed Workout',
            exerciseTemplates: exerciseTemplates // Pass the imported templates
        };

        this.workoutManager.generateWorkout(settings);
        this.uiController.showScreen('workout');

        // Save to history
        this.storageManager.saveWorkout(this.workoutManager.getWorkout());
    }

    handleTabSwitch(tab) {
        this.uiController.showScreen(tab);
        if (tab === 'history') {
            this.uiController.updateWorkoutHistory(this.storageManager.getWorkoutHistory());
        }
    }

    handleStartPause() {
        if (this.workoutManager.isRunning()) {
            this.workoutManager.pause();
            this.uiController.updateStartPauseButton('Resume');
        } else {
            this.workoutManager.start();
            this.uiController.updateStartPauseButton('Pause');
        }
    }

    handleBackToConfig() {
        this.workoutManager.reset();
        this.uiController.showScreen('config');
    }

    handleThemeToggle() {
        const isDark = document.documentElement.classList.toggle('dark');
        this.storageManager.saveThemePreference(isDark);
    }

    applyTheme() {
        const theme = this.storageManager.getThemePreference();
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

export default App;