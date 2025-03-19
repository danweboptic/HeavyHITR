        // Check for dark mode preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        }
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            if (event.matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        });

        // DOM Elements
        const configTab = document.getElementById('configTab');
        const historyTab = document.getElementById('historyTab');
        const configScreen = document.getElementById('configScreen');
        const historyScreen = document.getElementById('historyScreen');
        const workoutScreen = document.getElementById('workoutScreen');
        const intensityLevel = document.getElementById('intensityLevel');
        const intensityDisplay = document.getElementById('intensityDisplay');
        const generateWorkoutBtn = document.getElementById('generateWorkoutBtn');
        const startPauseBtn = document.getElementById('startPauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        const backToConfigBtn = document.getElementById('backToConfigBtn');
        const workoutStatus = document.getElementById('workoutStatus');
        const currentExercise = document.getElementById('currentExercise');
        const timerDisplay = document.getElementById('timerDisplay');
        const currentRoundElement = document.getElementById('currentRound');
        const totalRoundsElement = document.getElementById('totalRounds');
        const roundTypeElement = document.getElementById('roundType');
        const progressBar = document.getElementById('progressBar');
        const volumeBtn = document.getElementById('volumeBtn');
        const volumeControl = document.getElementById('volumeControl');
        const beatCanvas = document.getElementById('beatVisualization');
        const workoutHistoryList = document.getElementById('workoutHistoryList');
        const emptyHistoryMessage = document.getElementById('emptyHistoryMessage');

        // Tab switching
        configTab.addEventListener('click', () => {
            configTab.classList.add('border-b-2', 'border-primary', 'dark:border-primary-light', 'text-primary', 'dark:text-primary-light');
            historyTab.classList.remove('border-b-2', 'border-primary', 'dark:border-primary-light', 'text-primary', 'dark:text-primary-light');
            configScreen.classList.remove('hidden');
            historyScreen.classList.add('hidden');
        });

        historyTab.addEventListener('click', () => {
            historyTab.classList.add('border-b-2', 'border-primary', 'dark:border-primary-light', 'text-primary', 'dark:text-primary-light');
            configTab.classList.remove('border-b-2', 'border-primary', 'dark:border-primary-light', 'text-primary', 'dark:text-primary-light');
            historyScreen.classList.remove('hidden');
            configScreen.classList.add('hidden');
            renderWorkoutHistory();
        });

        // Exercise templates
        const exerciseTemplates = {
            // Technical focus workouts
            technical: {
                name: "Technical Focus",
                exercises: [
                    {
                        name: "Basic Technique",
                        combo: "Jab, cross, with proper form",
                        cues: [
                            "Focus on your stance",
                            "Rotate your hips with each punch",
                            "Keep your guard up",
                            "Extend fully, then return quickly"
                        ]
                    },
                    {
                        name: "Defense & Counter",
                        combo: "Slip left, slip right, counter cross",
                        cues: [
                            "Bend at the knees slightly",
                            "Keep your eyes on target",
                            "Sharp counter after defense",
                            "Don't lean too far"
                        ]
                    },
                    {
                        name: "Footwork Drill",
                        combo: "Pivot left, jab, pivot right, cross",
                        cues: [
                            "Light on your feet",
                            "Small controlled steps",
                            "Maintain your balance",
                            "Punch with proper weight transfer"
                        ]
                    },
                    {
                        name: "Precision Combinations",
                        combo: "Jab, cross, hook, with focus on accuracy",
                        cues: [
                            "Focus on the target",
                            "Quality over speed",
                            "Reset after each combination",
                            "Visualize landing each punch"
                        ]
                    }
                ]
            },
            // Power focus workouts
            power: {
                name: "Power Focus",
                exercises: [
                    {
                        name: "Power Straight Punches",
                        combo: "Powerful jab, powerful cross",
                        cues: [
                            "Drive from your legs",
                            "Rotate your hips fully",
                            "Exhale sharply on impact",
                            "Follow through with each punch"
                        ]
                    },
                    {
                        name: "Heavy Hooks",
                        combo: "Cross, left hook, right hook",
                        cues: [
                            "Turn your foot as you hook",
                            "Keep your elbow at 90 degrees",
                            "Put your weight behind it",
                            "Engage your core for power"
                        ]
                    },
                    {
                        name: "Power Body Attacks",
                        combo: "Body jab, body cross, head hook",
                        cues: [
                            "Bend your knees to reach the body",
                            "Tighten your fist on impact",
                            "Drive upward on the hook",
                            "Full hip rotation for power"
                        ]
                    },
                    {
                        name: "Explosive Combinations",
                        combo: "Explosive double jab, cross, hook",
                        cues: [
                            "Maximum effort on each punch",
                            "Explode from your starting position",
                            "Generate power from the ground up",
                            "Full extension on each punch"
                        ]
                    }
                ]
            },
            // Speed focus workouts
            speed: {
                name: "Speed Focus",
                exercises: [
                    {
                        name: "Fast Hands",
                        combo: "Rapid-fire jab, cross, jab",
                        cues: [
                            "Snap your punches back quickly",
                            "Stay relaxed between punches",
                            "Quick hands, light feet",
                            "Focus on hand speed"
                        ]
                    },
                    {
                        name: "Quick Combinations",
                        combo: "Fast double jab, cross, hook",
                        cues: [
                            "Keep combinations tight",
                            "No telegraphing your punches",
                            "Flow from one punch to next",
                            "Maximum hand speed"
                        ]
                    },
                    {
                        name: "Speed Drill",
                        combo: "Jab, cross, roll, jab, cross",
                        cues: [
                            "Quick transitions",
                            "Snap each punch",
                            "Speed is key",
                            "Stay light on your feet"
                        ]
                    },
                    {
                        name: "Blitz Attack",
                        combo: "Lightning fast triple jab, cross",
                        cues: [
                            "Overwhelming speed",
                            "Focus on quick returns",
                            "Rapid hand movement",
                            "Don't telegraph"
                        ]
                    }
                ]
            },
            // Beginner mixed workouts
            beginner: {
                name: "Beginner Mix",
                exercises: [
                    {
                        name: "Basic Foundations",
                        combo: "Simple jab, cross drill",
                        cues: [
                            "Focus on your stance",
                            "Keep your guard up",
                            "Breathe with each punch",
                            "Maintain your balance"
                        ]
                    },
                    {
                        name: "Basic Movement",
                        combo: "Jab, step left, jab, step right",
                        cues: [
                            "Small controlled steps",
                            "Keep your guard up while moving",
                            "Balanced stance at all times",
                            "Throw straight punches"
                        ]
                    },
                    {
                        name: "Simple Defense",
                        combo: "Block high, block low, jab",
                        cues: [
                            "Keep your eyes on target",
                            "Tight guard position",
                            "Return to guard after punching",
                            "Stay balanced"
                        ]
                    },
                    {
                        name: "Basic Combinations",
                        combo: "Jab, cross, basic hook",
                        cues: [
                            "Connect the punches smoothly",
                            "Focus on technique first",
                            "Proper weight transfer",
                            "Keep it controlled"
                        ]
                    }
                ]
            },
            // Intermediate mixed workouts
            intermediate: {
                name: "Intermediate Mix",
                exercises: [
                    {
                        name: "Combo Series",
                        combo: "Double jab, cross, hook, cross",
                        cues: [
                            "Connect the punches smoothly",
                            "Maintain good form",
                            "Good rhythm and timing",
                            "Power through the combination"
                        ]
                    },
                    {
                        name: "Defense & Counter",
                        combo: "Slip, cross counter, hook, cross",
                        cues: [
                            "Sharp defensive movement",
                            "Counter immediately",
                            "Don't drop your guard",
                            "Follow through on counters"
                        ]
                    },
                    {
                        name: "Mixed Attack",
                        combo: "Body jab, head cross, hook, uppercut",
                        cues: [
                            "Change levels smoothly",
                            "Bend knees for body shots",
                            "Full extension on punches",
                            "Finish with power"
                        ]
                    },
                    {
                        name: "Speed & Control",
                        combo: "Fast jabs, powerful cross, hook",
                        cues: [
                            "Speed on the jabs",
                            "Power on the cross and hook",
                            "Control the tempo",
                            "Stay balanced throughout"
                        ]
                    }
                ]
            },
            // Advanced mixed workouts
            advanced: {
                name: "Advanced Mix",
                exercises: [
                    {
                        name: "Complex Combinations",
                        combo: "Jab, cross, hook, uppercut, cross",
                        cues: [
                            "Fast transitions between punches",
                            "Full power on each strike",
                            "Maintain technique at speed",
                            "Chain everything together"
                        ]
                    },
                    {
                        name: "Advanced Defense & Counter",
                        combo: "Slip left, hook, slip right, uppercut, cross",
                        cues: [
                            "Seamless defense to offense",
                            "Fast head movement",
                            "Counters with maximum impact",
                            "Stay in the pocket"
                        ]
                    },
                    {
                        name: "Explosive Sequence",
                        combo: "Double jab, cross, hook, cross, uppercut",
                        cues: [
                            "Explosive power throughout",
                            "Push your speed and power",
                            "Full commitment to each punch",
                            "Control your breathing"
                        ]
                    },
                    {
                        name: "Elite Combination",
                        combo: "Head jab, body cross, head hook, body hook, uppercut",
                        cues: [
                            "Change levels with precision",
                            "Maximum hand speed",
                            "Full body engagement",
                            "Control with aggression"
                        ]
                    }
                ]
            }
        };

        // Motivational phrases
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

        // Workout history storage
        let workoutHistory = [];

        // State variables
        let workout = {
            name: "",
            rounds: [],
            currentRound: 0,
            isRunning: false,
            timer: null,
            timeRemaining: 0,
            totalTime: 0,
            status: 'ready', // ready, round, rest, complete
            voice: null,
            audioContext: null,
            speechSynthesis: window.speechSynthesis,
            speechQueue: [],
            currentUtterance: null,
            beatSource: null,
            gainNode: null,
            analyser: null,
            visualizationTimer: null
        };

        // Set intensity level display
        intensityLevel.addEventListener('input', updateIntensityDisplay);

        function updateIntensityDisplay() {
            const val = intensityLevel.value;
            let intensityText = '';

            switch(parseInt(val)) {
                case 1: intensityText = 'Very Light'; break;
                case 2: intensityText = 'Light'; break;
                case 3: intensityText = 'Medium'; break;
                case 4: intensityText = 'Intense'; break;
                case 5: intensityText = 'Very Intense'; break;
            }

            intensityDisplay.textContent = intensityText;
        }

        // Initialize with default values
        updateIntensityDisplay();

        // Format time as MM:SS
        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        // Find the best available voice for speech synthesis
        function findBestVoice() {
            if (!window.speechSynthesis) return null;

            // Get all available voices
            let voices = speechSynthesis.getVoices();

            // If voices aren't loaded yet, wait for them
            if (voices.length === 0) {
                return new Promise(resolve => {
                    speechSynthesis.onvoiceschanged = () => {
                        voices = speechSynthesis.getVoices();
                        resolve(selectBestVoice(voices));
                    };
                });
            } else {
                return Promise.resolve(selectBestVoice(voices));
            }
        }

        // Select the best voice from available options
        function selectBestVoice(voices) {
            // Preferred voice characteristics
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
            const englishVoice = voices.find(v => v.lang.includes('en'));
            if (englishVoice) return englishVoice;

            // Last resort: first available voice
            return voices[0];
        }

        // Generate workout
        generateWorkoutBtn.addEventListener('click', async () => {
            const numRounds = parseInt(document.getElementById('numRounds').value);
            const roundDuration = parseInt(document.getElementById('roundDuration').value);
            const restDuration = parseInt(document.getElementById('restDuration').value);
            const intensity = parseInt(document.getElementById('intensityLevel').value);
            const workoutType = document.getElementById('workoutType').value;
            const workoutName = document.getElementById('workoutName').value ||
                                `${exerciseTemplates[workoutType === 'pyramid' ? 'intermediate' : workoutType].name} Workout (${new Date().toLocaleDateString()})`;

            // Find best voice for speech synthesis
            workout.voice = await findBestVoice();
            workout.name = workoutName;
            workout.rounds = [];

            // Generate the rounds based on workout type
            if (workoutType === 'pyramid') {
                // Pyramid workout: intensity builds up and then comes back down
                generatePyramidWorkout(numRounds, roundDuration, restDuration, intensity);
            } else {
                // Regular workout with selected type
                for (let i = 0; i < numRounds; i++) {
                    const exercises = exerciseTemplates[workoutType].exercises;
                    const exercise = exercises[i % exercises.length];

                    workout.rounds.push({
                        type: workoutType,
                        duration: roundDuration,
                        rest: restDuration,
                        name: exercise.name,
                        combo: exercise.combo,
                        cues: [...exercise.cues],
                        intensity: intensity
                    });
                }
            }

            // Set initial values
            workout.currentRound = 0;
            workout.isRunning = false;
            workout.status = 'ready';
            workout.timeRemaining = 5; // 5 second countdown

            // Update UI
            currentRoundElement.textContent = '0';
            totalRoundsElement.textContent = numRounds;
            roundTypeElement.textContent = 'Warm Up';
            timerDisplay.textContent = formatTime(5);
            progressBar.style.width = '0%';
            workoutStatus.textContent = 'Get Ready!';
            currentExercise.textContent = 'Workout will begin in 5 seconds';
            startPauseBtn.textContent = 'Start';

            // Initialize audio context
            prepareAudioContext();

            // Switch screens
            configScreen.classList.add('hidden');
            workoutScreen.classList.remove('hidden');

            // Save workout to history
            saveWorkoutToHistory();
        });

        // Generate a pyramid style workout
        function generatePyramidWorkout(numRounds, roundDuration, restDuration, maxIntensity) {
            // Calculate intensity progression
            const midpoint = Math.ceil(numRounds / 2);
            const types = ['beginner', 'intermediate', 'advanced'];
            const typeIndex = Math.min(Math.floor(maxIntensity / 2), 2);

            for (let i = 0; i < numRounds; i++) {
                // Calculate round intensity (build up to max, then reduce)
                let roundIntensity;
                if (i < midpoint) {
                    // Building up
                    roundIntensity = Math.max(1, Math.min(5, Math.floor((i + 1) * (maxIntensity / midpoint))));
                } else {
                    // Coming down
                    roundIntensity = Math.max(1, Math.min(5, Math.floor((numRounds - i) * (maxIntensity / (numRounds - midpoint + 1)))));
                }

                // Select type based on intensity
                let roundType;
                if (roundIntensity <= 2) roundType = 'beginner';
                else if (roundIntensity <= 4) roundType = 'intermediate';
                else roundType = 'advanced';

                // Select exercise
                const exercises = exerciseTemplates[roundType].exercises;
                const exercise = exercises[i % exercises.length];

                workout.rounds.push({
                    type: roundType,
                    duration: roundDuration,
                    rest: restDuration,
                    name: exercise.name,
                    combo: exercise.combo,
                    cues: [...exercise.cues],
                    intensity: roundIntensity
                });
            }
        }

        // Save workout to history
        function saveWorkoutToHistory() {
            const workoutData = {
                id: Date.now(),
                name: workout.name,
                date: new Date().toLocaleDateString(),
                rounds: workout.rounds.map(round => ({...round})), // Create deep copy
                roundDuration: workout.rounds[0].duration,
                restDuration: workout.rounds[0].rest
            };

            workoutHistory.unshift(workoutData); // Add to beginning of array

            // Limit history to last 10 workouts
            if (workoutHistory.length > 10) {
                workoutHistory = workoutHistory.slice(0, 10);
            }
        }

        // Render the workout history list
        function renderWorkoutHistory() {
            if (workoutHistory.length === 0) {
                emptyHistoryMessage.classList.remove('hidden');
                workoutHistoryList.classList.add('hidden');
                return;
            }

            emptyHistoryMessage.classList.add('hidden');
            workoutHistoryList.classList.remove('hidden');

            // Clear current list
            workoutHistoryList.innerHTML = '';

            // Add each workout to the list
            workoutHistory.forEach(savedWorkout => {
                const card = document.createElement('div');
                card.className = 'workout-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow';

                // Calculate total workout time
                const totalTime = savedWorkout.rounds.reduce((total, round) =>
                    total + round.duration + (round.rest || 0), 0);

                card.innerHTML = `
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-medium">${savedWorkout.name}</h3>
                        <span class="text-xs text-gray-500 dark:text-gray-400">${savedWorkout.date}</span>
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        <div><span class="font-medium">${savedWorkout.rounds.length}</span> rounds · <span class="font-medium">${formatTime(totalTime)}</span> total</div>
                        <div class="mt-1">${formatRoundDetails(savedWorkout)}</div>
                    </div>
                    <button class="load-workout-btn w-full bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-light text-sm font-medium py-1.5 px-3 rounded transition-colors" data-id="${savedWorkout.id}">
                        Load Workout
                    </button>
                `;

                workoutHistoryList.appendChild(card);
            });

            // Add event listeners to load buttons
            document.querySelectorAll('.load-workout-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const workoutId = parseInt(btn.getAttribute('data-id'));
                    loadWorkoutFromHistory(workoutId);
                });
            });
        }

        // Format round details for display
        function formatRoundDetails(savedWorkout) {
            // Get unique exercise names
            const exercises = [...new Set(savedWorkout.rounds.map(r => r.name))];

            // If there are more than 3 unique exercises, show count instead
            if (exercises.length > 3) {
                return `${exercises.length} different exercises`;
            } else {
                return exercises.join(' · ');
            }
        }

        // Load a workout from history
        function loadWorkoutFromHistory(workoutId) {
            const savedWorkout = workoutHistory.find(w => w.id === workoutId);
            if (!savedWorkout) return;

            // Set up the workout data
            workout.name = savedWorkout.name;
            workout.rounds = savedWorkout.rounds.map(round => ({...round})); // Create deep copy

            // Set initial values
            workout.currentRound = 0;
            workout.isRunning = false;
            workout.status = 'ready';
            workout.timeRemaining = 5; // 5 second countdown

            // Initialize voice
            findBestVoice().then(voice => {
                workout.voice = voice;

                // Update UI
                currentRoundElement.textContent = '0';
                totalRoundsElement.textContent = savedWorkout.rounds.length;
                roundTypeElement.textContent = 'Warm Up';
                timerDisplay.textContent = formatTime(5);
                progressBar.style.width = '0%';
                workoutStatus.textContent = 'Get Ready!';
                currentExercise.textContent = 'Workout will begin in 5 seconds';
                startPauseBtn.textContent = 'Start';

                // Initialize audio context
                prepareAudioContext();

                // Switch screens
                historyScreen.classList.add('hidden');
                configTab.classList.add('border-b-2', 'border-primary', 'dark:border-primary-light', 'text-primary', 'dark:text-primary-light');
                historyTab.classList.remove('border-b-2', 'border-primary', 'dark:border-primary-light', 'text-primary', 'dark:text-primary-light');
                workoutScreen.classList.remove('hidden');
            });
        }

        // Prepare audio context for beat generation and speech
        function prepareAudioContext() {
            try {
                // Create audio context if not already created
                if (!workout.audioContext) {
                    workout.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }

                // Create analyzer for visualization
                workout.analyser = workout.audioContext.createAnalyser();
                workout.analyser.fftSize = 256;

                // Set up the canvas context for visualization
                initializeVisualization();

                // Set up volume control
                volumeControl.addEventListener('input', () => {
                    if (workout.gainNode) {
                        const volume = volumeControl.value / 100;
                        workout.gainNode.gain.value = volume;
                    }
                });
            } catch (error) {
                console.error("Audio context error:", error);
            }
        }

        // Initialize the visualization canvas
        function initializeVisualization() {
            const canvasCtx = beatCanvas.getContext('2d');
            const width = beatCanvas.width;
            const height = beatCanvas.height;

            // Clear any existing visualization timer
            if (workout.visualizationTimer) {
                cancelAnimationFrame(workout.visualizationTimer);
            }

            // Initial clear
            canvasCtx.clearRect(0, 0, width, height);
        }

        // Update the beat visualization
        // Modify the beat visualization with neon colors dynamically using JavaScript
        function updateVisualization() {
            if (!workout.analyser || !workout.isRunning) return;

            const canvasCtx = beatCanvas.getContext('2d');
            const width = beatCanvas.width;
            const height = beatCanvas.height;

            // Create buffer for frequency data
            const bufferLength = workout.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            // Get current frequency data
            workout.analyser.getByteFrequencyData(dataArray);

            // Clear canvas
            canvasCtx.clearRect(0, 0, width, height);

            // Draw visualization
            const barWidth = (width / bufferLength) * 2.5;
            let x = 0;

            // Neon gradient colors
            const gradient = canvasCtx.createLinearGradient(0, 0, width, 0);
            gradient.addColorStop(0, '#5D5CDE'); // Neon purple
            gradient.addColorStop(0.5, '#8A2BE2'); // Neon blue
            gradient.addColorStop(1, '#F72585'); // Neon pink

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = dataArray[i] / 255 * height;

                // Draw bar
                canvasCtx.fillStyle = gradient;
                canvasCtx.fillRect(x, height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }

            // Schedule next frame
            workout.visualizationTimer = requestAnimationFrame(updateVisualization);
        }

        // Start background beat and drum patterns
        function startBackgroundBeat() {
            if (!workout.audioContext) return;

            try {
                // Stop any existing beat
                if (workout.beatSource) {
                    workout.beatSource.stop();
                }

                // Create gain node
                const gainNode = workout.audioContext.createGain();
                workout.gainNode = gainNode;

                // Set initial volume
                const volume = volumeControl.value / 100;
                gainNode.gain.value = volume;

                // Connect gain node to analyzer and output
                gainNode.connect(workout.analyser);
                workout.analyser.connect(workout.audioContext.destination);

                // Get the intensity for the current round
                let intensity = 3; // Default medium
                if (workout.status === 'round') {
                    intensity = workout.rounds[workout.currentRound - 1].intensity;
                }

                // Create drum patterns based on intensity
                createDrumPatterns(intensity);

                // Start visualization
                updateVisualization();
            } catch (error) {
                console.error("Error starting beat:", error);
            }
        }

        // Create drum and bass patterns
        function createDrumPatterns(intensity) {
            const audioCtx = workout.audioContext;
            const now = audioCtx.currentTime;

            // Tempo based on intensity (beats per minute)
            const bpm = 90 + (intensity * 10); // 100-140 BPM range
            const beatDuration = 60 / bpm;

            // Schedule patterns for 60 seconds (long enough for a round)
            const patternDuration = 60;
            const totalBeats = Math.ceil(patternDuration / beatDuration);

            // Create kick drum
            for (let i = 0; i < totalBeats; i++) {
                // Four-on-the-floor pattern (every beat for kick drum)
                if (i % 1 === 0) {
                    scheduleKickDrum(now + (i * beatDuration));
                }

                // Snare on beats 2 and 4
                if (i % 2 === 1) {
                    scheduleSnare(now + (i * beatDuration));
                }

                // Hi-hat pattern (pattern density based on intensity)
                const hiHatDivision = intensity <= 2 ? 2 : (intensity <= 4 ? 4 : 8);
                for (let j = 0; j < hiHatDivision; j++) {
                    scheduleHiHat(now + (i * beatDuration) + (j * beatDuration / hiHatDivision));
                }

                // Bass notes on beats 1 and 3
                if (i % 2 === 0) {
                    scheduleBassNote(now + (i * beatDuration), 50 + intensity * 5); // Higher bass note with higher intensity
                }
            }
        }

        // Schedule a kick drum hit
        function scheduleKickDrum(time) {
            const audioCtx = workout.audioContext;

            // Create oscillator for kick
            const kickOsc = audioCtx.createOscillator();
            kickOsc.frequency.value = 150;

            // Create gain node for kick envelope
            const kickGain = audioCtx.createGain();
            kickGain.gain.setValueAtTime(0.8, time);
            kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

            // Set frequency envelope (pitch drop)
            kickOsc.frequency.setValueAtTime(150, time);
            kickOsc.frequency.exponentialRampToValueAtTime(50, time + 0.15);

            // Connect nodes
            kickOsc.connect(kickGain);
            kickGain.connect(workout.gainNode);

            // Schedule start and stop
            kickOsc.start(time);
            kickOsc.stop(time + 0.15);
        }

        // Schedule a snare hit
        function scheduleSnare(time) {
            const audioCtx = workout.audioContext;

            // Create noise for snare
            const bufferSize = audioCtx.sampleRate * 0.1; // 100ms buffer
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);

            // Fill buffer with noise
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            // Create noise source
            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;

            // Create bandpass filter for snare character
            const snareFilter = audioCtx.createBiquadFilter();
            snareFilter.type = 'bandpass';
            snareFilter.frequency.value = 2000;
            snareFilter.Q.value = 1;

            // Create gain node for snare envelope
            const snareGain = audioCtx.createGain();
            snareGain.gain.setValueAtTime(0.6, time);
            snareGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

            // Connect nodes
            noise.connect(snareFilter);
            snareFilter.connect(snareGain);
            snareGain.connect(workout.gainNode);

            // Schedule start and stop
            noise.start(time);
            noise.stop(time + 0.2);
        }

        // Schedule a hi-hat hit
        function scheduleHiHat(time) {
            const audioCtx = workout.audioContext;

            // Create high frequency oscillator for hi-hat
            const hihatOsc = audioCtx.createOscillator();
            hihatOsc.type = 'square';
            hihatOsc.frequency.value = 6000;

            // Create highpass filter for hi-hat character
            const hihatFilter = audioCtx.createBiquadFilter();
            hihatFilter.type = 'highpass';
            hihatFilter.frequency.value = 7000;

            // Create gain node for hi-hat envelope
            const hihatGain = audioCtx.createGain();
            hihatGain.gain.setValueAtTime(0.2, time);
            hihatGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

            // Connect nodes
            hihatOsc.connect(hihatFilter);
            hihatFilter.connect(hihatGain);
            hihatGain.connect(workout.gainNode);

            // Schedule start and stop
            hihatOsc.start(time);
            hihatOsc.stop(time + 0.05);
        }

        // Schedule a bass note
        function scheduleBassNote(time, frequency) {
            const audioCtx = workout.audioContext;

            // Create sine oscillator for bass
            const bassOsc = audioCtx.createOscillator();
            bassOsc.type = 'sine';
            bassOsc.frequency.value = frequency;

            // Create gain node for bass envelope
            const bassGain = audioCtx.createGain();
            bassGain.gain.setValueAtTime(0.5, time);
            bassGain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

            // Connect nodes
            bassOsc.connect(bassGain);
            bassGain.connect(workout.gainNode);

            // Schedule start and stop
            bassOsc.start(time);
            bassOsc.stop(time + 0.4);
        }

        // Speak using Web Speech API
        function speak(text, priority = false) {
            if (!workout.speechSynthesis || !workout.voice) return;

            // Create new utterance
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = workout.voice;
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // Add to queue or speak immediately
            if (priority) {
                // Cancel current speech
                workout.speechSynthesis.cancel();

                // Speak with priority
                workout.speechSynthesis.speak(utterance);
                workout.currentUtterance = utterance;
            } else {
                // Add to queue
                workout.speechQueue.push(utterance);

                // If not currently speaking, start
                if (!workout.speechSynthesis.speaking && !workout.speechSynthesis.pending) {
                    processNextSpeech();
                }
            }
        }

        // Process the next speech in queue
        function processNextSpeech() {
            if (workout.speechQueue.length === 0) return;

            const utterance = workout.speechQueue.shift();
            workout.currentUtterance = utterance;

            utterance.onend = () => {
                workout.currentUtterance = null;
                // Process next item in queue
                processNextSpeech();
            };

            workout.speechSynthesis.speak(utterance);
        }

        // Stop all speech
        function stopSpeech() {
            if (!workout.speechSynthesis) return;

            workout.speechSynthesis.cancel();
            workout.speechQueue = [];
            workout.currentUtterance = null;
        }

        // Stop background beat
        function stopBackgroundBeat() {
            if (workout.beatSource) {
                workout.beatSource.stop();
                workout.beatSource = null;
            }

            if (workout.visualizationTimer) {
                cancelAnimationFrame(workout.visualizationTimer);
                workout.visualizationTimer = null;
            }

            // Clear visualization
            const canvasCtx = beatCanvas.getContext('2d');
            canvasCtx.clearRect(0, 0, beatCanvas.width, beatCanvas.height);
        }

        // Start/Pause workout
        startPauseBtn.addEventListener('click', () => {
            if (workout.isRunning) {
                // Pause workout
                pauseWorkout();
                startPauseBtn.textContent = 'Resume';
            } else {
                // Start/resume workout
                startWorkout();
                startPauseBtn.textContent = 'Pause';
            }
        });

        // Start or resume workout
        function startWorkout() {
            workout.isRunning = true;

            // If we haven't started yet, initialize the timer
            if (workout.status === 'ready') {
                startBackgroundBeat();
                speak("Get ready! Starting in 5 seconds.", true);
            }

            // Start the timer
            workout.timer = setInterval(updateWorkout, 1000);
        }

        // Pause workout
        function pauseWorkout() {
            workout.isRunning = false;
            clearInterval(workout.timer);
            stopSpeech();
        }

        // Reset workout
        resetBtn.addEventListener('click', () => {
            // Clear timer
            clearInterval(workout.timer);

            // Stop audio
            stopBackgroundBeat();
            stopSpeech();

            // Reset workout state
            workout.currentRound = 0;
            workout.isRunning = false;
            workout.status = 'ready';
            workout.timeRemaining = 5; // 5 second countdown

            // Update UI
            updateWorkoutUI();
            startPauseBtn.textContent = 'Start';
        });

        // Back to configuration
        backToConfigBtn.addEventListener('click', () => {
            // Clear timer
            clearInterval(workout.timer);

            // Stop audio
            stopBackgroundBeat();
            stopSpeech();

            // Show config screen
            workoutScreen.classList.add('hidden');
            configScreen.classList.remove('hidden');
        });

        // Update workout timer and state
        function updateWorkout() {
            // Decrease remaining time
            workout.timeRemaining--;

            // Handle voice cues based on current status and time
            handleVoiceCues();

            // Check if current period is complete
            if (workout.timeRemaining <= 0) {
                // Handle different status transitions
                if (workout.status === 'ready') {
                    // Ready countdown complete, start first round
                    workout.status = 'round';
                    workout.currentRound = 1;
                    workout.timeRemaining = workout.rounds[0].duration;

                    // Announce start of round
                    const roundData = workout.rounds[0];
                    speak(`Round ${workout.currentRound}! ${roundData.name}! ${roundData.combo}! Begin!`, true);

                    // Start a new beat pattern for this round
                    startBackgroundBeat();

                } else if (workout.status === 'round') {
                    // Round complete, enter rest period or finish workout
                    if (workout.currentRound < workout.rounds.length) {
                        workout.status = 'rest';
                        workout.timeRemaining = workout.rounds[workout.currentRound - 1].rest;

                        // Announce rest period
                        speak(`Round ${workout.currentRound} complete! Rest for ${workout.timeRemaining} seconds. Take deep breaths.`, true);

                    } else {
                        // Workout complete
                        workout.status = 'complete';
                        workout.timeRemaining = 0;
                        workout.isRunning = false;
                        clearInterval(workout.timer);

                        // Announce completion
                        speak(`Workout complete! Great job! You've finished all ${workout.rounds.length} rounds. Take a moment to cool down and stretch.`, true);

                        // Stop beat
                        stopBackgroundBeat();
                    }

                } else if (workout.status === 'rest') {
                    // Rest complete, start next round
                    workout.status = 'round';
                    workout.currentRound++;
                    workout.timeRemaining = workout.rounds[workout.currentRound - 1].duration;

                    // Announce start of next round
                    const roundData = workout.rounds[workout.currentRound - 1];
                    speak(`Round ${workout.currentRound}! ${roundData.name}! ${roundData.combo}! Begin!`, true);

                    // Start a new beat pattern for this round
                    startBackgroundBeat();
                }
            }

            // Update UI
            updateWorkoutUI();

            // If workout is complete, cleanup
            if (workout.status === 'complete') {
                timerDisplay.classList.add('pulse-animation');
            }
        }

        // Handle voice cues based on current workout state
        function handleVoiceCues() {
            if (!workout.isRunning) return;

            if (workout.status === 'ready') {
                // Countdown cues
                if (workout.timeRemaining <= 3 && workout.timeRemaining > 0) {
                    speak(`${workout.timeRemaining}...`);
                }
            } else if (workout.status === 'round') {
                const roundData = workout.rounds[workout.currentRound - 1];
                const totalDuration = roundData.duration;

                // Early round cues
                if (workout.timeRemaining === totalDuration - 5) {
                    speak(roundData.cues[0]);
                }

                // Middle round cues
                if (workout.timeRemaining === Math.floor(totalDuration / 2)) {
                    speak("Halfway through the round!");

                    // Add a motivational phrase
                    const intensityLevel = roundData.intensity <= 2 ? 'low' : (roundData.intensity <= 4 ? 'medium' : 'high');
                    const motivation = motivationalPhrases[intensityLevel][Math.floor(Math.random() * motivationalPhrases[intensityLevel].length)];
                    speak(motivation);

                    // Add workout-specific cue
                    speak(roundData.cues[1]);
                }

                // Third quarter cue
                if (workout.timeRemaining === Math.floor(totalDuration / 4)) {
                    speak(roundData.cues[2]);
                }

                // Final round cues
                if (workout.timeRemaining === 10) {
                    speak("10 seconds left! Finish strong!");
                    speak(roundData.cues[3]);
                }

                // Countdown last 5 seconds
                if (workout.timeRemaining <= 5 && workout.timeRemaining > 0) {
                    speak(`${workout.timeRemaining}...`);
                }
            } else if (workout.status === 'rest') {
                // Rest period cues
                const totalRest = workout.rounds[workout.currentRound - 1].rest;

                // Initial rest cue
                if (workout.timeRemaining === totalRest - 3) {
                    speak("Take deep breaths. Recover.");
                }

                // Middle rest cue
                if (workout.timeRemaining === Math.floor(totalRest / 2)) {
                    // Preview next round
                    if (workout.currentRound < workout.rounds.length) {
                        const nextRound = workout.rounds[workout.currentRound];
                        speak(`Coming up next: ${nextRound.name}. ${nextRound.combo}.`);
                    }
                }

                // End of rest countdown
                if (workout.timeRemaining <= 5 && workout.timeRemaining > 0) {
                    speak(`${workout.timeRemaining}...`);
                }
            }
        }

        // Update workout UI based on current state
        function updateWorkoutUI() {
            // Update timer display
            timerDisplay.textContent = formatTime(workout.timeRemaining);

            // Update other UI elements based on status
            if (workout.status === 'ready') {
                workoutStatus.textContent = 'Get Ready!';
                currentExercise.textContent = `Workout will begin in ${workout.timeRemaining} seconds`;
                currentRoundElement.textContent = '0';
                roundTypeElement.textContent = 'Warm Up';
                progressBar.style.width = '0%';

            } else if (workout.status === 'round') {
                const currentRoundData = workout.rounds[workout.currentRound - 1];
                const totalDuration = currentRoundData.duration;
                const progress = ((totalDuration - workout.timeRemaining) / totalDuration) * 100;

                workoutStatus.textContent = `Round ${workout.currentRound}`;
                currentExercise.textContent = `${currentRoundData.name}: ${currentRoundData.combo}`;
                currentRoundElement.textContent = workout.currentRound;
                roundTypeElement.textContent = currentRoundData.name;
                progressBar.style.width = `${progress}%`;

                // Add pulse animation when time is running low
                if (workout.timeRemaining <= 10) {
                    timerDisplay.classList.add('pulse-animation');
                } else {
                    timerDisplay.classList.remove('pulse-animation');
                }

            } else if (workout.status === 'rest') {
                const totalRest = workout.rounds[workout.currentRound - 1].rest;
                const progress = ((totalRest - workout.timeRemaining) / totalRest) * 100;

                workoutStatus.textContent = 'Rest Period';
                currentExercise.textContent = 'Recover and breathe';
                progressBar.style.width = `${progress}%`;
                timerDisplay.classList.remove('pulse-animation');

            } else if (workout.status === 'complete') {
                workoutStatus.textContent = 'Workout Complete!';
                currentExercise.textContent = 'Great job!';
                progressBar.style.width = '100%';
                startPauseBtn.textContent = 'Restart';
            }
        }

        // Volume button click handler
        volumeBtn.addEventListener('click', () => {
            if (parseInt(volumeControl.value) > 0) {
                volumeControl.dataset.previousValue = volumeControl.value;
                volumeControl.value = 0;
            } else {
                volumeControl.value = volumeControl.dataset.previousValue || 70;
            }

            // Trigger input event to update volume
            volumeControl.dispatchEvent(new Event('input'));

            // Update icon based on volume level
            updateVolumeIcon();
        });

        // Update volume icon based on volume level
        function updateVolumeIcon() {
            const volume = parseInt(volumeControl.value);
            let iconPath = '';

            if (volume === 0) {
                iconPath = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />';
            } else if (volume < 50) {
                iconPath = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072" />';
            } else {
                iconPath = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />';
            }

            volumeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">${iconPath}</svg>`;
        }

        // Volume slider input handler
        volumeControl.addEventListener('input', () => {
            updateVolumeIcon();

            // Update audio volume if gain node exists
            if (workout.gainNode) {
                const volume = volumeControl.value / 100;
                workout.gainNode.gain.value = volume;
            }
        });

        // Initialize volume icon
        updateVolumeIcon();