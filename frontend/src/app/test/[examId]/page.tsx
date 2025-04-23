'use client';
import { BasicInfoForm } from '@/components/test/BasicInfo';
import ProctoredQuiz from '@/components/test/ProctoredQuiz';
import { VideoRecordingScreen } from '@/components/test/VideoRecorder';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { examApi } from '@/lib/api';
import { IExam } from '@/types/candidate.types';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState	 } from 'react';

const QuizPage = () => {
	const params = useParams();
	const [step, setStep] = useState('basicInfo'); // 'basicInfo' | 'videoRecording' | 'quiz'
	const [exam, setExam] = useState<IExam | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [accessCode, setAccessCode] = useState<string | null>(null);

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

				const response = await examApi.get(
					`/candidate-exam/${params.examId}`,
					code
				);


				// if (!data.success) {
				// 	setError(
				// 		data.message || 'Access denied. Invalid or expired access code.'
				// 	);
				// 	// setIsLoading(false);
				// 	return;
				// }

				console.log('response ', response);
				setExam(response.data);

				setError(null);
			} catch (err) {
				setError('Failed to fetch candidate data');
				console.error('Error fetching candidate:', err);
			} finally {
				setLoading(false);
			}
		};

		if (params.examId) {
			fetchCandidate();
		}
	}, [params.examId]);

	const handleNextStep = () => {
		setStep('videoRecording');
	};

	const handleRecordingComplete = (recordedChunks: Blob[]) => {
		console.log('Recording complete:', recordedChunks);
		setStep('quiz');
	};

	if (loading) {
		return (
			<div className='w-screen min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4'>
				<Loader2 className='w-8 h-8 text-purple-600 animate-spin' />
				<p className='text-gray-600 animate-pulse'>
					Loading your test environment...
				</p>
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
			<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
				<Card className='w-[90%] max-w-md p-6'>
					<CardHeader>
						<CardTitle className='text-red-600'>Access Denied</CardTitle>
					</CardHeader>
					<CardContent>
						<Alert variant='destructive'>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
						<p className='mt-4 text-gray-600'>
							If you believe this is an error, please contact your exam
							administrator or request a new exam link.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='w-screen min-h-screen bg-gray-50'>
			{step === 'basicInfo' && (
				<BasicInfoForm
					handleBasicInfoSubmit={handleNextStep}
					candidateData={exam?.candidate}
				/>
			)}
			{step === 'videoRecording' && (
				<VideoRecordingScreen onRecordingComplete={handleRecordingComplete} />
			)}
			{step === 'quiz' && <ProctoredQuiz accessCode={accessCode} />}
		</div>
	);
};

export default QuizPage;
