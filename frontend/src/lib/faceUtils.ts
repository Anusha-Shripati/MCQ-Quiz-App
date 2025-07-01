// import * as faceapi from 'face-api.js';

// /**
//  * Validates that a face is properly aligned and steady
//  */
// export const validateFaceAlignment = async (
//   videoElement: HTMLVideoElement,
//   options = {
//     minSize: 0.15, // Face should be at least 15% of frame
//     maxSize: 0.85, // Face should not exceed 85% of frame
//     stabilityThreshold: 5, // Max pixel movement for stability
//     requiredStableFrames: 10, // Number of consecutive stable frames required
//   }
// ) => {
//   if (!videoElement) return { success: false, message: 'No video element provided' };
  
//   try {
//     // Detect face with landmarks
//     const detection = await faceapi.detectSingleFace(
//       videoElement, 
//       new faceapi.TinyFaceDetectorOptions()
//     ).withFaceLandmarks();
    
//     if (!detection) {
//       return { success: false, message: 'No face detected' };
//     }
    
//     // Get dimensions
//     const videoWidth = videoElement.videoWidth;
//     const videoHeight = videoElement.videoHeight;
    
//     // Check face position (should be centered)
//     const { x, y, width, height } = detection.detection.box;
//     const faceCenterX = x + width / 2;
//     const faceCenterY = y + height / 2;
//     const videoCenterX = videoWidth / 2;
//     const videoCenterY = videoHeight / 2;
    
//     // Calculate how centered the face is (as percentage of dimensions)
//     const offsetX = Math.abs(faceCenterX - videoCenterX) / videoWidth;
//     const offsetY = Math.abs(faceCenterY - videoCenterY) / videoHeight;
    
//     if (offsetX > 0.15 || offsetY > 0.15) {
//       return { 
//         success: false, 
//         message: 'Face is not centered in the frame',
//         details: { offsetX, offsetY }
//       };
//     }
    
//     // Check face size (should be a reasonable proportion of the frame)
//     const faceArea = width * height;
//     const videoArea = videoWidth * videoHeight;
//     const facePercentage = faceArea / videoArea;
    
//     if (facePercentage < options.minSize) {
//       return {
//         success: false,
//         message: 'Face is too small, please move closer',
//         details: { facePercentage }
//       };
//     }
    
//     if (facePercentage > options.maxSize) {
//       return {
//         success: false,
//         message: 'Face is too large, please move back',
//         details: { facePercentage }
//       };
//     }
    
//     // All checks passed
//     return { 
//       success: true, 
//       message: 'Face properly positioned',
//       details: {
//         position: { x, y, width, height },
//         centered: { offsetX, offsetY },
//         size: facePercentage
//       }
//     };
//   } catch (error) {
//     console.error('Face validation error:', error);
//     return { success: false, message: 'Error validating face position' };
//   }
// };

// /**
//  * Downloads and initializes face-api models
//  */
// export const initializeFaceDetection = async () => {
//   try {
//     await Promise.all([
//       faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
//       faceapi.nets.faceLandmark68Net.loadFromUri('/models')
//     ]);
//     return true;
//   } catch (error) {
//     console.error('Error initializing face detection:', error);
//     return false;
//   }
// };
