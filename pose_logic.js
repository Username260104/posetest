/**
 * Pose Logic Module
 * Handles mathematical calculations for angles, distances, and similarity scoring.
 */

// 1. Math Utilities
function calculateDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function calculateAngle(a, b, c) {
    // b is the center point (e.g., elbow)
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    
    if (angle > 180.0) {
        angle = 360.0 - angle;
    }
    return angle;
}

// 2. Feature Extraction
export function extractPoseFeatures(landmarks) {
    // Landmarks Reference (MediaPipe Pose)
    // 11: left_shoulder, 12: right_shoulder
    // 13: left_elbow, 14: right_elbow
    // 15: left_wrist, 16: right_wrist
    
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];

    // Basic Skeleton Confidence Check
    if (!leftShoulder || !rightShoulder || !leftElbow || !rightElbow || !leftWrist || !rightWrist) {
        return null;
    }

    // A. Angles (Degrees)
    const leftArmAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightArmAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    
    // Shoulder Tilt (Angle relative to horizon)
    // We treat (0,0) as top-left, so y increases downwards.
    // Horizontal line would have same y.
    const shoulderTilt = Math.atan2(rightShoulder.y - leftShoulder.y, rightShoulder.x - leftShoulder.x) * 180 / Math.PI;

    // B. Ratios (Scale-Invariant)
    // Base Unit: Shoulder Width (Distance between shoulders)
    const shoulderWidth = calculateDistance(leftShoulder, rightShoulder);
    
    // Distance from Shoulder to Wrist (Normalized by Shoulder Width)
    // This helps detect if arms are extended or close to body, regardless of camera distance.
    const leftWristDist = calculateDistance(leftShoulder, leftWrist) / shoulderWidth;
    const rightWristDist = calculateDistance(rightShoulder, rightWrist) / shoulderWidth;

    return {
        leftArmAngle: parseFloat(leftArmAngle.toFixed(1)),
        rightArmAngle: parseFloat(rightArmAngle.toFixed(1)),
        shoulderTilt: parseFloat(Math.abs(shoulderTilt).toFixed(1)), // Absolute tilt
        leftWristRatio: parseFloat(leftWristDist.toFixed(2)),
        rightWristRatio: parseFloat(rightWristDist.toFixed(2))
    };
}

// 3. Similarity Calculation
export function calculateSimilarity(target, current) {
    if (!target || !current) return 0;

    // Define weights for each feature (Total = 1.0)
    const weights = {
        leftArmAngle: 0.25,
        rightArmAngle: 0.25,
        shoulderTilt: 0.1,
        leftWristRatio: 0.2,
        rightWristRatio: 0.2
    };

    // Calculate absolute differences
    // For angles: 180 degrees is max difference, normalize to 0-1
    const diffLeftAngle = Math.abs(target.leftArmAngle - current.leftArmAngle) / 180.0;
    const diffRightAngle = Math.abs(target.rightArmAngle - current.rightArmAngle) / 180.0;
    
    // For Tilt: 45 degrees nice max, normalize
    const diffTilt = Math.min(Math.abs(target.shoulderTilt - current.shoulderTilt) / 45.0, 1.0);

    // For Ratios: Diff of 1.0 (full shoulder width) is huge. Let's cap at 1.0
    const diffLeftRatio = Math.min(Math.abs(target.leftWristRatio - current.leftWristRatio), 1.0);
    const diffRightRatio = Math.min(Math.abs(target.rightWristRatio - current.rightWristRatio), 1.0);

    // Weighted Error Sum
    const error = 
        (diffLeftAngle * weights.leftArmAngle) +
        (diffRightAngle * weights.rightArmAngle) +
        (diffTilt * weights.shoulderTilt) +
        (diffLeftRatio * weights.leftWristRatio) +
        (diffRightRatio * weights.rightWristRatio);
    
    // Similarity = 1 - Error
    // Clamp between 0 and 1
    const similarity = Math.max(0, 1 - error);
    
    return Math.floor(similarity * 100);
}
