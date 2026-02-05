import { extractPoseFeatures, calculateSimilarity } from './pose_logic.js';

// DOM Elements
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const similarityDisplay = document.getElementById('similarity-score');
const statusIndicator = document.getElementById('status-indicator');
const debugLog = document.getElementById('debug-log');
const btnSave = document.getElementById('btn-save');
const btnReset = document.getElementById('btn-reset');
const sliderThreshold = document.getElementById('threshold-slider');
const valThreshold = document.getElementById('threshold-value');

// State Variables
let targetPose = null;
let currentPose = null;
let isRecording = false; // Toggle state for "Save" logic if needed, but we use instant save here.
let threshold = 80;

// Button Events
btnSave.addEventListener('click', () => {
    if (currentPose) {
        targetPose = { ...currentPose }; // Deep copy
        console.log("Target Pose Saved:", targetPose);
        alert("Pose Saved! Now copy this pose.");
        // Change Button Text
        btnSave.innerText = "UPDATE TARGET POSE";
    } else {
        alert("No pose detected to save.");
    }
});

btnReset.addEventListener('click', () => {
    targetPose = null;
    similarityDisplay.innerText = "0%";
    statusIndicator.className = ""; // Remove matched class
    statusIndicator.style.display = "none";
    btnSave.innerText = "UNLOCK / SAVE POSE";
    debugLog.innerText = "Waiting for pose...";
});

sliderThreshold.addEventListener('input', (e) => {
    threshold = e.target.value;
    valThreshold.innerText = threshold + "%";
});

// MediaPipe Pose Setup
function onResults(results) {
    if (!results.poseLandmarks) return;

    // 1. Draw Skeleton
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Draw styles for Light Theme (Black skeleton)
    canvasCtx.globalCompositeOperation = 'source-over';

    // Connectors
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
        { color: '#000000', lineWidth: 4 });

    // Landmarks
    drawLandmarks(canvasCtx, results.poseLandmarks,
        { color: '#FF0000', lineWidth: 2, radius: 4 }); // Red dots for contrast

    canvasCtx.restore();

    // 2. Extract Features
    const features = extractPoseFeatures(results.poseLandmarks);

    if (features) {
        currentPose = features;

        let debugText = "CURRENT POSE:\n";
        debugText += `L-Arm Angle: ${features.leftArmAngle}°\n`;
        debugText += `R-Arm Angle: ${features.rightArmAngle}°\n`;
        debugText += `Tilt:        ${features.shoulderTilt}°\n`;
        debugText += `L-Ratio:     ${features.leftWristRatio}\n`;
        debugText += `R-Ratio:     ${features.rightWristRatio}\n`;

        if (targetPose) {
            // 3. Compare with Target
            const similarity = calculateSimilarity(targetPose, currentPose);

            // Update UI
            similarityDisplay.innerText = similarity + "%";

            // Check Threshold
            if (similarity >= threshold) {
                statusIndicator.innerText = "MATCHED!";
                statusIndicator.classList.add("matched");
                statusIndicator.style.display = "block";
            } else {
                statusIndicator.classList.remove("matched");
                statusIndicator.style.display = "none";
            }

            debugText += "\n[TARGET SAVED]\n";
        }

        debugLog.innerText = debugText;
    }
}

const pose = new Pose({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    }
});

pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

pose.onResults(onResults);

// Camera Setup
const camera = new Camera(videoElement, {
    onFrame: async () => {
        await pose.send({ image: videoElement });
    },
    width: 1280,
    height: 720
});

camera.start();
