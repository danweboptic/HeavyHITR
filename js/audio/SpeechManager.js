class SpeechManager {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.voice = null;
        this.speechQueue = [];
        this.currentUtterance = null;
    }

    async initialize() {
        this.voice = await this.findBestVoice();
        return !!this.voice;
    }

    async findBestVoice() {
        if (!this.synthesis) return null;

        let voices = this.synthesis.getVoices();
        
        if (voices.length === 0) {
            voices = await new Promise(resolve => {
                this.synthesis.onvoiceschanged = () => {
                    resolve(this.synthesis.getVoices());
                };
            });
        }

        return this.selectBestVoice(voices);
    }

    selectBestVoice(voices) {
        const preferredNames = ['Google', 'Premium', 'Daniel', 'Alex', 'Tom', 'Matthew', 'Mark', 'Karen', 'Samantha', 'Nathan'];
        const preferredLocale = navigator.language || 'en-US';

        // Try to find premium or Google voices first
        for (const preferredName of preferredNames) {
            const match = voices.find(v =>
                v.name.includes(preferredName) &&
                v.lang.includes(preferredLocale.split('-')[0])
            );
            if (match) return match;
        }

        // Fall back to any English voice
        return voices.find(v => v.lang.includes('en')) || voices[0];
    }

    speak(text, priority = false) {
        if (!this.synthesis || !this.voice) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.voice;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        if (priority) {
            this.synthesis.cancel();
            this.synthesis.speak(utterance);
            this.currentUtterance = utterance;
        } else {
            this.speechQueue.push(utterance);
            if (!this.synthesis.speaking && !this.synthesis.pending) {
                this.processNextSpeech();
            }
        }
    }

    processNextSpeech() {
        if (this.speechQueue.length === 0) return;

        const utterance = this.speechQueue.shift();
        this.currentUtterance = utterance;

        utterance.onend = () => {
            this.currentUtterance = null;
            this.processNextSpeech();
        };

        this.synthesis.speak(utterance);
    }

    stop() {
        if (!this.synthesis) return;
        
        this.synthesis.cancel();
        this.speechQueue = [];
        this.currentUtterance = null;
    }
}

export default SpeechManager;