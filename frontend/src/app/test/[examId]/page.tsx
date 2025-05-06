'use client';
import { BasicInfoForm } from '@/components/test/BasicInfo';
import ProctoredQuiz from '@/components/test/ProctoredQuiz';
import { VideoRecordingScreen } from '@/components/test/VideoRecorder';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { examApi } from '@/lib/api';
import { useExamStore } from '@/store/examStore';
import { EXAM_STEP } from '@/types/exam.types';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const QuizPage = () => {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { current_step, setCurrentStep, setAccessCode, setExam } = useExamStore();

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

        const data = await examApi.get(`/candidate-exam/${params.examId}`, code);

        if (!data.success) {
          setError(data.message || 'Access denied. Invalid or expired access code.');
          return;
        }

        console.log('daataaaaa exam', data);

        setExam(data.data);

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

  const handleRecordingComplete = (recordedChunks: Blob[]) => {
    console.log('Recording complete:', recordedChunks);
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
        <VideoRecordingScreen onRecordingComplete={handleRecordingComplete} />
      )}
      {current_step === EXAM_STEP.QUIZ && <ProctoredQuiz />}
    </div>
  );
};

export default QuizPage;
