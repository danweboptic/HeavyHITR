export default class SilentModeDetector {
    constructor() {
        this.noticeShown = false;
        this.noticeDismissed = this.getNoticeDismissedState();
    }

    async checkSilentMode() {
        if (this.noticeDismissed) {
            return;
        }

        try {
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