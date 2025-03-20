import { audioTracks, audioConfig } from '../data/audioTracks.js';
import SilentModeDetector from './SilentModeDetector.js';
import { CONFIG } from '../config.js';

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.gainNode = null;
        this.analyser = null;
        this.currentTrack = null;
        this.currentSource = null;
        this.visualizationTimer = null;
        this.currentVolume = audioConfig.volumeRange.default;
        this.tracks = audioTracks;
        this.audioBuffers = new Map();
        this.crossfadeInProgress = false;
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        this.audioInitialized = false;
        this.silentModeDetector = new SilentModeDetector();
    }

    async initialize() {
        await this.silentModeDetector.checkSilentMode();
        try {
            // Defer creation of AudioContext on iOS until user interaction
            if (!this.isIOS) {
                await this.initAudioContext();
            }
            return true;
        } catch (error) {
            console.error("Audio initialization error:", error);
            return false;
        }
    }

    async initAudioContext() {
        if (this.audioContext) return;

        // Use newer AudioContext options for iOS
        const contextOptions = {
            latencyHint: 'interactive',
            sampleRate: 44100
        };

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)(contextOptions);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;

        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        this.setVolume(this.currentVolume);
        await this.preloadTracks();
        this.audioInitialized = true;
    }

    async preloadTracks() {
        const loadPromises = [];

        Object.values(this.tracks).forEach(intensityTracks => {
            intensityTracks.forEach(track => {
                if (!this.audioBuffers.has(track.url)) {
                    loadPromises.push(this.loadTrack(track.url));
                }
            });
        });

        try {
            await Promise.all(loadPromises);
            console.log('All audio tracks preloaded successfully');
        } catch (error) {
            console.error('Error preloading tracks:', error);
        }
    }

    async loadTrack(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();

            // Handle potential null audioContext on iOS
            if (!this.audioContext) {
                await this.initAudioContext();
            }

            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.audioBuffers.set(url, audioBuffer);
            console.log(`Loaded track: ${url}`);
        } catch (error) {
            console.error(`Error loading track ${url}:`, error);
            throw error;
        }
    }

    async ensureAudioContext() {
        if (!this.audioContext) {
            await this.initAudioContext();
        }

        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        await this.silentModeDetector.checkSilentMode();
    }

    setVolume(volume) {
        // Ensure volume is within valid range
        volume = Math.max(audioConfig.volumeRange.min,
                         Math.min(audioConfig.volumeRange.max, parseInt(volume) || 0));
        this.currentVolume = volume;

        // Convert to gain value (0 to 1)
        const gainValue = volume / 100;

        if (this.gainNode && this.audioContext) {
            const now = this.audioContext.currentTime;
            this.gainNode.gain.cancelScheduledValues(now);
            this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
            this.gainNode.gain.linearRampToValueAtTime(gainValue, now + 0.05);
        }
    }

    getIntensityTracks(intensity) {
        if (intensity <= 2) return this.tracks.low;
        if (intensity <= 4) return this.tracks.medium;
        return this.tracks.high;
    }

    async startBeat(intensity = 3) {
        try {
            // Ensure audio context is initialized and resumed
            await this.ensureAudioContext();

            if (!this.audioInitialized) {
                console.warn("Audio system not fully initialized");
                return;
            }

            // If there's a current track, crossfade to the new one
            const shouldCrossfade = this.currentSource !== null;
            if (shouldCrossfade) {
                await this.crossfadeToNewTrack(intensity);
            } else {
                await this.startNewTrack(intensity);
            }

        } catch (error) {
            console.error("Error starting beat:", error);
            if (this.isIOS) {
                throw new Error("Please ensure your device's silent mode is off and volume is up");
            }
        }
    }

    async startNewTrack(intensity) {
        const intensityTracks = this.getIntensityTracks(intensity);
        const track = intensityTracks[Math.floor(Math.random() * intensityTracks.length)];

        try {
            const source = this.audioContext.createBufferSource();
            source.buffer = this.audioBuffers.get(track.url);
            source.loop = true;

            const speedMultiplier = 1 + ((intensity - 3) * audioConfig.intensitySpeedChange);
            source.playbackRate.value = speedMultiplier;

            const now = this.audioContext.currentTime;
            this.gainNode.gain.setValueAtTime(0, now);
            this.gainNode.gain.linearRampToValueAtTime(
                this.currentVolume / 100,
                now + audioConfig.fadeInDuration
            );

            source.connect(this.gainNode);
            source.start(0);

            this.currentSource = source;
            this.currentTrack = track;

        } catch (error) {
            console.error("Error in startNewTrack:", error);
            throw error;
        }
    }

    async crossfadeToNewTrack(intensity) {
        if (this.crossfadeInProgress) return;
        this.crossfadeInProgress = true;

        try {
            const intensityTracks = this.getIntensityTracks(intensity);
            const newTrack = intensityTracks[Math.floor(Math.random() * intensityTracks.length)];

            const newGainNode = this.audioContext.createGain();
            newGainNode.connect(this.analyser);

            const newSource = this.audioContext.createBufferSource();
            newSource.buffer = this.audioBuffers.get(newTrack.url);
            newSource.loop = true;

            const speedMultiplier = 1 + ((intensity - 3) * audioConfig.intensitySpeedChange);
            newSource.playbackRate.value = speedMultiplier;

            newSource.connect(newGainNode);

            const now = this.audioContext.currentTime;
            const fadeTime = audioConfig.fadeOutDuration;

            this.gainNode.gain.linearRampToValueAtTime(0, now + fadeTime);
            newGainNode.gain.setValueAtTime(0, now);
            newGainNode.gain.linearRampToValueAtTime(this.currentVolume / 100, now + fadeTime);

            newSource.start(0);

            setTimeout(() => {
                if (this.currentSource) {
                    this.currentSource.stop();
                }
                this.currentSource = newSource;
                this.currentTrack = newTrack;
                this.gainNode = newGainNode;
                this.crossfadeInProgress = false;
            }, fadeTime * 1000);
        } catch (error) {
            console.error("Error in crossfadeToNewTrack:", error);
            this.crossfadeInProgress = false;
            throw error;
        }
    }

    stopBeat() {
        if (this.currentSource) {
            try {
                const now = this.audioContext.currentTime;

                this.gainNode.gain.cancelScheduledValues(now);
                this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
                this.gainNode.gain.linearRampToValueAtTime(0, now + audioConfig.fadeOutDuration);

                setTimeout(() => {
                    if (this.currentSource) {
                        this.currentSource.stop();
                        this.currentSource = null;
                        this.currentTrack = null;
                    }
                    this.crossfadeInProgress = false;
                }, audioConfig.fadeOutDuration * 1000);
            } catch (error) {
                console.error("Error in stopBeat:", error);
            }
        }
    }

    getAnalyser() {
        return this.analyser;
    }

    getCurrentTrackInfo() {
        if (!this.currentTrack) return null;
        return {
            name: this.currentTrack.name,
            bpm: this.currentTrack.bpm,
            url: this.currentTrack.url
        };
    }

    isPlaying() {
        return this.currentSource !== null;
    }
}

export default AudioManager;