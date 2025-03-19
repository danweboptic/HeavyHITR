import { CONFIG } from '../config.js';

class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'heavyhitr_workouts';
        this.workoutHistory = this.loadWorkoutHistory();
    }

    loadWorkoutHistory() {
        try {
            const savedHistory = localStorage.getItem(this.STORAGE_KEY);
            return savedHistory ? JSON.parse(savedHistory) : [];
        } catch (error) {
            console.error('Error loading workout history:', error);
            return [];
        }
    }

    saveWorkout(workout) {
        try {
            const workoutData = {
                id: Date.now(),
                name: workout.name,
                date: new Date().toLocaleDateString(),
                rounds: workout.rounds.map(round => ({...round})), // Create deep copy
                roundDuration: workout.rounds[0].duration,
                restDuration: workout.rounds[0].rest
            };

            this.workoutHistory.unshift(workoutData);

            // Limit history to configured size
            if (this.workoutHistory.length > CONFIG.MAX_HISTORY_SIZE) {
                this.workoutHistory = this.workoutHistory.slice(0, CONFIG.MAX_HISTORY_SIZE);
            }

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.workoutHistory));
            return true;
        } catch (error) {
            console.error('Error saving workout:', error);
            return false;
        }
    }

    getWorkoutById(id) {
        return this.workoutHistory.find(w => w.id === id);
    }

    getWorkoutHistory() {
        return this.workoutHistory;
    }

    clearHistory() {
        try {
            this.workoutHistory = [];
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing workout history:', error);
            return false;
        }
    }

    saveThemePreference(isDark) {
        try {
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            return true;
        } catch (error) {
            console.error('Error saving theme preference:', error);
            return false;
        }
    }

    getThemePreference() {
        try {
            const theme = localStorage.getItem('theme');
            if (theme === null) {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            return theme;
        } catch (error) {
            console.error('Error getting theme preference:', error);
            return 'light';
        }
    }
}

export default StorageManager;