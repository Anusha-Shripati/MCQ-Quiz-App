/**
 * Utility functions for screen sharing
 */
import { isFirefox, getBrowser, validateEntireScreenShare, validateSafariScreenShare } from './screenDetection';

/**
 * Starts screen recording
 * @param screenStreamRef - Reference to store the screen stream
 * @param screenSnapshotRef - Video element reference for the screen snapshot
 * @param setPermission - Function to update permission state
 * @param setShowFirefoxScreenSharePrompt - Function to toggle Firefox screen share prompt
 * @param setShowScreenShareErrorModal - Function to toggle screen share error modal
 * @param setShowSafariScreenSharePrompt - Function to toggle Safari screen share prompt
 * @returns Promise<boolean> - true if screen sharing started successfully
 */
export const startScreenRecording = async (
  screenStreamRef: React.MutableRefObject<MediaStream | null>,
  screenSnapshotRef: React.RefObject<HTMLVideoElement>,
  setPermission: (perm: { camera: boolean; screen: boolean } | ((prev: { camera: boolean; screen: boolean }) => { camera: boolean; screen: boolean })) => void,
  setShowFirefoxScreenSharePrompt: (show: boolean) => void,
  setShowScreenShareErrorModal: (show: boolean) => void,
  setShowSafariScreenSharePrompt: (show: boolean) => void
): Promise<boolean> => {
  try {
    // For Firefox, we need user interaction to trigger the screen sharing dialog
    if (isFirefox() && !screenStreamRef.current) {
      setShowFirefoxScreenSharePrompt(true);
      return false;
    }

    const browserType = getBrowser();
    if (browserType === 'safari' && !screenStreamRef.current) {
      setShowSafariScreenSharePrompt(true);
      return false;
    }

    // Different approach based on browser
    if (browserType === 'firefox') {
      console.log('Firefox detected, requesting screen sharing');
      screenStreamRef.current = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
    } else {
      screenStreamRef.current = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
        },
        audio: false,
      });
    }

    setPermission((prv) => ({ ...prv, screen: true }));
    const track = screenStreamRef.current.getVideoTracks()[0];
    
    // Setup track ended handler
    track.onended = () => {
      stopScreenSharing(screenStreamRef);
      setPermission((prv) => ({ ...prv, screen: false }));
    };

    // Validate display surface is monitor (when available)
    const settings = track.getSettings();
    if (settings.displaySurface === 'monitor' || !settings.displaySurface) {
      setPermission((prv) => ({ ...prv, screen: true }));
    } else {
      setPermission((prv) => ({ ...prv, screen: false }));
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      return false;
    }

    // Set up video element for screen sharing
    if (screenSnapshotRef.current) {
      screenSnapshotRef.current.srcObject = screenStreamRef.current;
      await screenSnapshotRef.current.play();
    }

    setShowFirefoxScreenSharePrompt(false);
    setShowSafariScreenSharePrompt(false);
    return true;
  } catch (error) {
    console.log('Screen sharing error:', error);
    setPermission((prv) => ({ ...prv, screen: false }));
    return false;
  }
};

/**
 * Handle Firefox-specific screen sharing
 * @param screenStreamRef - Reference to store the screen stream
 * @param screenSnapshotRef - Video element reference for the screen snapshot
 * @param setPermission - Function to update permission state
 * @param setShowFirefoxScreenSharePrompt - Function to toggle Firefox screen share prompt
 * @param setShowScreenShareErrorModal - Function to toggle screen share error modal
 */
export const handleFirefoxScreenShare = async (
  screenStreamRef: React.MutableRefObject<MediaStream | null>,
  screenSnapshotRef: React.RefObject<HTMLVideoElement>,
  setPermission: (perm: { camera: boolean; screen: boolean } | ((prev: { camera: boolean; screen: boolean }) => { camera: boolean; screen: boolean })) => void,
  setShowFirefoxScreenSharePrompt: (show: boolean) => void,
  setShowScreenShareErrorModal: (show: boolean) => void
): Promise<boolean> => {
  try {
    console.log('Firefox share button clicked');
    
    // We need to call getDisplayMedia directly in the event handler for Firefox
    if (getBrowser() === 'firefox') {
      screenStreamRef.current = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      
      const isFullScreen = validateEntireScreenShare(screenStreamRef.current);
      if (!isFullScreen) {
        // Stop tracks if not entire screen
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        setPermission((prev) => ({ ...prev, screen: false }));

        // Show error modal
        setShowScreenShareErrorModal(true);
        return false;
      }
      
      setPermission((prv) => ({ ...prv, screen: true }));
      const track = screenStreamRef.current.getVideoTracks()[0];
      track.onended = () => {
        stopScreenSharing(screenStreamRef);
        setPermission((prv) => ({ ...prv, screen: false }));
      };

      if (screenSnapshotRef.current) {
        screenSnapshotRef.current.srcObject = screenStreamRef.current;
        await screenSnapshotRef.current.play();
      }

      setShowFirefoxScreenSharePrompt(false);
      return true;
    } else {
      return await startScreenRecording(
        screenStreamRef, 
        screenSnapshotRef, 
        setPermission, 
        setShowFirefoxScreenSharePrompt, 
        setShowScreenShareErrorModal,
        () => {} // Mock function for Safari prompt since not used here
      );
    }
  } catch (error) {
    console.log('Firefox screen share error:', error);
    setPermission((prv) => ({ ...prv, screen: false }));
    return false;
  }
};

/**
 * Handle Safari-specific screen sharing
 * @param screenStreamRef - Reference to store the screen stream
 * @param screenSnapshotRef - Video element reference for the screen snapshot
 * @param setPermission - Function to update permission state
 * @param setShowSafariScreenSharePrompt - Function to toggle Safari screen share prompt
 * @param setShowScreenShareErrorModal - Function to toggle screen share error modal
 */
export const handleSafariScreenShare = async (
  screenStreamRef: React.MutableRefObject<MediaStream | null>,
  screenSnapshotRef: React.RefObject<HTMLVideoElement>,
  setPermission: (perm: { camera: boolean; screen: boolean } | ((prev: { camera: boolean; screen: boolean }) => { camera: boolean; screen: boolean })) => void,
  setShowSafariScreenSharePrompt: (show: boolean) => void,

): Promise<boolean> => {
  try {
    console.log('Safari share button clicked in utility');
    
    // First make sure to clean up any existing stream
    if (screenStreamRef.current) {
      console.log('Cleaning up existing screen stream in Safari handler');
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    
    // Also clear any existing video element srcObject
    if (screenSnapshotRef.current && screenSnapshotRef.current.srcObject) {
      console.log('Clearing video element in Safari handler');
      screenSnapshotRef.current.srcObject = null;
    }
    
    // Call getDisplayMedia directly in the event handler for Safari
    // For Safari, we use simpler constraints
    screenStreamRef.current = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false
    });
    
    console.log('Safari screen share stream obtained:', !!screenStreamRef.current);
    
    if (!screenStreamRef.current) {
      console.error('Failed to get screen share stream in Safari');
      setPermission((prev) => ({ ...prev, screen: false }));
      // Don't show the error modal here - we'll handle this in the QuizPage component
      return false;
    }
    
    // Use Safari-specific validation
    const safariValidation = validateSafariScreenShare(screenStreamRef.current);
    console.log('Safari validation result:', safariValidation);
    
    // If user shared a window instead of entire screen, return false
    // The special error UI will be handled by the QuizPage component
    if (safariValidation.isWindow && !safariValidation.isScreen) {
      console.error('Safari user shared a window instead of entire screen');
      // Don't stop the stream here - we need the tracks for detection in QuizPage
      setPermission((prev) => ({ ...prev, screen: false }));
      return false;
    }
    
    setPermission((prv) => ({ ...prv, screen: true }));
    
    const track = screenStreamRef.current.getVideoTracks()[0];
    console.log('Screen share track:', track);
    
    // Setup track ended handler
    track.onended = () => {
      console.log('Safari screen share track ended');
      stopScreenSharing(screenStreamRef);
      setPermission((prv) => ({ ...prv, screen: false }));
    };

    // Set up video element for screen sharing
    if (screenSnapshotRef.current) {
      console.log('Setting up screen snapshot for Safari');
      screenSnapshotRef.current.srcObject = screenStreamRef.current;
      await screenSnapshotRef.current.play().catch(err => {
        console.error('Error playing screen snapshot in Safari:', err);
      });
      console.log('Screen snapshot playing in Safari');
    }

    setShowSafariScreenSharePrompt(false);
    return true;
  } catch (error) {
    console.error('Safari screen share error:', error);
    setPermission((prv) => ({ ...prv, screen: false }));
    return false;
  }
};

/**
 * Stops screen sharing
 * @param screenStreamRef - Reference to the screen stream
 */
export const stopScreenSharing = (
  screenStreamRef: React.MutableRefObject<MediaStream | null>
): void => {
  if (screenStreamRef.current) {
    screenStreamRef.current.getTracks().forEach((track) => {
      track.stop();
    });
    screenStreamRef.current = null;
  }
}; 