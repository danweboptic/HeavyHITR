export default class SilentModeDetector {
    constructor() {
        this.noticeShown = false;
        this.noticeDismissed = this.getNoticeDismissedState();
        this.lastCheckTime = 0;
        this.checkDelay = 500; // Minimum delay between checks (ms)
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

            // Create a temporary audio context for detection
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const analyser = audioContext.createAnalyser();

            oscillator.connect(analyser);
            oscillator.connect(audioContext.destination);

            // Start and immediately stop to detect if audio is actually playing
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.001);

            // Check if we're getting audio output
            setTimeout(() => {
                const array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);

                const silence = array.every(value => value === 0);

                if (silence && !this.noticeShown) {
                    this.showSilentModeNotice();
                } else if (!silence && this.noticeShown) {
                    this.hideNotice();
                }

                audioContext.close();
            }, 100);
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
}