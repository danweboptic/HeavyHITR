export default class SilentModeDetector {
    constructor() {
        this.noticeShown = false;
        this.noticeDismissed = this.getNoticeDismissedState();
        this.lastCheckTime = 0;
        this.checkDelay = 500; // Minimum delay between checks (ms)
        this.audioContext = null;
    }

    async checkSilentMode(volumeLevel = null) {
        if (this.noticeDismissed) {
            return;
        }

        // Prevent too frequent checks
        const now = Date.now();
        if (now - this.lastCheckTime < this.checkDelay) {
            return;
        }
        this.lastCheckTime = now;

        try {
            // If volume level is provided and it's above threshold, hide notice
            if (volumeLevel !== null && volumeLevel > 0) {
                this.hideNotice();
                return;
            }

            // Create or resume AudioContext
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const oscillator = this.audioContext.createOscillator();
            const analyser = this.audioContext.createAnalyser();
            const gainNode = this.audioContext.createGain();

            // Set smaller FFT size for more accurate detection
            analyser.fftSize = 128;

            // Set up gain to control volume of test tone
            gainNode.gain.value = 0.1; // Reduce volume of test tone

            // Connect nodes
            oscillator.connect(gainNode);
            gainNode.connect(analyser);
            gainNode.connect(this.audioContext.destination);

            // Use a frequency that's easier to detect
            oscillator.frequency.value = 440; // A4 note

            // Start and stop oscillator with longer duration for reliable detection
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.1);

            // Wait for the test tone and check output
            await new Promise(resolve => {
                setTimeout(() => {
                    const array = new Uint8Array(analyser.frequencyBinCount);
                    analyser.getByteFrequencyData(array);

                    // Calculate average frequency magnitude
                    const sum = array.reduce((a, b) => a + b, 0);
                    const average = sum / array.length;

                    // Consider it silent if average magnitude is very low
                    const silence = average < 1;

                    if (silence && !this.noticeShown) {
                        this.showSilentModeNotice();
                    } else if (!silence && this.noticeShown) {
                        this.hideNotice();
                    }

                    // Cleanup audio nodes
                    oscillator.disconnect();
                    gainNode.disconnect();
                    analyser.disconnect();

                    resolve();
                }, 150);
            });

        } catch (error) {
            console.error('Error checking silent mode:', error);
        }
    }

    showSilentModeNotice() {
        const notice = document.getElementById('silentModeNotice');
        if (notice) {
            notice.classList.remove('hidden');
            this.noticeShown = true;
            this.setupNoticeEventListeners();
        }
    }

    hideNotice() {
        const notice = document.getElementById('silentModeNotice');
        if (notice && this.noticeShown) {
            notice.classList.add('hidden');
            this.noticeShown = false;
        }
    }

    setupNoticeEventListeners() {
        const closeButton = document.getElementById('closeSilentNotice');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.dismissNotice();
            });
        }
    }

    dismissNotice() {
        const notice = document.getElementById('silentModeNotice');
        if (notice) {
            notice.classList.add('hidden');
            this.noticeDismissed = true;
            this.noticeShown = false;
            this.saveNoticeDismissedState();
        }
    }

    getNoticeDismissedState() {
        return localStorage.getItem('silentModeNoticeDismissed') === 'true';
    }

    saveNoticeDismissedState() {
        localStorage.setItem('silentModeNoticeDismissed', 'true');
    }

    resetNoticeDismissedState() {
        localStorage.removeItem('silentModeNoticeDismissed');
        this.noticeDismissed = false;
        this.noticeShown = false;
    }

    // Clean up resources when done
    async dispose() {
        if (this.audioContext) {
            await this.audioContext.close();
            this.audioContext = null;
        }
    }
}