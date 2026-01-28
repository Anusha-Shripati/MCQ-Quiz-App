/**
 * Face tracking utility for detecting when candidate looks away from screen
 * Uses face-api.js to track face position and eye gaze
 */

import * as faceapi from 'face-api.js';
export interface FaceTrackingConfig {
  checkInterval: number; // How often to check face position (ms)
  lookAwayThreshold: number; // Degrees of head rotation to consider "looking away"
  lookAwayDuration: number; // How long to look away before triggering (ms)
}

export interface LookAwayEvent {
  timestamp: number;
  duration: number;
  headPose: {
    yaw: number;
    pitch: number;
    roll: number;
  };
}

const DEFAULT_CONFIG: FaceTrackingConfig = {
  checkInterval: 1000, // Check every second
  lookAwayThreshold: 30, // 30 degrees rotation
  lookAwayDuration: 2000, // 2 seconds of looking away
};

/**
 * Initialize face-api.js models
 */
export const initializeFaceTracking = async (): Promise<boolean> => {
  try {
    const MODEL_URL = '/models';

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    ]);

    console.log('Face tracking models loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading face tracking models:', error);
    return false;
  }
};

/**
 * Calculate head pose angles from face landmarks
 * Returns yaw (left-right), pitch (up-down), roll (tilt)
 */
const calculateHeadPose = (landmarks: faceapi.FaceLandmarks68): { yaw: number; pitch: number; roll: number } => {
  const positions = landmarks.positions;
  
  // Key facial landmarks
  const noseTip = positions[30]; // Nose tip
  const leftEye = positions[36]; // Left eye outer corner
  const rightEye = positions[45]; // Right eye outer corner
  const chin = positions[8]; // Chin
  
  // Calculate yaw (left-right rotation)
  const eyeCenter = {
    x: (leftEye.x + rightEye.x) / 2,
    y: (leftEye.y + rightEye.y) / 2,
  };
  const noseToEyeCenter = noseTip.x - eyeCenter.x;
  const eyeDistance = Math.abs(rightEye.x - leftEye.x);
  const yaw = (noseToEyeCenter / eyeDistance) * 90; // Approximate angle in degrees
  
  // Calculate pitch (up-down rotation)
  const faceHeight = Math.abs(chin.y - eyeCenter.y);
  const noseToEyeVertical = noseTip.y - eyeCenter.y;
  const pitch = (noseToEyeVertical / faceHeight) * 45; // Approximate angle in degrees
  
  // Calculate roll (tilt)
  const eyeSlope = (rightEye.y - leftEye.y) / (rightEye.x - leftEye.x);
  const roll = Math.atan(eyeSlope) * (180 / Math.PI); // Convert to degrees
  
  return { yaw, pitch, roll };
};

/**
 * Check if candidate is looking away based on head pose
 */
const isLookingAway = (headPose: { yaw: number; pitch: number; roll: number }, threshold: number): boolean => {
  return (
    Math.abs(headPose.yaw) > threshold ||
    Math.abs(headPose.pitch) > threshold ||
    Math.abs(headPose.roll) > threshold * 1.5 // Allow more tilt
  );
};

/**
 * Capture evidence when candidate looks away
 * Captures camera and screenshot simultaneously with the same timestamp
 */
const captureIntegrityEvidence = async (
  cameraRef: HTMLVideoElement | null,
  cameraCanvas: HTMLCanvasElement | null,
  screenRef: HTMLVideoElement | null,
  screenCanvas: HTMLCanvasElement | null,
  examApi: { post: (url: string, data: FormData, accessCode: string) => Promise<unknown> },
  examEndpoint: { CANDIDATE_EXAM: string },
  examId: string,
  accessCode: string,
  event: LookAwayEvent
): Promise<void> => {
  if (!cameraRef || !cameraCanvas || !screenRef || !screenCanvas) {
    console.error('Missing refs for capturing evidence');
    return;
  }

  // Verify video elements are ready
  if (cameraRef.readyState < 2 || screenRef.readyState < 2) {
    console.warn('Video elements not ready for capture', {
      cameraReady: cameraRef.readyState,
      screenReady: screenRef.readyState
    });
    return;
  }

  // Verify video dimensions are valid
  if (cameraRef.videoWidth === 0 || cameraRef.videoHeight === 0) {
    console.warn('Camera video has no dimensions');
    return;
  }

  if (screenRef.videoWidth === 0 || screenRef.videoHeight === 0) {
    console.warn('Screen video has no dimensions');
    return;
  }

  try {
    // CRITICAL: Use the same timestamp provided in the event to ensure synchronization
    const timestamp = event.timestamp;

    // Capture BOTH images at the exact same moment
    // Camera image
    cameraCanvas.width = cameraRef.videoWidth;
    cameraCanvas.height = cameraRef.videoHeight;
    const cameraCtx = cameraCanvas.getContext('2d');
    if (!cameraCtx) {
      console.error('Failed to get camera canvas context');
      return;
    }
    cameraCtx.drawImage(cameraRef, 0, 0, cameraCanvas.width, cameraCanvas.height);

    // Screen image (captured immediately after camera)
    screenCanvas.width = screenRef.videoWidth;
    screenCanvas.height = screenRef.videoHeight;
    const screenCtx = screenCanvas.getContext('2d');
    if (!screenCtx) {
      console.error('Failed to get screen canvas context');
      return;
    }
    screenCtx.drawImage(screenRef, 0, 0, screenCanvas.width, screenCanvas.height);

    // Convert both to data URLs
    const cameraImageData = cameraCanvas.toDataURL('image/jpeg', 0.8);
    const screenImageData = screenCanvas.toDataURL('image/jpeg', 0.8);

    // Verify both images were captured
    if (!cameraImageData || cameraImageData === 'data:,') {
      console.error('Failed to capture camera image');
      return;
    }

    if (!screenImageData || screenImageData === 'data:,') {
      console.error('Failed to capture screen image');
      return;
    }

    // Convert to blobs
    const cameraBlob = dataURLtoBlob(cameraImageData);
    const screenBlob = dataURLtoBlob(screenImageData);

    // Verify blobs are valid
    if (cameraBlob.size === 0 || screenBlob.size === 0) {
      console.error('Invalid blob sizes', {
        cameraSize: cameraBlob.size,
        screenSize: screenBlob.size,
      });
      return;
    }

    // Create form data for camera with THE SAME timestamp
    const cameraFormData = new FormData();
    cameraFormData.append('file', cameraBlob, 'camera.jpg');
    cameraFormData.append('timestamp', timestamp.toString());
    cameraFormData.append('eventType', 'lookAway');
    cameraFormData.append('headPose', JSON.stringify(event.headPose));
    cameraFormData.append('duration', event.duration.toString());

    // Create form data for screen with THE SAME timestamp
    const screenFormData = new FormData();
    screenFormData.append('file', screenBlob, 'screen.jpg');
    screenFormData.append('timestamp', timestamp.toString());
    screenFormData.append('eventType', 'lookAway');
    screenFormData.append('headPose', JSON.stringify(event.headPose));
    screenFormData.append('duration', event.duration.toString());

    // Upload images sequentially to avoid backend race conditions on meta update
    const cameraResult = await examApi.post(
      `${examEndpoint.CANDIDATE_EXAM}/${examId}/integrity-evidence?fileType=camera`,
      cameraFormData,
      accessCode
    );

    const screenResult = await examApi.post(
      `${examEndpoint.CANDIDATE_EXAM}/${examId}/integrity-evidence?fileType=screenshot`,
      screenFormData,
      accessCode
    );

    console.log('Integrity evidence captured and uploaded successfully', {
      timestamp,
      synchronized: true,
      cameraUploaded: !!cameraResult,
      screenUploaded: !!screenResult,
    });
  } catch (error) {
    console.error('Error capturing integrity evidence:', error);
  }
};

/**
 * Convert data URL to Blob
 */
const dataURLtoBlob = (dataURL: string): Blob => {
  const byteString = atob(dataURL.split(',')[1]);
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

/**
 * Start face tracking to detect when candidate looks away
 */
export const startFaceTracking = (
  videoElement: HTMLVideoElement | null,
  cameraRef: HTMLVideoElement | null,
  cameraCanvas: HTMLCanvasElement | null,
  screenRef: HTMLVideoElement | null,
  screenCanvas: HTMLCanvasElement | null,
  examApi: { post: (url: string, data: FormData, accessCode: string) => Promise<unknown> },
  examEndpoint: { CANDIDATE_EXAM: string },
  examId: string,
  accessCode: string,
  config: Partial<FaceTrackingConfig> = {}
): (() => void) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  let isTracking = true;
  let lookAwayStartTime: number | null = null;
  let lastCaptureTime = 0;
  const MIN_CAPTURE_INTERVAL = 30000; // Minimum 30 seconds between captures
  let consecutiveErrors = 0;
  const MAX_CONSECUTIVE_ERRORS = 5;

  const checkFace = async () => {
    if (!isTracking || !videoElement) return;

    // Verify video is ready before attempting detection
    if (videoElement.readyState < 2 || videoElement.videoWidth === 0) {
      consecutiveErrors++;
      if (consecutiveErrors <= MAX_CONSECUTIVE_ERRORS) {
        console.warn('Video not ready for face detection, retrying...', {
          readyState: videoElement.readyState,
          videoWidth: videoElement.videoWidth
        });
        setTimeout(checkFace, finalConfig.checkInterval);
        return;
      } else {
        console.error('Video element not ready after multiple attempts, stopping face tracking');
        return;
      }
    }

    try {
      // Reset error counter on successful check
      consecutiveErrors = 0;

      // Detect face with landmarks
      const detection = await faceapi
        .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (!detection) {
        // No face detected - candidate might have left
        if (!lookAwayStartTime) {
          lookAwayStartTime = Date.now();
        }
        
        const lookAwayDuration = Date.now() - lookAwayStartTime;
        
        if (lookAwayDuration >= finalConfig.lookAwayDuration) {
          const now = Date.now();
          if (now - lastCaptureTime >= MIN_CAPTURE_INTERVAL) {
            console.log('No face detected for extended period');

            // Capture immediately with the current timestamp to ensure synchronization
            captureIntegrityEvidence(
              cameraRef,
              cameraCanvas,
              screenRef,
              screenCanvas,
              examApi,
              examEndpoint,
              examId,
              accessCode,
              {
                timestamp: now,
                duration: lookAwayDuration,
                headPose: { yaw: 0, pitch: 0, roll: 0 },
              }
            );

            lastCaptureTime = now;
            lookAwayStartTime = null;
          }
        }
      } else {
        // Face detected - check head pose
        const headPose = calculateHeadPose(detection.landmarks);
        const lookingAway = isLookingAway(headPose, finalConfig.lookAwayThreshold);

        if (lookingAway) {
          if (!lookAwayStartTime) {
            lookAwayStartTime = Date.now();
          }

          const lookAwayDuration = Date.now() - lookAwayStartTime;

          if (lookAwayDuration >= finalConfig.lookAwayDuration) {
            const now = Date.now();
            if (now - lastCaptureTime >= MIN_CAPTURE_INTERVAL) {
              console.log('Candidate looking away detected', {
                headPose,
                duration: lookAwayDuration,
              });

              // Capture immediately with the current timestamp to ensure synchronization
              captureIntegrityEvidence(
                cameraRef,
                cameraCanvas,
                screenRef,
                screenCanvas,
                examApi,
                examEndpoint,
                examId,
                accessCode,
                {
                  timestamp: now,
                  duration: lookAwayDuration,
                  headPose,
                }
              );

              lastCaptureTime = now;
              lookAwayStartTime = null;
            }
          }
        } else {
          // Looking at screen - reset timer
          lookAwayStartTime = null;
        }
      }
    } catch (error) {
      consecutiveErrors++;
      console.error('Error in face tracking:', error);
      
      if (consecutiveErrors > MAX_CONSECUTIVE_ERRORS) {
        console.error('Too many consecutive errors, stopping face tracking');
        return;
      }
    }

    // Schedule next check
    if (isTracking) {
      setTimeout(checkFace, finalConfig.checkInterval);
    }
  };

  // Start tracking
  checkFace();

  // Return cleanup function
  return () => {
    isTracking = false;
  };
};
