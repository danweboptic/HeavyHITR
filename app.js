import { CONFIG } from './config.js';
import AudioManager from './audio/AudioManager.js';
import SpeechManager from './audio/SpeechManager.js';
import WorkoutManager from './workout/WorkoutManager.js';
import UIController from './ui/UIController.js';
import StorageManager from './storage/StorageManager.js';
import VisualizationManager from './visualization/VisualizationManager.js';
import exerciseTemplates from './data/ExerciseTemplates.js';

class App {
    constructor() {
        this.storageManager = new StorageManager();
        this.uiController = new UIController();
        this.audioManager = new AudioManager();
        this.speechManager = new SpeechManager();
        this.visualizationManager = new VisualizationManager(document.getElementById('beatVisualization'));
        this.workoutManager = new WorkoutManager(
            this.audioManager,
            this.speechManager,
            this.uiController
        );

        this.initialize();
    }

    async initialize() {
        try {
            // Initialize audio and speech
            await this.audioManager.initialize();
            await this.speechManager.initialize();
            this.visualizationManager.initialize();

            // Load theme preference
            this.applyTheme();

            // Set up event listeners
            this.setupEventListeners();

            // Load workout history
            this.uiController.updateWorkoutHistory(this.storageManager.getWorkoutHistory());
        } catch (error) {
            console.error('Failed to initialize app:', error);
        }
    }

    setupEventListeners() {
        try {
            // Workout generation and control
            document.getElementById('generateWorkoutBtn').addEventListener('click', () => this.handleGenerateWorkout());
            document.getElementById('startPauseBtn').addEventListener('click', () => this.handleStartPause());
            document.getElementById('resetBtn').addEventListener('click', () => this.handleBackToConfig());
            document.getElementById('backToConfigBtn').addEventListener('click', () => this.handleBackToConfig());

            // Tab switching
            document.getElementById('configTab').addEventListener('click', () => this.handleTabSwitch('config'));
            document.getElementById('historyTab').addEventListener('click', () => this.handleTabSwitch('history'));

            // Theme toggle
            document.getElementById('themeToggle').addEventListener('click', () => this.handleThemeToggle());

            // Intensity slider
            document.getElementById('intensityLevel').addEventListener('input', (e) => {
                const value = ((e.target.value - e.target.min) / (e.target.max - e.target.min)) * 100;
                e.target.style.setProperty('--range-progress', `${value}%`);
            });
        } catch (error) {
            console.error('Failed to setup event listeners:', error);
        }
    }

    handleGenerateWorkout() {
        const settings = {
            numRounds: parseInt(document.getElementById('numRounds').value),
            roundDuration: parseInt(document.getElementById('roundDuration').value),
            restDuration: parseInt(document.getElementById('restDuration').value),
            intensity: parseInt(document.getElementById('intensityLevel').value),
            workoutType: document.getElementById('workoutType').value,
            workoutName: document.getElementById('workoutName').value ||
                        `${exerciseTemplates[settings.workoutType === 'pyramid' ? 'intermediate' : settings.workoutType].name} Workout (${new Date().toLocaleDateString()})`,
            exerciseTemplates: exerciseTemplates
        };

        this.workoutManager.generateWorkout(settings);
        this.storageManager.saveWorkout(this.workoutManager.getWorkout());
        this.uiController.showScreen('workout');
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

    handleTabSwitch(tab) {
        this.uiController.showScreen(tab);
        if (tab === 'history') {
            this.uiController.updateWorkoutHistory(this.storageManager.getWorkoutHistory());
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

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

export default App;