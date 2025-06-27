/**
 * Utility functions for security and browser restrictions
 */
import { BROWSER_KEY, PROHIBITED_COMBINATIONS, PROHIBITED_KEYS } from '@/shared/constants/data';

/**
 * Handles key down events to prevent prohibited actions
 * @param e - KeyboardEvent to handle
 */
export const handleKeyDown = (e: KeyboardEvent): void => {
  // Prevent specific keys
  if (PROHIBITED_KEYS.includes(e.key)) {
    e.preventDefault();
    return;
  }

  // Check for prohibited key combinations
  for (const combo of PROHIBITED_COMBINATIONS) {
    if (
      e.key.toLowerCase() === combo.key.toLowerCase() &&
      e[combo.modifier as keyof KeyboardEvent]
    ) {
      e.preventDefault();
      return;
    }
  }

  // Prevent browser shortcuts
  if ((e.ctrlKey || e.metaKey) && BROWSER_KEY.includes(e.key)) {
    e.preventDefault();
    return;
  }

  // Prevent Alt key combinations (menu shortcuts)
  if (e.altKey) {
    e.preventDefault();
    return;
  }
};

/**
 * Requests fullscreen mode for the document
 * @param setIsFullscreen - Function to update fullscreen state
 */
export const requestFullscreen = (
  setIsFullscreen: (isFullscreen: boolean) => void
): void => {
  try {
    if (document.documentElement.requestFullscreen) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          console.log('Entered fullscreen mode');
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.error('Error attempting to enable fullscreen:', err);
        });
    } else {
      console.log('Fullscreen API not supported');
    }
  } catch (error) {
    console.error('Error requesting fullscreen:', error);
  }
};

/**
 * Handles fullscreen change events
 * @param setIsFullscreen - Function to update fullscreen state
 * @param hasError - Whether there's an error state active
 */
export const handleFullscreenChange = (
  setIsFullscreen: (isFullscreen: boolean) => void,
  hasError: boolean
): void => {
  const isCurrentlyFullscreen = document.fullscreenElement !== null;
  setIsFullscreen(isCurrentlyFullscreen);

  // If user exited fullscreen, try to re-enter
  if (!isCurrentlyFullscreen && !hasError) {
    // Small delay to prevent immediate re-trigger
    setTimeout(() => {
      requestFullscreen(setIsFullscreen);
    }, 1000);
  }
};

/**
 * Sets up security event listeners
 * @param setIsFullscreen - Function to update fullscreen state
 * @param hasError - Whether there's an error state active
 * @param isInvalidDevice - Whether the device is invalid (mobile/tablet)
 * @returns Cleanup function
 */
export const setupSecurityEventListeners = (
  setIsFullscreen: (isFullscreen: boolean) => void,
  hasError: boolean,
  isInvalidDevice: boolean
): (() => void) => {
  // Don't set up event listeners if on mobile or tablet
  if (isInvalidDevice) return () => {};

  // Add keyboard event listener
  document.addEventListener('keydown', handleKeyDown);
  
  // Prevent context menu
  document.addEventListener(
    'contextmenu',
    (e) => {
      e.preventDefault();
      return false;
    },
    true
  );

  // Add fullscreen change event listener
  const fullscreenChangeHandler = () => handleFullscreenChange(setIsFullscreen, hasError);
  document.addEventListener('fullscreenchange', fullscreenChangeHandler);

  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('fullscreenchange', fullscreenChangeHandler);
  };
}; 