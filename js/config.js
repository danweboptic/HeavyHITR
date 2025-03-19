// Configuration and Constants
const CONFIG = {
    COUNTDOWN_TIME: 5,
    MAX_HISTORY_SIZE: 10,
    BPM_BASE: 90,
    BPM_INCREMENT: 10,
    VOLUME_DEFAULT: 70
};

const INTENSITY_LEVELS = {
    VERY_LIGHT: 1,
    LIGHT: 2,
    MEDIUM: 3,
    INTENSE: 4,
    VERY_INTENSE: 5
};

// Motivational phrases for different intensity levels
const motivationalPhrases = {
    low: [
        "Good work, keep it up!",
        "You're doing great, continue at your pace.",
        "Focus on your technique, you've got this.",
        "Nice rhythm, keep breathing.",
        "You're making progress with every punch."
    ],
    medium: [
        "That's it! Keep pushing!",
        "Stay with it, you're looking strong!",
        "Good work, now kick it up a notch!",
        "Push yourself, you can do more!",
        "Focus and drive! You're halfway there!"
    ],
    high: [
        "DIG DEEP! Don't quit now!",
        "PUSH THROUGH! Be relentless!",
        "MAXIMUM EFFORT! Leave it all out there!",
        "You're STRONGER than you think! Break through!",
        "THIS is where champions are made! PUSH!"
    ]
};

// Export constants
export { CONFIG, INTENSITY_LEVELS, motivationalPhrases };