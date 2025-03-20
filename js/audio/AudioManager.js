import { audioTracks, audioConfig } from '../data/audioTracks.js';
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
    }

    async initialize() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;

            // Create gain node for volume control
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            // Set initial volume
            this.setVolume(this.currentVolume);

            // Preload audio files
            await this.preloadTracks();

            return true;
        } catch (error) {
            console.error("Audio initialization error:", error);
            return false;
        }
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
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.audioBuffers.set(url, audioBuffer);
            console.log(`Loaded track: ${url}`);
        } catch (error) {
            console.error(`Error loading track ${url}:`, error);
            throw error; // Propagate error for proper handling
        }
    }

    async ensureAudioContext() {
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    setVolume(volume) {
        // Ensure volume is within valid range
        volume = Math.max(audioConfig.volumeRange.min,
                         Math.min(audioConfig.volumeRange.max, parseInt(volume) || 0));
        this.currentVolume = volume;

        // Convert to gain value (0 to 1)
        const gainValue = volume / 100;
        const now = this.audioContext.currentTime;

        // Apply volume change with small ramp to avoid clicks
        this.gainNode.gain.cancelScheduledValues(now);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
        this.gainNode.gain.linearRampToValueAtTime(gainValue, now + 0.05);
    }

    getIntensityTracks(intensity) {
        if (intensity <= 2) return this.tracks.low;
        if (intensity <= 4) return this.tracks.medium;
        return this.tracks.high;
    }

    async startBeat(intensity = 3) {
        if (!this.audioContext) return;

        try {
            await this.ensureAudioContext();

            // If there's a current track, crossfade to the new one
            const shouldCrossfade = this.currentSource !== null;
            if (shouldCrossfade) {
                await this.crossfadeToNewTrack(intensity);
            } else {
                await this.startNewTrack(intensity);
            }

        } catch (error) {
            console.error("Error starting beat:", error);
        }
    }

    async startNewTrack(intensity) {
        const intensityTracks = this.getIntensityTracks(intensity);
        const track = intensityTracks[Math.floor(Math.random() * intensityTracks.length)];

        // Create and configure source
        const source = this.audioContext.createBufferSource();
        source.buffer = this.audioBuffers.get(track.url);
        source.loop = true;

        // Apply playback rate based on intensity
        const speedMultiplier = 1 + ((intensity - 3) * audioConfig.intensitySpeedChange);
        source.playbackRate.value = speedMultiplier;

        // Fade in
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
    }

    async crossfadeToNewTrack(intensity) {
        if (this.crossfadeInProgress) return;
        this.crossfadeInProgress = true;

        const intensityTracks = this.getIntensityTracks(intensity);
        const newTrack = intensityTracks[Math.floor(Math.random() * intensityTracks.length)];

        // Create new gain node for the new track
        const newGainNode = this.audioContext.createGain();
        newGainNode.connect(this.analyser);

        // Create and configure new source
        const newSource = this.audioContext.createBufferSource();
        newSource.buffer = this.audioBuffers.get(newTrack.url);
        newSource.loop = true;

        // Apply playback rate based on intensity
        const speedMultiplier = 1 + ((intensity - 3) * audioConfig.intensitySpeedChange);
        newSource.playbackRate.value = speedMultiplier;

        // Connect new source to its gain node
        newSource.connect(newGainNode);

        // Set up crossfade
        const now = this.audioContext.currentTime;
        const fadeTime = audioConfig.fadeOutDuration;

        // Fade out current track
        this.gainNode.gain.linearRampToValueAtTime(0, now + fadeTime);

        // Fade in new track
        newGainNode.gain.setValueAtTime(0, now);
        newGainNode.gain.linearRampToValueAtTime(this.currentVolume / 100, now + fadeTime);

        // Start new track
        newSource.start(0);

        // Clean up after crossfade
        setTimeout(() => {
            if (this.currentSource) {
                this.currentSource.stop();
            }
            this.currentSource = newSource;
            this.currentTrack = newTrack;
            this.gainNode = newGainNode;
            this.crossfadeInProgress = false;
        }, fadeTime * 1000);
    }

    stopBeat() {
        if (this.currentSource) {
            const now = this.audioContext.currentTime;

            // Fade out
            this.gainNode.gain.cancelScheduledValues(now);
            this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
            this.gainNode.gain.linearRampToValueAtTime(0, now + audioConfig.fadeOutDuration);

            // Stop the source after fade out
            setTimeout(() => {
                if (this.currentSource) {
                    this.currentSource.stop();
                    this.currentSource = null;
                    this.currentTrack = null;
                }
                this.crossfadeInProgress = false;
            }, audioConfig.fadeOutDuration * 1000);
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