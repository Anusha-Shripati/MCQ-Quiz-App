/**
 * Utility functions for camera handling
 */

/**
 * Convert a data URL to a Blob
 * @param dataURL - The data URL to convert
 * @returns Blob created from the data URL
 */
export const dataURLtoBlob = (dataURL: string): Blob => {
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
 * Starts the camera with retry capability
 * @param setCameraStream - Function to set camera stream in the parent component
 * @param setPermission - Function to update permission state
 * @param setCameraError - Function to set camera error
 * @param retryCount - Current retry attempt count
 * @param maxRetries - Maximum retry attempts
 * @returns Promise<boolean> - true if camera started successfully
 */
export const startCamera = async (
  setCameraStream: (stream: MediaStream) => void,
  setPermission: (perm: { camera: boolean; screen: boolean } | ((prev: { camera: boolean; screen: boolean }) => { camera: boolean; screen: boolean })) => void,
  setCameraError: (error: string | null) => void,
  cameraStreamRef: MediaStream | null,
  cameraSnapshotRef: React.RefObject<HTMLVideoElement> ,
  retryCount = 0,
  maxRetries = 3
): Promise<boolean> => {
  try {
    // Release any existing camera streams first to avoid conflicts
    if (cameraStreamRef) {
      cameraStreamRef.getTracks().forEach(track => {
        track.stop();
      });
    }

    
    // Check if devices are available before requesting
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    if (videoDevices.length === 0) {
      throw new Error('No camera detected on this device');
    }
    
    // Request camera access with specific constraints
    const cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user"
      },
      audio: true,
    });
    
    const videoTrack = cameraStream.getVideoTracks()[0];
    if (!videoTrack) {
      throw new Error('Video track not available');
    }
    
    // Setup track ended handler
    videoTrack.onended = () => {
      setPermission((prv: { camera: boolean; screen: boolean }) => ({ ...prv, camera: false }));
      // Try to reconnect camera if it disconnects unexpectedly
      startCamera(setCameraStream, setPermission, setCameraError, null, cameraSnapshotRef, 0, maxRetries);
    };
    if (cameraSnapshotRef.current) {
      cameraSnapshotRef.current.srcObject = cameraStream;
      // Mute the video element to prevent audio feedback/echo
      cameraSnapshotRef.current.muted = true;
      await cameraSnapshotRef.current.play();
    }

    setCameraStream(cameraStream);
    setPermission((prv: { camera: boolean; screen: boolean }) => ({ ...prv, camera: true }));
    
    return true;
  } catch (error) {
    console.error('Camera initialization error:', error);
    
    // Retry logic - try again a few times before giving up
    if (retryCount < maxRetries) {
      console.log(`Retrying camera initialization in 1 second... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return startCamera(setCameraStream, setPermission, setCameraError, null,cameraSnapshotRef, retryCount + 1, maxRetries);
    }
    
    // If all retries fail, update error state
    const errorMessage = 'Failed to start camera. Please ensure you have granted camera permissions and no other application is using your camera.';
    setCameraError(errorMessage);
    setPermission((prv: { camera: boolean; screen: boolean }) => ({ ...prv, camera: false }));
    return false;
  }
};

/**
 * Takes a screenshot from a video element and uploads it
 * @param ref - Video element reference
 * @param canvas - Canvas element reference
 * @param type - Type of screenshot (camera/screen)
 * @param examApi - API instance
 * @param examEndpoint - API endpoint
 * @param examId - Exam ID
 * @param accessCode - Access code
 * @param timestamp - Optional timestamp to use (for synchronized captures)
 */
export const takeScreenshot = async (
  ref: HTMLVideoElement | null,
  canvas: HTMLCanvasElement | null,
  type: string,
  examApi: { post: (url: string, data: FormData, accessCode: string) => Promise<unknown> },
  examEndpoint: { CANDIDATE_EXAM: string },
  examId: string,
  accessCode: string,
  timestamp?: number
): Promise<void> => {
  if (!ref || !canvas) return;

  canvas.width = ref.videoWidth;
  canvas.height = ref.videoHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  ctx.drawImage(ref, 0, 0, canvas.width, canvas.height);
  const imageDataURL = canvas.toDataURL('image/jpeg', 0.8);
  
  // Convert data URL to blob
  const blob = dataURLtoBlob(imageDataURL);

  const formData = new FormData();
  formData.append('file', blob);
  formData.append('timestamp', (timestamp || Date.now()).toString());

  try {
    await examApi.post(
      `${examEndpoint.CANDIDATE_EXAM}/${examId}/snapshot?fileType=${type}`,
      formData,
      accessCode
    );
  } catch (error) {
    console.error('Error taking screenshot:', error);
  }
};

/**
 * Takes synchronized screenshots from both camera and screen at the same timestamp
 * @param cameraRef - Camera video element reference
 * @param cameraCanvas - Camera canvas element reference
 * @param screenRef - Screen video element reference
 * @param screenCanvas - Screen canvas element reference
 * @param examApi - API instance
 * @param examEndpoint - API endpoint
 * @param examId - Exam ID
 * @param accessCode - Access code
 * @param cameraType - Type identifier for camera snapshot
 * @param screenType - Type identifier for screen snapshot
 */
export const takeSynchronizedScreenshots = async (
  cameraRef: HTMLVideoElement | null,
  cameraCanvas: HTMLCanvasElement | null,
  screenRef: HTMLVideoElement | null,
  screenCanvas: HTMLCanvasElement | null,
  examApi: { post: (url: string, data: FormData, accessCode: string) => Promise<unknown> },
  examEndpoint: { CANDIDATE_EXAM: string },
  examId: string,
  accessCode: string,
  cameraType: string,
  screenType: string
): Promise<void> => {
  // Use the same timestamp for both captures
  const timestamp = Date.now();

  // Take both screenshots simultaneously with the same timestamp
  await Promise.all([
    takeScreenshot(cameraRef, cameraCanvas, cameraType, examApi, examEndpoint, examId, accessCode, timestamp),
    takeScreenshot(screenRef, screenCanvas, screenType, examApi, examEndpoint, examId, accessCode, timestamp)
  ]);
};

/**
 * Stops all media tracks in streams
 * @param screenStream - Screen MediaStream reference
 * @param cameraStream - Camera MediaStream reference
 */
export const stopMediaStreams = (
  screenStream: MediaStream | null, 
  cameraStream: MediaStream | null
): void => {
  if (screenStream) {
    screenStream.getTracks().forEach((track) => {
      track.stop();
    });
  }
  
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => {
      track.stop();
    });
  }
};