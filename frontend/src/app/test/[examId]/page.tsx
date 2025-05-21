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
import useSWR from 'swr';


const QuizPage = () => {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { current_step, setCurrentStep, setAccessCode, setCandidate,candidate,setExam,accessCode } = useExamStore();
  const router = useRouter();

  const [videoLink, setVideoLink] = useState<string | null>(null);

  const screenStrean = useRef<MediaStream | null>(null);
  const screenSnapshotRef = useRef<HTMLVideoElement|null>(null)
  const cameraSnapshotRef = useRef<HTMLVideoElement|null>(null)
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const interval = useRef<NodeJS.Timeout | null>(null)
  const [screenPermission,setScreenPermission] =useState(true)

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
  useEffect(() => {
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
        if(data.data.exam.status == 'completed'){
          router.push('/thank-you');
          return;
        }
        const videoLink = data.data?.answers?.find((a: { question_name: string }) => a.question_name === 'introduction')?.user_answer[0] || null;
        setVideoLink(videoLink);
        setCandidate(data.data);
        setExam(data.data.exam);

        setError(null);
      } catch (err) {
        console.error('Error fetching candidate:', err);
        setError('Failed to fetch candidate data');
      } finally {
        setLoading(false);
      }
    };

    if (params.examId) {
      fetchCandidate();
    }
  }, [params.examId]);

  const handleRecordingComplete = () => {
    setCurrentStep(EXAM_STEP.QUIZ);
  };

  const startRecording = async()=>{
    try {
      
      screenStrean.current = await navigator.mediaDevices.getDisplayMedia({
        video:true,
        audio:false
      })

      const track = screenStrean.current.getVideoTracks()[0];
      const settings = track.getSettings();
      track.onended=()=>{
        stopRecording()
        setScreenPermission(false)
      }
      if (settings.displaySurface !== 'monitor') {
        screenStrean.current.getTracks().forEach((track) => track.stop());
        setScreenPermission(false) 
        return;
      }
        setScreenPermission(true)
        if(screenSnapshotRef.current){
          screenSnapshotRef.current.srcObject = screenStrean.current;
          await screenSnapshotRef.current.play();
        }

      } catch (error) {
        console.log(error);
        setScreenPermission(false) 
      }
  }

  const takeScreenshot =async ()=>{
    if(!screenSnapshotRef.current || !canvas.current) return 
    
    canvas.current.width = screenSnapshotRef.current.videoWidth;
    canvas.current.height = screenSnapshotRef.current.videoHeight;

    const ctx = canvas.current.getContext('2d');
    ctx?.drawImage(screenSnapshotRef.current, 0, 0, canvas.current.width, canvas.current.height);
    const imageDataURL = canvas.current.toDataURL('image/jpeg', 0.8);
    const blob = dataURLtoBlob(imageDataURL)

    const formData = new FormData()
    formData.append('file',blob)
    formData.append('timestamp',Date.now().toString())
    formData.append('type',SNAPSHOT.screenshot)
    
    try { 
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      await examApi.post(`/candidate-exam/${params.examId}/snapshot`,formData,code as string)
    } catch (error) {
      console.log(error);
    }
  }
  
  const stopRecording = async()=>{
    screenStrean.current?.getTracks().forEach((track)=>{
      track.stop()
    })
  }

  const init=async ()=>{
    await startRecording();
    interval.current = setInterval(()=>{
      const randomDelayMs = Math.floor(Math.random() * 61) * 100;
      setTimeout(()=>{
        takeScreenshot()
      },randomDelayMs)
    },60*100)
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
    // init()

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // interval.current && clearInterval(interval.current)
      // stopRecording()
    };
  }, []);

  if (loading) {
    return (
      <TestLoading/>
    );
  }

  if (error) {
    return (
      <TestError errorTitle='Access Denied' accessError={error}/>
    );
  }
  if(!screenPermission){
    return <TestWarning text={<>In the screen sharing popup, select <strong>"Entire Screen"</strong> and then click <strong>"Share"</strong>. You can refresh this page </>} title='Entire Screen'/>
  }
  return (
    <div className="w-screen min-h-screen bg-gray-50">
      {current_step === EXAM_STEP.BASIC_INFO && <BasicInfoForm />}
      {current_step === EXAM_STEP.VIDEO_RECORDING && (
        <VideoRecordingScreen onRecordingComplete={handleRecordingComplete} videoLink={videoLink || undefined} />
      )}
      {current_step === EXAM_STEP.QUIZ && candidate && <ProctoredQuiz />}
      <video ref={screenSnapshotRef} className='hidden'></video>
      <video ref={cameraSnapshotRef} className='hidden'></video>
      <canvas ref={canvas} className='hidden'></canvas>
    </div>
  );
};

export default QuizPage;
