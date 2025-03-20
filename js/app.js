import { CONFIG } from './config.js';
import AudioManager from './audio/AudioManager.js';
import SpeechManager from './audio/SpeechManager.js';
import WorkoutManager from './workout/WorkoutManager.js';
import UIController from './ui/UIController.js';
import StorageManager from './storage/StorageManager.js';
import VisualizationManager from './visualization/VisualizationManager.js';
import exerciseTemplates from './data/ExerciseTemplates.js';  // Make sure this is correct path

class App {
    constructor() {
        console.log('App constructor started');
        try {
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
            console.log('App constructor: all managers initialized');
        } catch (error) {
            console.error('Error in App constructor:', error);
            throw error;
        }
    }

    async initialize() {
        console.log('App initialize started');
        try {
            // Ensure UI is initialized first
            if (!this.uiController) {
                throw new Error('UIController not initialized');
            }

            await this.audioManager.initialize();
            await this.speechManager.initialize();
            this.visualizationManager.initialize();
            this.applyTheme();
            await this.setupEventListeners();
            this.uiController.updateWorkoutHistory(this.storageManager.getWorkoutHistory());
            console.log('App initialization completed');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.handleInitializationError(error);
        }
    }

    async setupEventListeners() {
        try {
            // Workout generation and control
            const generateBtn = document.getElementById('generateWorkoutBtn');
            if (generateBtn) {
                const boundHandler = this.handleGenerateWorkout.bind(this);
                generateBtn.addEventListener('click', async () => {
                    try {
                        console.log('Generate button clicked');
                        await boundHandler();
                    } catch (error) {
                        console.error('Error in generate button handler:', error);
                    }
                });
            }

            const startPauseBtn = document.getElementById('startPauseBtn');
            if (startPauseBtn) {
                startPauseBtn.addEventListener('click', async () => {
                    await this.audioManager.ensureAudioContext();
                    this.handleStartPause();
                });
            }

            const resetBtn = document.getElementById('resetBtn');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => this.handleBackToConfig());
            }

            const backToConfigBtn = document.getElementById('backToConfigBtn');
            if (backToConfigBtn) {
                backToConfigBtn.addEventListener('click', () => this.handleBackToConfig());
            }

            // Tab switching
            const configTab = document.getElementById('configTab');
            if (configTab) {
                configTab.addEventListener('click', () => this.handleTabSwitch('config'));
            }

            const historyTab = document.getElementById('historyTab');
            if (historyTab) {
                historyTab.addEventListener('click', () => this.handleTabSwitch('history'));
            }

            // Theme toggle
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', () => this.handleThemeToggle());
            }

            // Volume controls
            const volumeBtn = document.getElementById('volumeBtn');
            const volumeControl = document.getElementById('volumeControl');

            if (volumeBtn) {
                volumeBtn.addEventListener('click', async () => {
                    const volume = this.uiController.handleVolumeButtonClick();
                    await this.audioManager.ensureAudioContext();
                    this.audioManager.setVolume(volume);
                    this.speechManager.setVolume(volume);
                });
            }

            if (volumeControl) {
                volumeControl.addEventListener('input', async (e) => {
                    const volume = parseInt(e.target.value);
                    await this.audioManager.ensureAudioContext();
                    this.audioManager.setVolume(volume);
                    this.speechManager.setVolume(volume);
                    this.uiController.updateVolumeIcon(volume);
                });

                // Set initial volume
                const initialVolume = parseInt(volumeControl.value);
                this.audioManager.setVolume(initialVolume);
                this.speechManager.setVolume(initialVolume);
                this.uiController.updateVolumeIcon(initialVolume);
            }

            // Intensity slider
            const intensitySlider = document.getElementById('intensityLevel');
            if (intensitySlider) {
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
            }

        } catch (error) {
            console.error('Failed to setup event listeners:', error);
            throw error; // Propagate error to initialize method
        }
    }

    async handleGenerateWorkout() {
        console.log('handleGenerateWorkout called');

        try {
            // Get and validate form elements
            const numRoundsInput = document.getElementById('numRounds');
            const roundDurationInput = document.getElementById('roundDuration');
            const restDurationInput = document.getElementById('restDuration');
            const intensityLevelInput = document.getElementById('intensityLevel');
            const workoutTypeInput = document.getElementById('workoutType');
            const workoutNameInput = document.getElementById('workoutName');

            // Log form values for debugging
            console.log('Form values:', {
                numRounds: numRoundsInput?.value,
                roundDuration: roundDurationInput?.value,
                restDuration: restDurationInput?.value,
                intensity: intensityLevelInput?.value,
                workoutType: workoutTypeInput?.value,
                workoutName: workoutNameInput?.value
            });

            // Validate all required elements exist
            if (!numRoundsInput || !roundDurationInput || !restDurationInput ||
                !intensityLevelInput || !workoutTypeInput) {
                throw new Error('Required form elements are missing');
            }

            // Validate and parse inputs
            const settings = {
                numRounds: parseInt(numRoundsInput.value),
                roundDuration: parseInt(roundDurationInput.value),
                restDuration: parseInt(restDurationInput.value),
                intensity: parseInt(intensityLevelInput.value),
                workoutType: workoutTypeInput.value,
                exerciseTemplates: exerciseTemplates
            };

            // Validate numeric values
            if (isNaN(settings.numRounds) || isNaN(settings.roundDuration) ||
                isNaN(settings.restDuration) || isNaN(settings.intensity)) {
                throw new Error('Invalid numeric values in form');
            }

            // Set workout name
            settings.workoutName = workoutNameInput?.value ||
                `${exerciseTemplates[settings.workoutType].name} Workout (${new Date().toLocaleDateString()})`;

            console.log('Final settings:', settings);

            // Initialize audio if needed
            await this.audioManager.ensureAudioContext();

            // Generate workout
            const workout = this.workoutManager.generateWorkout(settings);
            if (!workout) {
                throw new Error('Failed to generate workout');
            }

            // Update UI first
            this.uiController.updateUI(workout);

            // Then show the workout tab
            this.uiController.showWorkoutTab();

            // Save the workout last
            this.storageManager.saveWorkout(workout);

            console.log('Workout generation completed successfully');
            return workout;

        } catch (error) {
            console.error('Error generating workout:', error);
            console.error('Error stack:', error.stack);
            this.uiController.showError(`Failed to generate workout: ${error.message}`);
            throw error;
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

    handleTabSwitch(tabId) {
        try {
            this.uiController.switchTab(tabId);
            if (tabId === 'history') {
                this.uiController.updateWorkoutHistory(this.storageManager.getWorkoutHistory());
            }
        } catch (error) {
            console.error('Error switching tabs:', error);
            this.uiController.showError('Error switching views. Please try again.');
        }
    }

    handleBackToConfig() {
        try {
            // Stop the workout and reset it first
            this.workoutManager.reset();

            // Hide workout tab and ensure we switch to config view
            this.uiController.hideWorkoutTab();

            // Reset any workout-specific UI elements
            const startPauseBtn = document.getElementById('startPauseBtn');
            if (startPauseBtn) {
                startPauseBtn.textContent = 'Start';
            }

            // Clear any existing workout data
            this.currentWorkout = null;

        } catch (error) {
            console.error('Error returning to config:', error);
            this.uiController.showError('Error returning to settings. Please try again.');
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
        errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded shadow-lg z-50';
        errorMessage.textContent = `Initialization error: ${error.message}`;
        document.body.appendChild(errorMessage);

        // Remove the error message after 5 seconds
        setTimeout(() => {
            errorMessage.remove();
        }, 5000);
    }
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded - starting app initialization');
    try {
        window.app = new App();
        await window.app.initialize();
        console.log('App fully initialized');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded shadow-lg z-50';
        errorMessage.textContent = `Failed to initialize: ${error.message}`;
        document.body.appendChild(errorMessage);
    }
});

export default App;