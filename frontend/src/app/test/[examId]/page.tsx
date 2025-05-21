'use client';
import { BasicInfoForm } from '@/components/test/BasicInfo';
import ProctoredQuiz from '@/components/test/ProctoredQuiz';
import TestError from '@/components/test/TestError';
import TestLoading from '@/components/test/TestLoading';
import { VideoRecordingScreen } from '@/components/test/VideoRecordingScreen';
import { examApi } from '@/lib/api';
import { BROWSER_KEY, PROHIBITED_COMBINATIONS, PROHIBITED_KEYS } from '@/shared/constants/data';
import { useExamStore } from '@/store/examStore';
import { EXAM_STEP } from '@/types/exam.types';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


const QuizPage = () => {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { current_step, setCurrentStep, setAccessCode, setCandidate,candidate,setExam } = useExamStore();
  const router = useRouter();

  const [videoLink, setVideoLink] = useState<string | null>(null);


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
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener(
      'contextmenu',
      (e) => {
        e.preventDefault();
        return false;
      },
      true
    );
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
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

  return (
    <div className="w-screen min-h-screen bg-gray-50">
      {current_step === EXAM_STEP.BASIC_INFO && <BasicInfoForm />}
      {current_step === EXAM_STEP.VIDEO_RECORDING && (
        <VideoRecordingScreen onRecordingComplete={handleRecordingComplete} videoLink={videoLink || undefined} />
      )}
      {current_step === EXAM_STEP.QUIZ && candidate && <ProctoredQuiz />}
    </div>
  );
};

export default QuizPage;
