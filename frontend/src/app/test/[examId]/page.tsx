'use client';
import { BasicInfoForm } from '@/components/test/basic-info';
import ProctoredQuiz from '@/components/test/proctored-quiz';
import TestLoading from '@/components/test/loading/test-loading';
import TestWarning from '@/components/test/error/test-warning';
import { VideoRecordingScreen } from '@/components/test/video-recording-screen';
import { examApi } from '@/lib/api';
import { dataURLtoBlob } from '@/lib/utils';
import {
  BROWSER_KEY,
  PROHIBITED_COMBINATIONS,
  PROHIBITED_KEYS,
  QUIZ_CONFIG,
  SNAPSHOT,
} from '@/shared/constants/data';
import { useExamStore } from '@/store/examStore';
import { EXAM_STEP } from '@/types/exam.types';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { examEndpoint } from '@/lib/endpoint';
import ScreenShareErrorModal from '@/components/test/screen-share-error';
import FirefoxScreenSharePrompt from '@/components/test/firefox-screen-share-model';
const MIN_WIDTH = 1920;
const MIN_HEIGHT = 1080;

const QuizPage = () => {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
  const [showScreenShareErrorModal, setShowScreenShareErrorModal] = useState(false);

  const screenStream = useRef<MediaStream | null>(null);
  const screenSnapshotRef = useRef<HTMLVideoElement | null>(null);
  const cameraSnapshotRef = useRef<HTMLVideoElement | null>(null);
  const cameraCanvas = useRef<HTMLCanvasElement | null>(null);
  const screenCanvas = useRef<HTMLCanvasElement | null>(null);
  const interval = useRef<NodeJS.Timeout | null>(null);
  const [permission, setPermission] = useState<{ camera: boolean; screen: boolean }>({
    camera: true,
    screen: true,
  });

  const handleKeyDown = (e: KeyboardEvent) => {
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

      if (!data.success) {
        setError(data.message || 'Access denied. Invalid or expired access code.');
        return;
      }
      if (data.data.exam.status == 'completed') {
        router.push('/thank-you');
        return;
      }

      const videoLink =
        data.data?.answers?.find(
          (a: { question_name: string }) => a.question_name === 'introduction'
        )?.user_answer[0] || null;
      setVideoLink(videoLink);
      setCandidate(data.data);
      setExam(data.data.exam);
      setLoading(false);
      setError(null);
      return true;
    } catch (err) {
      setLoading(false);

      console.error('Error fetching candidate:', err);
      setError('Failed to fetch candidate data');
      screenStream.current?.getTracks().forEach((track) => {
        track.stop();
      });
      cameraStreamRef?.getTracks().forEach((track) => {
        track.stop();
      });
      throw new Error('Failed to fetch candidate data');
    }
  };

  const handleRecordingComplete = () => {
    setCurrentStep(EXAM_STEP.QUIZ);
  };

  const isFirefox = () => {
    return typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') !== -1;
  };

  const getBrowser = () => {
    const userAgent = navigator.userAgent;
    if (/Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor)) return 'chrome';
    if (/Firefox/.test(userAgent)) return 'firefox';
    if (/Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor)) return 'safari';
    return 'unknown';
  };

  const validateEntireScreenShare = () => {
    const track = screenStream.current?.getVideoTracks()[0];
    if (!track) return false;

    const settings = track.getSettings();
    console.log('Screen share settings:', settings);
    const { width = 0, height = 0 } = settings;

    // You can log for debugging
    console.log('Screen share resolution:', width, height);

    const isLikelyFullScreen = width >= MIN_WIDTH && height >= MIN_HEIGHT;
    return isLikelyFullScreen;
  };
  const startScreenRecording = async () => {
    try {
      // For Firefox, we need user interaction to trigger the screen sharing dialog
      if (isFirefox() && !screenStream.current) {
        setShowFirefoxScreenSharePrompt(true);
        return;
      }

      // Different approach based on browser
      if (getBrowser() === 'firefox') {
        console.log('Firefox detected, requesting screen sharing');
        screenStream.current = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
      } else {
        screenStream.current = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: 'monitor',
          },
          audio: false,
        });
      }

      setPermission((prv) => ({ ...prv, screen: true }));
      const track = screenStream.current.getVideoTracks()[0];
      const settings = track.getSettings();
      track.onended = () => {
        stopRecording();
        setPermission((prv) => ({ ...prv, screen: false }));
      };

      if (settings.displaySurface === 'monitor' || !settings.displaySurface) {
        setPermission((prv) => ({ ...prv, screen: true }));
      } else {
        setPermission((prv) => ({ ...prv, screen: false }));
        screenStream.current.getTracks().forEach((track) => track.stop());
        return;
      }

      if (screenSnapshotRef.current) {
        screenSnapshotRef.current.srcObject = screenStream.current;
        await screenSnapshotRef.current.play();
      }

      setShowFirefoxScreenSharePrompt(false);
    } catch (error) {
      console.log('Screen sharing error:', error);
      setPermission((prv) => ({ ...prv, screen: false }));
    }
  };

  const handleFirefoxScreenShare = async () => {
    try {
      console.log('Firefox share button clicked');
      // We need to call getDisplayMedia directly in the event handler for Firefox
      if (getBrowser() === 'firefox') {
        screenStream.current = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        const isFullScreen = validateEntireScreenShare();
        if (!isFullScreen) {
          // Stop tracks if not entire screen
          screenStream.current.getTracks().forEach((track) => track.stop());
          setPermission((prev) => ({ ...prev, screen: false }));

          // Show error modal instead of toast
          setShowScreenShareErrorModal(true);
          return;
        }
        setPermission((prv) => ({ ...prv, screen: true }));
        const track = screenStream.current.getVideoTracks()[0];
        track.onended = () => {
          stopRecording();
          setPermission((prv) => ({ ...prv, screen: false }));
        };

        if (screenSnapshotRef.current) {
          screenSnapshotRef.current.srcObject = screenStream.current;
          await screenSnapshotRef.current.play();
        }

        setShowFirefoxScreenSharePrompt(false);
      } else {
        startScreenRecording();
      }
    } catch (error) {
      console.log('Firefox screen share error:', error);
      setPermission((prv) => ({ ...prv, screen: false }));
    }
  };

  const startCamera = async () => {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const videoTrack = cameraStream.getVideoTracks()[0];
      videoTrack.onended = () => {
        setPermission((prv) => ({ ...prv, camera: false }));
      };
      setCameraStream(cameraStream);

      setPermission((prv) => ({ ...prv, camera: true }));

      if (cameraSnapshotRef.current) {
        cameraSnapshotRef.current.srcObject = cameraStream;
        cameraSnapshotRef.current.muted = true; // Mute the camera stream to avoid feedback
        await cameraSnapshotRef.current.play();
      }
    } catch (error) {
      console.log(error);

      setError('Failed to start camera');

      setPermission((prv) => ({ ...prv, camera: false }));
    }
  };

  const takeScreenshot = async (ref: HTMLVideoElement, canvas: HTMLCanvasElement, type: string) => {
    if (!ref || !canvas) return;

    canvas.width = ref.videoWidth;
    canvas.height = ref.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx?.drawImage(ref, 0, 0, canvas.width, canvas.height);
    const imageDataURL = canvas.toDataURL('image/jpeg', 0.8);
    const blob = dataURLtoBlob(imageDataURL);

    const formData = new FormData();
    formData.append('file', blob);
    formData.append('timestamp', Date.now().toString());

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      await examApi.post(
        `${examEndpoint.CANDIDATE_EXAM}/${params.examId}/snapshot?fileType=${type}`,
        formData,
        code as string
      );
    } catch (error) {
      console.error('Error taking screenshot:', error);
    }
  };

  const stopRecording = async () => {
    screenStream.current?.getTracks().forEach((track) => {
      track.stop();
    });
    cameraStreamRef?.getTracks().forEach((track) => {
      track.stop();
    });
  };

  const requestFullscreen = () => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
          .then(() => {
            console.log('Entered fullscreen mode');
            setIsFullscreen(true);
          })
          .catch(err => {
            console.error('Error attempting to enable fullscreen:', err);
          });
      } else {
        console.log('Fullscreen API not supported');
      }
    } catch (error) {
      console.error('Error requesting fullscreen:', error);
    }
  };

  const handleFullscreenChange = () => {
    const isCurrentlyFullscreen = document.fullscreenElement !== null;
    setIsFullscreen(isCurrentlyFullscreen);
    
    // If user exited fullscreen, try to re-enter
    if (!isCurrentlyFullscreen && !error) {
      // Small delay to prevent immediate re-trigger
      setTimeout(() => {
        requestFullscreen();
      }, 1000);
    }
  };

  const init = async () => {
    try {
      const success = await fetchCandidate();
      if (!success) return;
      await startCamera();

      if (!isFirefox()) {
        await startScreenRecording();
      } else {
        setShowFirefoxScreenSharePrompt(true);
      }

      takeScreenshot(
        cameraSnapshotRef.current as HTMLVideoElement,
        cameraCanvas.current as HTMLCanvasElement,
        SNAPSHOT.camera
      );

      if (permission.screen) {
        takeScreenshot(
          screenSnapshotRef.current as HTMLVideoElement,
          screenCanvas.current as HTMLCanvasElement,
          SNAPSHOT.screenshot
        );
      }

      interval.current = setInterval(() => {
        const randomDelayMsScreen = Math.floor(Math.random() * 61) * 1000;
        const randomDelayMsCamera = Math.floor(Math.random() * 61) * 1000;
        setTimeout(() => {
          if (
            screenSnapshotRef.current !== null &&
            screenCanvas.current !== null &&
            permission.screen
          ) {
            takeScreenshot(
              screenSnapshotRef.current as HTMLVideoElement,
              screenCanvas.current as HTMLCanvasElement,
              SNAPSHOT.screenshot
            );
          }
        }, randomDelayMsScreen);
        setTimeout(() => {
          if (
            cameraSnapshotRef.current !== null &&
            cameraCanvas.current !== null &&
            permission.camera
          ) {
            takeScreenshot(
              cameraSnapshotRef.current as HTMLVideoElement,
              cameraCanvas.current as HTMLCanvasElement,
              SNAPSHOT.camera
            );
          }
        }, randomDelayMsCamera);
      }, QUIZ_CONFIG.screenshotInterval);
    } catch (error) {
      console.log(error);
    }
  };

  //======================================= Important for screenshots ===================================================
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener(
      'contextmenu',
      (e) => {
        e.preventDefault();
        return false;
      },
      true
    );
    
    // Add fullscreen change event listener
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Request fullscreen when component mounts
    if (typeof window !== 'undefined') {
      // Small delay to ensure the page is fully loaded
      setTimeout(() => {
        requestFullscreen();
      }, 1000);
    }
    
    init();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      interval.current && clearInterval(interval.current);
      stopRecording();
    };
  }, []);

  // Add a reminder for fullscreen if user exits
  useEffect(() => {
    if (!isFullscreen && !loading && !error) {
      const timer = setTimeout(() => {
        requestFullscreen();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isFullscreen, loading, error]);

  return (
    <div className="w-screen min-h-screen bg-gray-50">
      {!isFullscreen && !loading && !error && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white py-2 px-4 text-center z-50 flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-5 h-5 mr-2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
          Fullscreen mode is required for this exam. 
          <button 
            onClick={requestFullscreen}
            className="ml-4 bg-white text-red-600 px-3 py-1 rounded-md font-medium hover:bg-gray-100 transition-colors"
          >
            Enter Fullscreen
          </button>
        </div>
      )}
      
      {showFirefoxScreenSharePrompt && (
        <FirefoxScreenSharePrompt handleFirefoxScreenShare={handleFirefoxScreenShare} />
      )}
      {showScreenShareErrorModal && (
        <ScreenShareErrorModal
          setShowScreenShareErrorModal={setShowScreenShareErrorModal}
          setShowFirefoxScreenSharePrompt={setShowFirefoxScreenSharePrompt}
        />
      )}

      {error ? (
        <TestWarning
          text={
            <ul>
              <li>{error}</li>
            </ul>
          }
          title="Access Denied"
        />
      ) : loading || !candidate ? (
        <TestLoading />
      ) : !permission.camera || (!permission.screen && !showFirefoxScreenSharePrompt) ? (
        <TestWarning
          text={
            <ul>
              {!permission.screen && !showFirefoxScreenSharePrompt && (
                <li>
                  In the screen sharing popup, select <strong>Entire Screen</strong> and then click{' '}
                  <strong>Share</strong>. You can refresh this page.{' '}
                </li>
              )}
              {!permission.camera && <li>Make sure camera is on</li>}
            </ul>
          }
          title="Permissions"
        />
      ) : (
        <>
          {current_step === EXAM_STEP.BASIC_INFO && <BasicInfoForm />}
          {current_step === EXAM_STEP.VIDEO_RECORDING && (
            <VideoRecordingScreen
              onRecordingComplete={handleRecordingComplete}
              videoLink={videoLink || undefined}
            />
          )}
          {current_step === EXAM_STEP.QUIZ && candidate && <ProctoredQuiz />}
        </>
      )}

      <video ref={screenSnapshotRef} className="hidden"></video>
      <video ref={cameraSnapshotRef} className="hidden"></video>
      <canvas ref={cameraCanvas} className="hidden"></canvas>
      <canvas ref={screenCanvas} className="hidden"></canvas>
    </div>
  );
};

export default QuizPage;
