/**
 * Utility functions for screen detection and management
 */

/**
 * Detects multiple screens using various browser-specific approaches
 * @returns Promise<boolean> - true if multiple screens are detected
 */
export const detectMultipleScreens = async (): Promise<boolean> => {
  try {
    if (typeof window === 'undefined') {
      console.log('window is undefined');
      return false;
    }
    
    // Check if using Chrome/Edge with screen.isExtended API
    if (isScreenExtendedAvailable()) {
      console.log('isScreenExtendedAvailable');
      return true;
    }
    
    // Check for window position differences (works on most browsers)
    if (hasScreenPositionDifference()) {
      console.log('hasScreenPositionDifference');
      return true;
    }
    
    // Firefox-specific checks
    if (isFirefox()) {
      // if (hasFirefoxMultipleScreens()) {
      //   console.log('hasFirefoxMultipleScreens');
      //   return true;
      // }
      return false
    }
    
    // Try modern Screen Details API (Chrome, Edge)
    const hasMultipleScreensViaAPI = await checkScreenDetailsAPI();
    if (hasMultipleScreensViaAPI) {
      console.log('hasMultipleScreensViaAPI');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error detecting multiple screens:', error);
    return false;
  }
};

/**
 * Checks if the browser is Firefox
 */
export const isFirefox = (): boolean => {
  return typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') !== -1;
};

/**
 * Checks if the browser is Safari
 */
export const isSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // More reliable Safari detection
  const userAgent = navigator.userAgent;
  return /^((?!chrome|android).)*safari/i.test(userAgent);
};

/**
 * Gets the current browser type
 */
export const getBrowser = (): string => {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = navigator.userAgent;
  
  // Safari detection must come before Chrome
  if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) return 'safari';
  if (/Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor)) return 'chrome';
  if (/Firefox/.test(userAgent)) return 'firefox';
  
  return 'unknown';
};

/**
 * Check if Chrome/Edge's screen.isExtended API indicates multiple screens
 */
const isScreenExtendedAvailable = (): boolean => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window.screen as any).isExtended === true;
  } catch {
    return false;
  }
};

/**
 * Check for window position differences indicating multiple screens
 */
const hasScreenPositionDifference = (): boolean => {
  try {
    return Math.abs(window.screenLeft - window.screenX) > 10 || 
           Math.abs(window.screenTop - window.screenY) > 10;
  } catch {
    return false;
  }
};

/**
 * Firefox-specific multiple screen detection logic
 */
// const hasFirefoxMultipleScreens = (): boolean => {
//   try {
    
//     // Check for unusual screen dimensions
//     const screenWidthDiff = Math.abs(window.screen.width - window.screen.availWidth) > 100;
//     const screenHeightDiff = Math.abs(window.screen.height - window.screen.availHeight) > 100;
    
//     // Check for unusually high resolution (likely multiple monitors)
//     const unusuallyHighRes = window.screen.width > 3000 || window.screen.height > 2000;
    
//     // Check for unusual device pixel ratio
//     const unusualPixelRatio = window.devicePixelRatio !== 1 && window.devicePixelRatio % 1 !== 0;
//     console.log('Screen width diff:', screenWidthDiff);
//     console.log('Screen height diff:', screenHeightDiff);
//     console.log('Unusually high resolution:', unusuallyHighRes);
//     console.log('Unusual pixel ratio:', unusualPixelRatio);
//     return screenWidthDiff || screenHeightDiff || unusuallyHighRes || unusualPixelRatio;
//   } catch {
//     return false;
//   }
// };

/**
 * Check for multiple screens using modern Screen Details API
 */
const checkScreenDetailsAPI = async (): Promise<boolean> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).getScreenDetails && typeof (window as any).getScreenDetails === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const details = await (window as any).getScreenDetails();
      return details.screens && details.screens.length > 1;
    }
    return false;
  } catch {
    // Permission may be denied or API not available
    return false;
  }
};

/**
 * Validates if the screen sharing includes the entire screen
 * @param stream The MediaStream from screen sharing
 * @returns boolean indicating if the full screen is being shared
 */
export const validateEntireScreenShare = (stream: MediaStream | null): boolean => {
  if (!stream) return false;
  
  const track = stream.getVideoTracks()[0];
  if (!track) return false;

  const settings = track.getSettings();
  console.log('Screen share settings:', settings);
  const { width = 0, height = 0, displaySurface = '' } = settings;

  // You can log for debugging
  console.log('Screen share resolution:', width, height);
  console.log('Display surface:', displaySurface);

  // For browsers that support displaySurface (Chrome, sometimes Safari)
  if (displaySurface && displaySurface !== 'monitor') {
    console.log('Not sharing entire screen - detected displaySurface:', displaySurface);
    return false;
  }

  // Consider it full screen if resolution is at least 1920x1080
  const MIN_WIDTH = 1920;
  const MIN_HEIGHT = 1080;
  const isLikelyFullScreen = width >= MIN_WIDTH && height >= MIN_HEIGHT;
  
  return isLikelyFullScreen;
};

/**
 * Safari-specific validation for screen vs. window sharing
 * @param stream The MediaStream from screen sharing
 * @returns A validation result object
 */
export const validateSafariScreenShare = (stream: MediaStream | null): { 
  isValid: boolean;
  isWindow: boolean;
  isScreen: boolean;
} => {
  if (!stream) {
    return { isValid: false, isWindow: false, isScreen: false };
  }
  
  const track = stream.getVideoTracks()[0];
  if (!track) {
    return { isValid: false, isWindow: false, isScreen: false };
  }
  
  const settings = track.getSettings();
  console.log('Safari screen share settings:', settings);
  
  const { width = 0, height = 0, displaySurface = '' } = settings;
  
  // Check for display surface (newer Safari versions might support this)
  const isWindowByDisplaySurface = displaySurface === 'window' || 
                                  displaySurface === 'browser' || 
                                  displaySurface === 'application';
  
  // Check if resolution is too small to be a full screen
  // Windows and applications typically have smaller dimensions
  const SAFARI_MIN_SCREEN_WIDTH = 1200;  // Lower threshold for Safari
  const isSmallResolution = width < SAFARI_MIN_SCREEN_WIDTH;
  
  // Detect if aspect ratio matches typical application windows (more squarish)
  // Full screens typically have wider aspect ratios
  const aspectRatio = width / height;
  const isWindowAspectRatio = aspectRatio > 0.5 && aspectRatio < 2.0;
  
  // Combine heuristics to determine if user is sharing a window instead of screen
  const isLikelyWindow = isWindowByDisplaySurface || 
                        (isSmallResolution && isWindowAspectRatio);
  
  // Full screen is large resolution with wide aspect ratio
  const isLikelyScreen = !isLikelyWindow && width >= SAFARI_MIN_SCREEN_WIDTH;
  
  console.log('Safari share validation:', {
    width,
    height,
    aspectRatio,
    isWindowByDisplaySurface,
    isSmallResolution,
    isWindowAspectRatio,
    isLikelyWindow,
    isLikelyScreen
  });
  
  return {
    isValid: isLikelyScreen,
    isWindow: isLikelyWindow,
    isScreen: isLikelyScreen
  };
}; 