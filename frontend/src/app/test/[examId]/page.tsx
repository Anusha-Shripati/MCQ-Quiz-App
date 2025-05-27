'use client';
import { BasicInfoForm } from '@/components/test/BasicInfo';
import ProctoredQuiz from '@/components/test/ProctoredQuiz';
import TestError from '@/components/test/error/TestError';
import TestLoading from '@/components/test/loading/TestLoading';
import TestWarning from '@/components/test/error/TestWarning';
import { VideoRecordingScreen } from '@/components/test/VideoRecordingScreen';
import { examApi } from '@/lib/api';
import { dataURLtoBlob } from '@/lib/utils';
import { BROWSER_KEY, PROHIBITED_COMBINATIONS, PROHIBITED_KEYS, SNAPSHOT } from '@/shared/constants/data';
import { useExamStore } from '@/store/examStore';
import { EXAM_STEP } from '@/types/exam.types';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';


const QuizPage = () => {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { current_step, setCurrentStep, setAccessCode, setCandidate, candidate, setExam, setCameraStream, cameraStreamRef } = useExamStore();
  const router = useRouter();

  const [videoLink, setVideoLink] = useState<string | null>(null);

  const screenStrean = useRef<MediaStream | null>(null);
  const screenSnapshotRef = useRef<HTMLVideoElement | null>(null)
  const cameraSnapshotRef = useRef<HTMLVideoElement | null>(null)
  const cameraCanvas = useRef<HTMLCanvasElement | null>(null)
  const screenCanvas = useRef<HTMLCanvasElement | null>(null)
  const interval = useRef<NodeJS.Timeout | null>(null)
  const [permission, setPermission] = useState<{ camera: boolean, screen: boolean }>({ camera: true, screen: true })

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
    if (
      (e.ctrlKey || e.metaKey) && BROWSER_KEY.includes(e.key)) {
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

      const data = await examApi.get(`/candidate-exam`, code);

      if (!data.success) {
        setError(data.message || 'Access denied. Invalid or expired access code.');
        return;
      }
      if (data.data.exam.status == 'completed') {
        router.push('/thank-you');
        return;
      }
      
      const videoLink = data.data?.answers?.find((a: { question_name: string }) => a.question_name === 'introduction')?.user_answer[0] || null;
      setVideoLink(videoLink);
      setCandidate(data.data);
      setExam(data.data.exam);
      setLoading(false);
      setError(null);
      return true
    } catch (err) {
      setLoading(false);

      console.error('Error fetching candidate:', err);
      setError('Failed to fetch candidate data');
      screenStrean.current?.getTracks().forEach((track) => {
        track.stop()
      })
      cameraStreamRef?.getTracks().forEach((track) => {
        track.stop()
      })
      throw new Error('Failed to fetch candidate data')
    }
  };

  const handleRecordingComplete = () => {
    setCurrentStep(EXAM_STEP.QUIZ);
  };

  const startScreenRecording = async () => {
    try {

      screenStrean.current = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
        },
        audio: false
      })
      setPermission((prv) => ({ ...prv, screen: true }))
      const track = screenStrean.current.getVideoTracks()[0];
      const settings = track.getSettings();
      track.onended = () => {
        stopRecording()
        setPermission((prv) => ({ ...prv, screen: false }))
      }
      console.log(settings.displaySurface, 'displaySurface');
      
      if (settings.displaySurface == 'monitor') {
        setPermission((prv) => ({ ...prv, screen: true }))
      } else {
        setPermission((prv) => ({ ...prv, screen: false }))
        screenStrean.current.getTracks().forEach((track) => track.stop());
        return;
      }
      if (screenSnapshotRef.current) {
        screenSnapshotRef.current.srcObject = screenStrean.current;
        await screenSnapshotRef.current.play();
      }
    } catch (error) {
      setPermission((prv) => ({ ...prv, screen: false }))
    }
  }
  const startCamera = async () => {
    try {
      let cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      const videoTrack = cameraStream.getVideoTracks()[0]
      videoTrack.onended = () => {
        setPermission((prv) => ({ ...prv, camera: false }))
      }
      setCameraStream(cameraStream);

      setPermission((prv) => ({ ...prv, camera: true }))

      if (cameraSnapshotRef.current) {
        cameraSnapshotRef.current.srcObject = cameraStream;
        await cameraSnapshotRef.current.play();
      }

    } catch (error) {
      setPermission((prv) => ({ ...prv, camera: false }))
    }
  }

  const takeScreenshot = async (ref: HTMLVideoElement, canvas: HTMLCanvasElement, type: string) => {
    if (!ref || !canvas) return

    canvas.width = ref.videoWidth;
    canvas.height = ref.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx?.drawImage(ref, 0, 0, canvas.width, canvas.height);
    const imageDataURL = canvas.toDataURL('image/jpeg', 0.8);
    const blob = dataURLtoBlob(imageDataURL)

    const formData = new FormData()
    formData.append('file', blob)
    formData.append('timestamp', Date.now().toString())

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      await examApi.post(`/candidate-exam/${params.examId}/snapshot?fileType=${type}`, formData, code as string)
    } catch (error) {
      // console.log(error);
    }
  }

  const stopRecording = async () => {
    screenStrean.current?.getTracks().forEach((track) => {
      track.stop()
    })
    cameraStreamRef?.getTracks().forEach((track) => {
      track.stop()
    })
  }

  const init = async () => {
    try {
      const success =await fetchCandidate();
      if(!success) return
      await Promise.allSettled([startScreenRecording(), startCamera()])
      const intervalTime = 60 * 1000
      interval.current = setInterval(() => {
        const randomDelayMsScreen = Math.floor(Math.random() * 61) * 1000;
        const randomDelayMsCamera = Math.floor(Math.random() * 61) * 1000;
        setTimeout(() => {
          if (screenSnapshotRef.current !== null && screenCanvas.current !== null && permission.screen) {
            takeScreenshot(screenSnapshotRef.current as HTMLVideoElement, screenCanvas.current as HTMLCanvasElement, SNAPSHOT.screenshot)
          }
        }, randomDelayMsScreen)
        setTimeout(() => {
          if (cameraSnapshotRef.current !== null && cameraCanvas.current !== null && permission.camera) {
            takeScreenshot(cameraSnapshotRef.current as HTMLVideoElement, cameraCanvas.current as HTMLCanvasElement, SNAPSHOT.camera)
          }
        }, randomDelayMsCamera)
      }, intervalTime)

    } catch (error) {

    }

  }

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
    init()

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      interval.current && clearInterval(interval.current)
      stopRecording()
    };
  }, []);
  return (
    <div className="w-screen min-h-screen bg-gray-50">
      {
        error ? <TestError errorTitle='Access Denied' accessError={error} />
          : loading || !candidate ? <TestLoading />
            : (!permission.camera || !permission.screen) ? <TestWarning text={
              <ul>
                {!permission.screen && <li>In the screen sharing popup, select <strong>"Entire Screen"</strong> and then click <strong>"Share"</strong>. You can refresh this page </li>}
                {!permission.camera && <li>Make sure camera is on</li>}
              </ul>
            } title='Permissions' />
              : <>
                {current_step === EXAM_STEP.BASIC_INFO && <BasicInfoForm />}
                {current_step === EXAM_STEP.VIDEO_RECORDING && (
                  <VideoRecordingScreen onRecordingComplete={handleRecordingComplete} videoLink={videoLink || undefined} />
                )}
                {current_step === EXAM_STEP.QUIZ && candidate && <ProctoredQuiz />}
              </>
      }

      <video ref={screenSnapshotRef} className='hidden'></video>
      <video ref={cameraSnapshotRef} className='hidden'></video>
      <canvas ref={cameraCanvas} className='hidden'></canvas>
      <canvas ref={screenCanvas} className='hidden'></canvas>
    </div>
  );
};

export default QuizPage;
