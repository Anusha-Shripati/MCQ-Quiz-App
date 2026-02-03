'use client';
// React and Next.js
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

// Third-party UI
import { Button } from '@/components/ui/form/button';

// Internal components
import { BasicInfoForm } from '@/components/test/basic-info';
import CameraRetry from '@/components/test/camera-retry';
import CheckValidDevice from '@/components/test/check-valid-device';
import TestWarning from '@/components/test/error/test-warning';
import ExamExpired from '@/components/test/exam-expired';
import FirefoxScreenSharePrompt from '@/components/test/firefox-screen-share-model';
import TestLoading from '@/components/test/loading/test-loading';
import MultipleScreensWarning from '@/components/test/multiple-screens-warning';
import ProctoredQuiz from '@/components/test/proctored-quiz';
import SafariScreenSharePrompt from '@/components/test/safari-screen-share-modal';
import SafariWindowShareError from '@/components/test/safari-window-share-error';
import ScreenShareErrorModal from '@/components/test/screen-share-error';
import { VideoRecordingScreen } from '@/components/test/video-recording-screen';

// Hooks and Stores
import useDeviceDetection from '@/hooks/useDeviceDetection';
import { useExamStore } from '@/store/examStore';

// API and Endpoints
import { examApi } from '@/lib/api';
import { examEndpoint } from '@/lib/endpoint';

// Constants and Types
import { SNAPSHOT } from '@/shared/constants/data';
import { EXAM_STEP } from '@/types/exam.types';

// Utility functions
import {
  startCamera,
  stopMediaStreams,
  takeSynchronizedScreenshots,
} from '@/components/test/testUtils/cameraUtils';
import {
  detectMultipleScreens,
  getBrowser,
  isFirefox,
  isSafari,
  setupScreenChangeListener,
} from '@/components/test/testUtils/screenDetection';
import {
  handleFirefoxScreenShare,
  handleSafariScreenShare,
  startScreenRecording,
} from '@/components/test/testUtils/screenShare';
import {
  requestFullscreen,
  setupSecurityEventListeners,
} from '@/components/test/testUtils/securityUtils';
import {
  initializeFaceTracking,
  FaceTrackingStatus,
  startFaceTracking,
} from '@/components/test/testUtils/faceTracking';
import { FaceViolationPopup } from '@/components/test/face-violation-popup';
import { FaceTrackingOverlay } from '@/components/test/face-tracking-overlay';
import { isAxiosError } from 'axios';
import ExamNotStarted from './exam-not-started';

const TestPage = () => {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasMultipleScreens, setHasMultipleScreens] = useState(false);
  const { isMobile, isTablet } = useDeviceDetection();
  const isInvalidDevice = isMobile || isTablet;
  const {
    current_step,
    setCurrentStep,
    setAccessCode,
    setCandidate,
    candidate,
    setExam,
    setCameraStream,
    cameraStreamRef,
  } = useExamStore();
  const router = useRouter();

  const [videoLink, setVideoLink] = useState<string | null>(null);
  const [showFirefoxScreenSharePrompt, setShowFirefoxScreenSharePrompt] = useState(false);
  const [showSafariScreenSharePrompt, setShowSafariScreenSharePrompt] = useState(false);
  const [showScreenShareErrorModal, setShowScreenShareErrorModal] = useState(false);
  const [showCameraRetry, setShowCameraRetry] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showSafariWindowShareError, setShowSafariWindowShareError] = useState(false);
  const [examExpired, setExamExpired] = useState(false);
  const [examNotStarted, setExamNotStarted] = useState(false);
  const [examStartDate, setExamStartDate] = useState<Date | null>(null);
  const [permission, setPermission] = useState<{ camera: boolean; screen: boolean }>({
    camera: true,
    screen: true,
  });
  const [faceViolationPopup, setFaceViolationPopup] = useState<{
    isOpen: boolean;
    details: {
      timestamp: number;
      duration: number;
      headPose: { yaw: number; pitch: number; roll: number };
      violationType: 'lookAway' | 'noFaceDetected' | 'multipleFaces';
      faceCount?: number;
      thresholds: { yawThreshold: number; pitchThreshold: number; rollThreshold: number };
    } | null;
  }>({ isOpen: false, details: null });
  const [faceTrackingStatus, setFaceTrackingStatus] = useState<FaceTrackingStatus | null>(null);

  const screenStream = useRef<MediaStream | null>(null);
  const screenSnapshotRef = useRef<HTMLVideoElement | null>(null);
  const cameraSnapshotRef = useRef<HTMLVideoElement | null>(null);
  const cameraCanvas = useRef<HTMLCanvasElement | null>(null);
  const screenCanvas = useRef<HTMLCanvasElement | null>(null);
  const interval = useRef<NodeJS.Timeout | null>(null);
  const faceTrackingCleanup = useRef<(() => void) | null>(null);

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (!code) {
        throw new Error('Access code not found');
      }

      setAccessCode(code);

      const data = await examApi.get(examEndpoint.CANDIDATE_EXAM, code);

      const isExpired = data.data.status == 'expired' || data.data.exam.status == 'expired';
      setExamExpired(isExpired);
      if (isExpired) {
        return false;
      }

      if (!data.success) {
        setError(data.message || 'Access denied. Invalid or expired access code.');
        return false;
      }

      if (data.data.exam.status === 'completed') {
        router.push('/thank-you');
        return false;
      }

      const videoLink =
        data.data?.answers?.find(
          (a: { question_name: string }) => a.question_name === 'introduction'
        )?.user_answer[0] || null;

      setVideoLink(videoLink ? process.env.NEXT_PUBLIC_IMGAE_PREFIX + videoLink : videoLink);
      setCandidate(data.data);
      setExam(data.data.exam);

      const startDate = data.data?.exam?.start_time ? new Date(data.data.exam.start_time) : null;
      setExamStartDate(startDate);

      if (startDate && new Date() < startDate) {
        setExamNotStarted(true);
        setLoading(false);
        return false;
      }
      setLoading(false);
      setError(null);
      return true;
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err?.response?.data?.data?.status;
        setExamExpired(status == 'expired');
        if (status == 'expired') {
          return false;
        } else if (status == 'completed') {
          setError('Exam already compteted');
          return false;
        }
      }
      setLoading(false);
      console.error('Error fetching candidate:', err);
      setError('Failed to fetch candidate data');
      stopMediaStreams(screenStream.current, cameraStreamRef);
      return false;
    }
  };

  /**
   * Handle face violation detection
   */
  const handleFaceViolation = (violationDetails: {
    timestamp: number;
    duration: number;
    headPose: { yaw: number; pitch: number; roll: number };
    violationType: 'lookAway' | 'noFaceDetected' | 'multipleFaces';
    faceCount?: number;
    thresholds: { yawThreshold: number; pitchThreshold: number; rollThreshold: number };
  }) => {
    setFaceViolationPopup({
      isOpen: true,
      details: violationDetails
    });
  };

  /**
   * Handles completion of the video recording step
   */
  const handleRecordingComplete = () => {
    setCurrentStep(EXAM_STEP.QUIZ);
  };

  /**
   * Cleans up the screen stream completely
   * This is essential for retrying screen sharing
   */
  const cleanupScreenStream = () => {
    if (screenStream.current) {
      screenStream.current.getTracks().forEach((track) => {
        track.stop();
      });
      screenStream.current = null;
    }

    // Also clear the video element reference to ensure full reset
    if (screenSnapshotRef.current) {
      screenSnapshotRef.current.srcObject = null;
    }

    // Reset permissions state for screen
    setPermission((prev) => ({ ...prev, screen: false }));
  };

  /**
   * Handles Firefox-specific screen sharing
   */
  const handleFirefoxScreenShareClick = async () => {
    // Clean up any existing streams first
    cleanupScreenStream();

    await handleFirefoxScreenShare(
      screenStream,
      screenSnapshotRef,
      setPermission,
      setShowFirefoxScreenSharePrompt,
      setShowScreenShareErrorModal
    );
  };

  /**
   * Handles Safari-specific screen sharing
   */
  const handleSafariScreenShareClick = async () => {
    try {
      // Reset error states
      setShowScreenShareErrorModal(false);
      setShowSafariWindowShareError(false);

      // Clean up any existing streams first
      cleanupScreenStream();

      const success = await handleSafariScreenShare(
        screenStream,
        screenSnapshotRef,
        setPermission,
        setShowSafariScreenSharePrompt
      );

      // Special case for Safari: If screen sharing failed, check if it's due to window selection
      if (!success && screenStream.current) {
        const track = screenStream.current.getVideoTracks()[0];
        if (track) {
          const settings = track.getSettings();

          // Check for displaySurface property (if available)
          const { displaySurface = '' } = settings;
          if (
            displaySurface === 'window' ||
            displaySurface === 'browser' ||
            displaySurface === 'application'
          ) {
            setShowSafariWindowShareError(true);
            return;
          }

          // Otherwise, use heuristics to detect window sharing
          const { width = 0 } = settings;
          if (width > 0 && width < 1200) {
            setShowSafariWindowShareError(true);
            return;
          }
        }

        // Default to generic error if no specific condition was met
        setShowScreenShareErrorModal(true);
      }
    } catch (error) {
      console.error('Error in Safari screen share click handler:', error);
      setShowScreenShareErrorModal(true);
    } finally {
      // Clean up the tracks if we're showing an error
      if (showSafariWindowShareError || showScreenShareErrorModal) {
        cleanupScreenStream();
      }
    }
  };

  /**
   * Initializes camera with error handling
   */
  const initCamera = async () => {
    const success = await startCamera(
      setCameraStream,
      setPermission,
      setCameraError,
      cameraStreamRef,
      cameraSnapshotRef,
      0,
      3
    );

    if (!success) {
      setShowCameraRetry(true);
    }

    return success;
  };

  /**
   * Sets up screenshot interval for proctoring
   * Takes 2 random screenshots per minute: one in first 30s, one in second 30s
   * Random times are regenerated each minute
   */
  const setupScreenshotInterval = () => {
    // Get access code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code') || '';

    // Store timeout IDs to clear them later
    const timeouts: NodeJS.Timeout[] = [];

    /**
     * Schedules both screenshots for the current minute with new random times
     */
    const scheduleMinuteScreenshots = () => {
      // Clear any existing timeouts
      timeouts.forEach(timeout => clearTimeout(timeout));
      timeouts.length = 0;

      const takeIfReady = () => {
        if (
          cameraSnapshotRef.current &&
          cameraCanvas.current &&
          screenSnapshotRef.current &&
          screenCanvas.current &&
          permission.camera &&
          permission.screen
        ) {
          takeSynchronizedScreenshots(
            cameraSnapshotRef.current,
            cameraCanvas.current,
            screenSnapshotRef.current,
            screenCanvas.current,
            examApi,
            examEndpoint,
            params.examId as string,
            code,
            SNAPSHOT.camera,
            SNAPSHOT.screenshot
          );
        }
      };

      // Generate random delays
      const delays = [
        Math.floor(Math.random() * 30000),                // 0–30s
        30000 + Math.floor(Math.random() * 30000),        // 30–60s
      ];

      delays.forEach(delay => {
        const timeout = setTimeout(takeIfReady, delay);
        timeouts.push(timeout);
      });
    };


    // Take initial screenshot immediately
    if (
      cameraSnapshotRef.current &&
      cameraCanvas.current &&
      screenSnapshotRef.current &&
      screenCanvas.current &&
      permission.camera &&
      permission.screen
    ) {
      takeSynchronizedScreenshots(
        cameraSnapshotRef.current,
        cameraCanvas.current,
        screenSnapshotRef.current,
        screenCanvas.current,
        examApi,
        examEndpoint,
        params.examId as string,
        code,
        SNAPSHOT.camera,
        SNAPSHOT.screenshot
      );
    }

    // Schedule first minute's screenshots
    scheduleMinuteScreenshots();

    // Set up interval to schedule new random screenshots every minute
    interval.current = setInterval(() => {
      scheduleMinuteScreenshots();
    }, 60000); // Every 60 seconds

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  };

  /**
   * Sets up face tracking to detect when candidate looks away
   */
  const setupFaceTracking = async () => {
    // Get access code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code') || '';

    // Wait for camera video to be ready
    if (!cameraSnapshotRef.current) {
      console.error('Camera video element not available');
      return;
    }

    // Wait for video to be playing
    const waitForVideo = new Promise<void>((resolve) => {
      const checkVideo = () => {
        if (
          cameraSnapshotRef.current &&
          cameraSnapshotRef.current.readyState >= 2 &&
          cameraSnapshotRef.current.videoWidth > 0
        ) {
          resolve();
        } else {
          setTimeout(checkVideo, 100);
        }
      };
      checkVideo();
    });

    await waitForVideo;
    // Initialize face tracking models
    const initialized = await initializeFaceTracking();
    if (!initialized) {
      console.error('Failed to initialize face tracking');
      return;
    }

    // Start face tracking
    if (cameraSnapshotRef.current) {
      const cleanup = startFaceTracking(
        cameraSnapshotRef.current,
        cameraSnapshotRef.current,
        cameraCanvas.current,
        screenSnapshotRef.current,
        screenCanvas.current,
        examApi,
        examEndpoint,
        params.examId as string,
        code,
        {
          checkInterval: 1000,
          lookAwayThreshold: 30, // Relaxed from 30
          lookAwayThresholdVertical: 25, // Relaxed from 20
          lookAwayDuration: 2000, // Relaxed from 1s to 2s
          onViolationDetected: handleFaceViolation,
          onTrackingUpdate: setFaceTrackingStatus,
        }
      );

      faceTrackingCleanup.current = cleanup;
      console.log('Face tracking started successfully');
    }
  };

  /**
   * Main initialization function
   */
  const init = async () => {
    try {
      // Request fullscreen automatically on init

      // Don't initialize if on mobile or tablet
      if (isInvalidDevice) return;

      // Check for multiple screens
      const hasMultiScreens = await detectMultipleScreens();
      setHasMultipleScreens(hasMultiScreens);
      if (hasMultiScreens) return;

      const candidateSuccess = await fetchCandidate();
      if (!candidateSuccess) return;

      const cameraSuccess = await initCamera();
      if (!cameraSuccess) return;

      // Detect browser type
      const browserType = getBrowser();

      const isSafariBrowser = isSafari();
      // Start screen recording based on browser type
      if (browserType === 'safari' || isSafariBrowser) {
        setShowSafariScreenSharePrompt(true);
      } else if (browserType === 'firefox' || isFirefox()) {
        setShowFirefoxScreenSharePrompt(true);
      } else {
        await startScreenRecording(
          screenStream,
          screenSnapshotRef,
          setPermission,
          setShowFirefoxScreenSharePrompt,
          setShowScreenShareErrorModal,
          setShowSafariScreenSharePrompt
        );
      }

      // Set up screenshot interval
      setupScreenshotInterval();

      // Set up face tracking for cheating detection (after a small delay to ensure camera is stable)
      setTimeout(() => {
        setupFaceTracking();
      }, 2000); // Wait 2 seconds for camera to stabilize
    } catch (error) {
      console.error('Initialization error:', error);
    }
  };

  /**
   * Checks for multiple screens and updates state
   */
  const checkMultipleScreens = async () => {
    const hasMultiScreens = await detectMultipleScreens();
    setHasMultipleScreens(hasMultiScreens);
    return hasMultiScreens;
  };

  const handleRetry = () => {
    window.location.reload();
    setTimeout(() => {
      setHasMultipleScreens(false);
      checkMultipleScreens();
    }, 500);
  };

  // Initial setup
  useEffect(() => {
    init();

    // Clean up function
    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
      if (faceTrackingCleanup.current) {
        faceTrackingCleanup.current();
      }
      stopMediaStreams(screenStream.current, cameraStreamRef);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInvalidDevice]);

  // Set up security event listeners
  useEffect(() => {
    const cleanup = setupSecurityEventListeners(setIsFullscreen, !!error, isInvalidDevice);

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, isInvalidDevice]);

  // Set up continuous screen monitoring to detect when monitors are plugged in during exam
  useEffect(() => {
    // Only set up monitoring if exam has started and user is not on invalid device
    if (isInvalidDevice || loading || error || examNotStarted || examExpired) {
      return;
    }

    // Set up listener to detect screen changes
    const cleanup = setupScreenChangeListener(() => {
      console.log('Multiple screens detected during exam');
      setHasMultipleScreens(true);
    });

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInvalidDevice, loading, error, examNotStarted, examExpired]);

  // Render for invalid devices (mobile/tablet)
  if (isInvalidDevice) {
    return (
      <div className="w-screen min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
        <CheckValidDevice isMobile={isMobile} isTablet={isTablet} />
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen bg-gray-50">
      {/* Fullscreen warning banner */}
      {!isFullscreen && !loading && !error && !examNotStarted && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white py-2 px-4 text-center z-50 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 mr-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
            />
          </svg>
          Fullscreen mode is required for this exam.
          <Button
            onClick={() => requestFullscreen(setIsFullscreen)}
            className="ml-4 bg-white text-red-600 px-3 py-1 rounded-md font-semibold hover:bg-gray-100 transition-colors"
          >
            Enter Fullscreen
          </Button>
        </div>
      )}

      {/* Firefox screen share prompt */}
      {showFirefoxScreenSharePrompt && !hasMultipleScreens && (
        <FirefoxScreenSharePrompt handleFirefoxScreenShare={handleFirefoxScreenShareClick} />
      )}

      {/* Safari screen share prompt */}
      {showSafariScreenSharePrompt && !hasMultipleScreens && !showSafariWindowShareError && (
        <SafariScreenSharePrompt
          handleSafariScreenShare={handleSafariScreenShareClick}
          cleanupScreenStream={cleanupScreenStream}
        />
      )}

      {/* Safari window share error */}
      {showSafariWindowShareError && !hasMultipleScreens && (
        <SafariWindowShareError
          setShowSafariWindowShareError={setShowSafariWindowShareError}
          setShowSafariScreenSharePrompt={setShowSafariScreenSharePrompt}
          cleanupScreenStream={cleanupScreenStream}
        />
      )}

      {/* Screen share error modal */}
      {showScreenShareErrorModal && !hasMultipleScreens && !showSafariWindowShareError && (
        <ScreenShareErrorModal
          setShowScreenShareErrorModal={setShowScreenShareErrorModal}
          setShowFirefoxScreenSharePrompt={setShowFirefoxScreenSharePrompt}
          setShowSafariScreenSharePrompt={setShowSafariScreenSharePrompt}
          cleanupScreenStream={cleanupScreenStream}
        />
      )}

      {/* Multiple screens warning */}
      {hasMultipleScreens && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <MultipleScreensWarning onRetry={handleRetry} isFirefox={isFirefox()} />
        </div>
      )}

      {/* Camera retry UI */}
      {showCameraRetry && (
        <CameraRetry
          error={cameraError}
          onRetry={() => {
            setShowCameraRetry(false);
            setCameraError(null);
            initCamera();
          }}
        />
      )}

      {/* Main content based on state */}
      {error ? (
        <TestWarning
          text={
            <ul>
              <li>{error}</li>
            </ul>
          }
          title="Access Denied"
        />
      ) : examExpired ? (
        <ExamExpired contactEmail="support@yourexamdomain.com" />
      ) : examNotStarted ? (
        <ExamNotStarted
          contactEmail="support@yourexamdomain.com"
          startTime={examStartDate ? examStartDate.toLocaleString() : undefined}
        />
      ) : loading || !candidate ? (
        <TestLoading />
      ) : !permission.camera ||
        (!permission.screen && !showFirefoxScreenSharePrompt && !showSafariScreenSharePrompt) ? (
        <TestWarning
          text={
            <ul>
              {!permission.screen &&
                !showFirefoxScreenSharePrompt &&
                !showSafariScreenSharePrompt && (
                  <>
                    <li>
                      In the screen sharing popup, select <strong>Entire Screen</strong> and then
                      click <strong>Share</strong>.
                    </li>
                  </>
                )}
              {!permission.camera && <li>Make sure camera is on</li>}
            </ul>
          }
          title="Permissions"
          showReloadButton={true}
        />
      ) : (
        <>
          {current_step === EXAM_STEP.BASIC_INFO && (
            <BasicInfoForm setIsFullscreen={setIsFullscreen} />
          )}
          {current_step === EXAM_STEP.VIDEO_RECORDING && (
            <VideoRecordingScreen
              onRecordingComplete={handleRecordingComplete}
              videoLink={videoLink || undefined}
            />
          )}
          {current_step === EXAM_STEP.QUIZ && candidate && <ProctoredQuiz />}
        </>
      )}

      {current_step === EXAM_STEP.QUIZ && (
        <FaceTrackingOverlay stream={cameraStreamRef} tracking={faceTrackingStatus} />
      )}

      {/* Hidden elements for video capture */}
      <video ref={screenSnapshotRef} className="hidden"></video>
      <video ref={cameraSnapshotRef} className="hidden"></video>
      <canvas ref={cameraCanvas} className="hidden"></canvas>
      <canvas ref={screenCanvas} className="hidden"></canvas>

      {/* Face Violation Popup */}
      {faceViolationPopup.details && (
        <FaceViolationPopup
          isOpen={faceViolationPopup.isOpen}
          onClose={() => setFaceViolationPopup({ isOpen: false, details: null })}
          violationDetails={faceViolationPopup.details}
        />
      )}
    </div>
  );
};

export default TestPage;
