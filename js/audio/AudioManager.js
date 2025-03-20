import { CONFIG } from '../config.js';

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.gainNode = null;
        this.analyser = null;
        this.beatSource = null;
        this.visualizationTimer = null;
        this.currentVolume = 70; // Default volume
    }

    async initialize() {
        if (this.audioContext) return true; // Already initialized

        try {
            console.log('Initializing audio manager');
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;

            // Create gain node
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            // Set initial volume
            this.setVolume(this.currentVolume);

            console.log('Audio manager initialized successfully');
            return true;
        } catch (error) {
            console.error("Audio initialization error:", error);
            return false;
        }
    }

    async ensureAudioContext() {
        if (!this.audioContext) {
            await this.initialize();
        } else if (this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch (error) {
                console.error('Error resuming audio context:', error);
            }
        }
    }

    setVolume(volume) {
        if (!this.gainNode) return;

        try {
            // Ensure volume is a number between 0 and 100
            volume = Math.max(0, Math.min(100, parseInt(volume) || 0));
            this.currentVolume = volume;

            // Convert to gain value (0 to 1)
            const gainValue = volume / 100;

            // Set the gain value with a small ramp to avoid clicks
            const now = this.audioContext?.currentTime || 0;
            this.gainNode.gain.cancelScheduledValues(now);
            this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
            this.gainNode.gain.linearRampToValueAtTime(gainValue, now + 0.01);
        } catch (error) {
            console.error('Error setting volume:', error);
        }
    }

    async startBeat(intensity) {
        try {
            await this.ensureAudioContext();
            this.stopBeat();
            this.createDrumPatterns(intensity);
        } catch (error) {
            console.error("Error starting beat:", error);
        }
    }

    stopBeat() {
        if (this.beatSource) {
            this.beatSource.stop();
            this.beatSource = null;
        }
    }

    createDrumPatterns(intensity) {
        const now = this.audioContext.currentTime;
        const bpm = CONFIG.BPM_BASE + (intensity * CONFIG.BPM_INCREMENT);
        const beatDuration = 60 / bpm;
        
        // Schedule patterns for 60 seconds
        const totalBeats = Math.ceil(60 / beatDuration);
        
        for (let i = 0; i < totalBeats; i++) {
            // Kick drum (four-on-the-floor)
            this.scheduleKickDrum(now + (i * beatDuration));
            
            // Snare on beats 2 and 4
            if (i % 2 === 1) {
                this.scheduleSnare(now + (i * beatDuration));
            }
            
            // Hi-hat pattern
            const hiHatDivision = intensity <= 2 ? 2 : (intensity <= 4 ? 4 : 8);
            for (let j = 0; j < hiHatDivision; j++) {
                this.scheduleHiHat(now + (i * beatDuration) + (j * beatDuration / hiHatDivision));
            }
            
            // Bass notes on beats 1 and 3
            if (i % 2 === 0) {
                this.scheduleBassNote(now + (i * beatDuration), 50 + intensity * 5);
            }
        }
    }

    // Individual instrument scheduling methods
    scheduleKickDrum(time) {
        const kickOsc = this.audioContext.createOscillator();
        const kickGain = this.audioContext.createGain();
        
        kickOsc.frequency.value = 150;
        kickGain.gain.setValueAtTime(0.8, time);
        kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        kickOsc.frequency.setValueAtTime(150, time);
        kickOsc.frequency.exponentialRampToValueAtTime(50, time + 0.15);
        
        kickOsc.connect(kickGain);
        kickGain.connect(this.gainNode);
        
        kickOsc.start(time);
        kickOsc.stop(time + 0.15);
    }

    scheduleSnare(time) {
        const bufferSize = this.audioContext.sampleRate * 0.1;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const snareFilter = this.audioContext.createBiquadFilter();
        snareFilter.type = 'bandpass';
        snareFilter.frequency.value = 2000;
        snareFilter.Q.value = 1;
        
        const snareGain = this.audioContext.createGain();
        snareGain.gain.setValueAtTime(0.6, time);
        snareGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
        
        noise.connect(snareFilter);
        snareFilter.connect(snareGain);
        snareGain.connect(this.gainNode);
        
        noise.start(time);
        noise.stop(time + 0.2);
    }

    scheduleHiHat(time) {
        const hihatOsc = this.audioContext.createOscillator();
        hihatOsc.type = 'square';
        hihatOsc.frequency.value = 6000;
        
        const hihatFilter = this.audioContext.createBiquadFilter();
        hihatFilter.type = 'highpass';
        hihatFilter.frequency.value = 7000;
        
        const hihatGain = this.audioContext.createGain();
        hihatGain.gain.setValueAtTime(0.2, time);
        hihatGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
        
        hihatOsc.connect(hihatFilter);
        hihatFilter.connect(hihatGain);
        hihatGain.connect(this.gainNode);
        
        hihatOsc.start(time);
        hihatOsc.stop(time + 0.05);
    }

    scheduleBassNote(time, frequency) {
        const bassOsc = this.audioContext.createOscillator();
        bassOsc.type = 'sine';
        bassOsc.frequency.value = frequency;
        
        const bassGain = this.audioContext.createGain();
        bassGain.gain.setValueAtTime(0.5, time);
        bassGain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
        
        bassOsc.connect(bassGain);
        bassGain.connect(this.gainNode);
        
        bassOsc.start(time);
        bassOsc.stop(time + 0.4);
    }

    getAnalyser() {
        return this.analyser;
    }
}

export default AudioManager;