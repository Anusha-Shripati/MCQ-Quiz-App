'use client';
import { BasicInfoForm } from '@/components/test/BasicInfo';
import ProctoredQuiz from '@/components/test/ProctoredQuiz';
import { VideoRecordingScreen } from '@/components/test/VideoRecordingScreen';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { examApi } from '@/lib/api';
import { useExamStore } from '@/store/examStore';
import { EXAM_STEP } from '@/types/exam.types';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


const PROHIBITED_KEYS = [
  'Escape',
  'F1',
  'F2',
  'F3',
  'F4',
  'F5',
  'F6',
  'F7',
  'F8',
  'F9',
  'F10',
  'F11',
  'F12',
  'PrintScreen',
  'ScrollLock',
  'Pause',
  'Insert',
  'Home',
  'PageUp',
  'Delete',
  'End',
  'PageDown',
];

const PROHIBITED_COMBINATIONS = [
  { key: 'Tab', modifier: 'altKey' }, // Alt+Tab
  { key: 'Tab', modifier: 'ctrlKey' }, // Ctrl+Tab
  { key: 'w', modifier: 'ctrlKey' }, // Ctrl+W (close tab)
  { key: 't', modifier: 'ctrlKey' }, // Ctrl+T (new tab)
  { key: 'n', modifier: 'ctrlKey' }, // Ctrl+N (new window)
  // { key: 'r', modifier: 'ctrlKey' }, // Ctrl+R (refresh)
  { key: 'l', modifier: 'ctrlKey' }, // Ctrl+L (address bar)
  { key: 'f', modifier: 'ctrlKey' }, // Ctrl+F (find)
  { key: 'c', modifier: 'ctrlKey' }, // Ctrl+C (copy)
  { key: 'v', modifier: 'ctrlKey' }, // Ctrl+V (paste)
  { key: 'p', modifier: 'ctrlKey' }, // Ctrl+P (print)
  { key: 'q', modifier: 'ctrlKey' }, // Ctrl+Q (quit)
  { key: 'j', modifier: 'ctrlKey' }, // Ctrl+J (downloads)
  { key: 'h', modifier: 'ctrlKey' }, // Ctrl+H (history)
  { key: 'Tab', modifier: 'shiftKey' }, // Shift+Tab
];

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
      (e.ctrlKey || e.metaKey) &&
      (e.key === 'w' || // close tab
        e.key === 't' || // new tab
        e.key === 'n' || // new window
        e.key === 'r' || // refresh
        e.key === 'l' || // address bar
        e.key === 'f' || // find
        e.key === 'p' || // print
        e.key === 'o' || // open file
        e.key === 's' || // save
        e.key === 'a' || // select all
        e.key === 'c' || // copy
        e.key === 'v' || // paste
        e.key === 'x' || // cut
        e.key === 'y' || // redo
        e.key === 'z' || // undo
        e.key === '+' || // zoom in
        e.key === '-' || // zoom out
        e.key === '0') // reset zoom
    ) {
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
      <div className="w-screen min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-gray-600 animate-pulse">Loading your test environment...</p>
      </div>
    );
  }

  // if (error) {
  // 	return (
  // 		<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
  // 			<Card className='max-w-md w-full bg-white shadow-lg border-red-100'>
  // 				<CardContent className='pt-6'>
  // 					<div className='text-center space-y-4'>
  // 						<div className='w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto'>
  // 							<Camera className='h-6 w-6 text-red-600' />
  // 						</div>
  // 						<CardTitle className='text-red-600'>Error Loading Test</CardTitle>
  // 						<p className='text-gray-600'>{error}</p>
  // 					</div>
  // 				</CardContent>
  // 			</Card>
  // 		</div>
  // 	);
  // }

  if (error) {
    return (
      <div className="w-screen min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Card className="w-[90%] max-w-md p-6">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <p className="mt-4 text-gray-600">
              If you believe this is an error, please contact your exam administrator or request a
              new exam link.
            </p>
          </CardContent>
        </Card>
      </div>
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
