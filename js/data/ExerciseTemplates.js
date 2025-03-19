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
    // Beginner mix workouts
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
    // Intermediate mix workouts
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
    // Advanced mix workouts
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

export default exerciseTemplates;