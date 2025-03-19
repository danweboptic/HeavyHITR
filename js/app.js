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
        this.validateRequiredElements();

        this.storageManager = new StorageManager();
        this.uiController = new UIController();
        this.audioManager = new AudioManager();
        this.speechManager = new SpeechManager();
        this.visualizationManager = new VisualizationManager(
            DOMUtils.getElement('beatVisualization')
        );
        this.workoutManager = new WorkoutManager(
            this.audioManager,
            this.speechManager,
            this.uiController
        );

        this.initialize();
    }

    validateRequiredElements() {
        const requiredElements = [
            'beatVisualization',
            'generateWorkoutBtn',
            'startPauseBtn',
            'resetBtn',
            'backToConfigBtn',
            'configTab',
            'historyTab',
            'themeToggle',
            'intensityLevel',
            'numRounds',
            'roundDuration',
            'restDuration',
            'workoutType',
            'workoutName'
        ];

        DOMUtils.validateRequiredElements(requiredElements);
    }

    async initialize() {
        try {
            await this.audioManager.initialize();
            await this.speechManager.initialize();
            this.visualizationManager.initialize();
            this.applyTheme();
            this.setupEventListeners();
            this.uiController.updateWorkoutHistory(this.storageManager.getWorkoutHistory());
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.handleInitializationError(error);
        }
    }

    handleInitializationError(error) {
        // You can customize this based on your needs
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = `Failed to initialize app: ${error.message}`;
        document.body.prepend(errorMessage);
    }

    setupEventListeners() {
        try {
            // Workout generation and control
            DOMUtils.getElement('generateWorkoutBtn')
                .addEventListener('click', () => this.handleGenerateWorkout());

            DOMUtils.getElement('startPauseBtn')
                .addEventListener('click', () => this.handleStartPause());

            DOMUtils.getElement('resetBtn')
                .addEventListener('click', () => this.handleBackToConfig());

            DOMUtils.getElement('backToConfigBtn')
                .addEventListener('click', () => this.handleBackToConfig());

            // Tab switching
            DOMUtils.getElement('configTab')
                .addEventListener('click', () => this.handleTabSwitch('config'));

            DOMUtils.getElement('historyTab')
                .addEventListener('click', () => this.handleTabSwitch('history'));

            // Theme toggle
            DOMUtils.getElement('themeToggle')
                .addEventListener('click', () => this.handleThemeToggle());

            // Intensity slider
            const intensitySlider = DOMUtils.getElement('intensityLevel');
            intensitySlider.addEventListener('input', (e) => {
                const value = ((e.target.value - e.target.min) / (e.target.max - e.target.min)) * 100;
                e.target.style.setProperty('--range-progress', `${value}%`);
            });

            // Set initial intensity value
            const value = ((intensitySlider.value - intensitySlider.min) /
                          (intensitySlider.max - intensitySlider.min)) * 100;
            intensitySlider.style.setProperty('--range-progress', `${value}%`);

        } catch (error) {
            console.error('Failed to setup event listeners:', error);
            this.handleInitializationError(error);
        }
    }

    handleGenerateWorkout() {
        try {
            const settings = {
                numRounds: parseInt(DOMUtils.getElement('numRounds').value),
                roundDuration: parseInt(DOMUtils.getElement('roundDuration').value),
                restDuration: parseInt(DOMUtils.getElement('restDuration').value),
                intensity: parseInt(DOMUtils.getElement('intensityLevel').value),
                workoutType: DOMUtils.getElement('workoutType').value,
                exerciseTemplates: exerciseTemplates
            };

            // Set workout name
            const workoutName = DOMUtils.getElement('workoutName').value;
            settings.workoutName = workoutName ||
                `${exerciseTemplates[settings.workoutType === 'pyramid' ? 'intermediate' : settings.workoutType].name} Workout (${new Date().toLocaleDateString()})`;

            this.workoutManager.generateWorkout(settings);
            this.storageManager.saveWorkout(this.workoutManager.getWorkout());
            this.uiController.showScreen('workout');
        } catch (error) {
            console.error('Failed to generate workout:', error);
            // You might want to show this error to the user in a more friendly way
            this.uiController.showError('Failed to generate workout. Please try again.');
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
    try {
        window.app = new App();
    } catch (error) {
        console.error('Failed to create App instance:', error);
        // Show a user-friendly error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Failed to initialize the application. Please refresh the page or contact support.';
        document.body.prepend(errorMessage);
    }
});

export default App;