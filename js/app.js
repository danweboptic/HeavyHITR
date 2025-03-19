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
        this.visualizationManager = new VisualizationManager(
            document.getElementById('beatVisualization')
        );
        this.workoutManager = new WorkoutManager(
            this.audioManager,
            this.speechManager,
            this.uiController
        );

        this.initialize();
    }

    async initialize() {
        try {
            await this.audioManager.initialize();
            await this.speechManager.initialize();
            this.visualizationManager.initialize();
            this.applyTheme();
            this.setupEventListeners();

            // No need to explicitly call showScreen here as it's handled in UIController constructor
            this.uiController.updateWorkoutHistory(this.storageManager.getWorkoutHistory());
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.handleInitializationError(error);
        }
    }

    setupEventListeners() {
        try {
            // Workout generation and control
            document.getElementById('generateWorkoutBtn')
                .addEventListener('click', () => this.handleGenerateWorkout());

            document.getElementById('startPauseBtn')
                .addEventListener('click', () => this.handleStartPause());

            document.getElementById('resetBtn')
                .addEventListener('click', () => this.handleBackToConfig());

            document.getElementById('backToConfigBtn')
                .addEventListener('click', () => this.handleBackToConfig());

            // Tab switching
            document.getElementById('configTab')
                .addEventListener('click', () => this.handleTabSwitch('config'));

            document.getElementById('historyTab')
                .addEventListener('click', () => this.handleTabSwitch('history'));

            // Theme toggle
            document.getElementById('themeToggle')
                .addEventListener('click', () => this.handleThemeToggle());

            // Volume controls
            document.getElementById('volumeBtn')
                .addEventListener('click', () => this.uiController.handleVolumeButtonClick());

            document.getElementById('volumeControl')
                .addEventListener('input', (e) => {
                    this.audioManager.setVolume(e.target.value);
                    this.uiController.updateVolumeIcon();
                });

            // Intensity slider
            const intensitySlider = document.getElementById('intensityLevel');
            intensitySlider.addEventListener('input', (e) => {
                const value = ((e.target.value - e.target.min) / (e.target.max - e.target.min)) * 100;
                e.target.style.setProperty('--range-progress', `${value}%`);
                this.uiController.updateIntensityDisplay();
            });

            // Set initial intensity value
            const value = ((intensitySlider.value - intensitySlider.min) /
                          (intensitySlider.max - intensitySlider.min)) * 100;
            intensitySlider.style.setProperty('--range-progress', `${value}%`);
            this.uiController.updateIntensityDisplay();

        } catch (error) {
            console.error('Failed to setup event listeners:', error);
            this.handleInitializationError(error);
        }
    }

    handleGenerateWorkout() {
        try {
            const settings = {
                numRounds: parseInt(document.getElementById('numRounds').value),
                roundDuration: parseInt(document.getElementById('roundDuration').value),
                restDuration: parseInt(document.getElementById('restDuration').value),
                intensity: parseInt(document.getElementById('intensityLevel').value),
                workoutType: document.getElementById('workoutType').value,
                exerciseTemplates: exerciseTemplates
            };

            this.uiController.toggleWorkoutTab(true);

            // Set workout name
            const workoutName = document.getElementById('workoutName').value;
            settings.workoutName = workoutName ||
                `${exerciseTemplates[settings.workoutType === 'pyramid' ? 'intermediate' : settings.workoutType].name} Workout (${new Date().toLocaleDateString()})`;

            this.workoutManager.generateWorkout(settings);
            this.storageManager.saveWorkout(this.workoutManager.getWorkout());
            this.uiController.showScreen('workout');
        } catch (error) {
            console.error('Error generating workout:', error);
            this.uiController.showError('Failed to generate workout. Please try again.');
        }
    }

    handleStartPause() {
        try {
            if (this.workoutManager.isRunning()) {
                this.workoutManager.pause();
                this.uiController.updateStartPauseButton('Resume');
            } else {
                this.workoutManager.start();
                this.uiController.updateStartPauseButton('Pause');
            }
        } catch (error) {
            console.error('Error in start/pause:', error);
            this.uiController.showError('Error controlling workout. Please try again.');
        }
    }

    handleTabSwitch(tab) {
        try {
            this.uiController.showScreen(tab);
            if (tab === 'history') {
                this.uiController.updateWorkoutHistory(this.storageManager.getWorkoutHistory());
            }
        } catch (error) {
            console.error('Error switching tabs:', error);
            this.uiController.showError('Error switching views. Please try again.');
        }
    }

    handleBackToConfig() {
        try {
            // Hide the workout tab and return to config screen
            this.uiController.toggleWorkoutTab(false);
        } catch (error) {
            console.error('Error returning to config:', error);
            this.uiController.showError('Failed to return to settings. Please try again.');
        }
    }

    handleThemeToggle() {
        try {
            const isDark = document.documentElement.classList.toggle('dark');
            this.storageManager.saveThemePreference(isDark);
        } catch (error) {
            console.error('Error toggling theme:', error);
            this.uiController.showError('Error changing theme. Please try again.');
        }
    }

    applyTheme() {
        try {
            const theme = this.storageManager.getThemePreference();
            document.documentElement.classList.toggle('dark', theme === 'dark');
        } catch (error) {
            console.error('Error applying theme:', error);
            // Don't show error to user for theme application - fall back to default
        }
    }

    handleInitializationError(error) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = `Initialization error: ${error.message}`;
        document.body.prepend(errorMessage);
    }
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.app = new App();
    } catch (error) {
        console.error('Failed to create App instance:', error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = `Failed to initialize: ${error.message}`;
        document.body.prepend(errorMessage);
    }
});

export default App;