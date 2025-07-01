import * as faceapi from 'face-api.js';

// CDN URL for face-api.js models
const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

/**
 * Loads required face-api.js models from CDN or local path
 * Falls back to CDN if local path fails
 */
export const loadFaceDetectionModels = async (onProgress?: (message: string) => void): Promise<boolean> => {
  try {
    if (onProgress) onProgress('Loading face detection...');
    
    // Try loading from local path first
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models') // Add SSD model for better multi-face detection
      ]);
      
      if (onProgress) onProgress('Models loaded successfully');
      return true;
    } catch (localError) {
      console.warn('Failed to load models from local path, trying CDN...', localError);
      if (onProgress) onProgress('Still Loading face detection...');
      
      // If local path fails, try loading from CDN
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL) // Add SSD model for better multi-face detection
      ]);
      
      if (onProgress) onProgress('Models loaded successfully');
      return true;
    }
  } catch (error) {
    console.error('Error loading face detection models:', error);
    if (onProgress) onProgress('Failed to load face detection models');
    return false;
  }
};

/**
 * Check if a face is present in the video feed
 */
export const detectFace = async (videoElement: HTMLVideoElement): Promise<faceapi.FaceDetection | null> => {
  if (!videoElement || videoElement.readyState !== 4) return null;
  
  try {
    const detection = await faceapi.detectSingleFace(
      videoElement, 
      new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 })
    );
    
    return detection || null;
  } catch (error) {
    console.error('Error detecting face:', error);
    return null;
  }
};

/**
 * Detect multiple faces in the video feed
 * @returns Array of face detections, or empty array if none found
 */
export const detectMultipleFaces = async (videoElement: HTMLVideoElement): Promise<faceapi.FaceDetection[]> => {
  if (!videoElement || videoElement.readyState !== 4) return [];
  
  try {
    // Use SSD MobileNet for more accurate multi-face detection
    const detections = await faceapi.detectAllFaces(
      videoElement,
      new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })
    );
    
    return detections;
  } catch (error) {
    console.error('Error detecting multiple faces:', error);
    return [];
  }
};

/**
 * Check if face is centered in the frame
 */
export const checkFaceCentered = (
  detection: faceapi.FaceDetection | null, 
  videoWidth: number, 
  videoHeight: number
): boolean => {
  if (!detection) return false;
  
  const { x, y, width, height } = detection.box;
  
  // Calculate face center
  const faceCenterX = x + width / 2;
  const faceCenterY = y + height / 2;
  
  // Calculate video center
  const videoCenterX = videoWidth / 2;
  const videoCenterY = videoHeight / 2;
  
  // Calculate distance from center (as percentage of dimensions)
  const distanceX = Math.abs(faceCenterX - videoCenterX) / videoWidth;
  const distanceY = Math.abs(faceCenterY - videoCenterY) / videoHeight;
  
  // Face is centered if it's less than 15% away from center in both directions
  return distanceX < 0.15 && distanceY < 0.15;
};

/**
 * Check if face has proper size in the frame
 */
export const checkFaceSize = (
  detection: faceapi.FaceDetection | null, 
  videoWidth: number, 
  videoHeight: number
): boolean => {
  if (!detection) return false;
  
  const { width, height } = detection.box;
  
  // Calculate face area as percentage of video area
  const faceArea = width * height;
  const videoArea = videoWidth * videoHeight;
  const facePercentage = faceArea / videoArea;
  
  // Face should occupy between 10% and 50% of the frame
  return facePercentage > 0.10 && facePercentage < 0.50;
};
