export const audioTracks = {
    low: [
        {
            url: 'audio/dnb/low_intensity_1.mp3',
            bpm: 160,
            name: 'Low Intensity DnB 1',
            duration: 3 // duration in seconds
        },
        {
            url: 'audio/dnb/low_intensity_2.mp3',
            bpm: 165,
            name: 'Low Intensity DnB 2',
            duration: 5
        }
    ],
    medium: [
        {
            url: 'audio/dnb/medium_intensity_1.mp3',
            bpm: 170,
            name: 'Medium Intensity DnB 1',
            duration: 6
        },
        {
            url: 'audio/dnb/medium_intensity_2.mp3',
            bpm: 175,
            name: 'Medium Intensity DnB 2',
            duration: 12
        }
    ],
    high: [
        {
            url: 'audio/dnb/high_intensity_1.mp3',
            bpm: 180,
            name: 'High Intensity DnB 1',
            duration: 6
        },
        {
            url: 'audio/dnb/high_intensity_2.mp3',
            bpm: 185,
            name: 'High Intensity DnB 2',
            duration: 6
        }
    ]
};

export const audioConfig = {
    fadeInDuration: 0.5,  // seconds
    fadeOutDuration: 0.5, // seconds
    intensitySpeedChange: 0.05, // 5% speed change per intensity level
    baseBPM: 170, // reference BPM for normal playback
    volumeRange: {
        min: 0,
        max: 100,
        default: 70
    },
    ios: {
        sampleRate: 44100,
        latencyHint: 'interactive',
        bufferSize: 1024,
        channels: 2
    }
};