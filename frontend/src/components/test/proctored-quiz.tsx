import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/form/button';
import { examApi, isAxiosError } from '@/lib/api';
import { examEndpoint } from '@/lib/endpoint';
import { deleteVideoFromIndexedDB, uploadFileInChunks } from '@/lib/utils';
import {
  BROWSER_KEY,
  PROHIBITED_COMBINATIONS,
  PROHIBITED_KEYS,
  QUIZ_CONFIG,
} from '@/shared/constants/data';
import { useExamStore } from '@/store/examStore';
import {
  Answer,
  IExamQuestion,
  LocalAnswer,
  QuestionType,
  SubmitAnsPayload,
  SubmitAnsReponse,
  Violation,
} from '@/types/exam.types';
import { useTruncatedText } from '@/utils/useTruncatedText';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import AlertWrapper from './error/alert-wrapper';
import TestWarning from './error/test-warning';
import TestLoading from './loading/test-loading';
import Question from './question';
import TestHeader from './test-header';
import QuestionTabs from './questions-tabs';

type QuizAnswer = {
  question: IExamQuestion;
  temp_url?: string;
  answer: Answer;
  answer_id?: string;
};

export default function ProctoredQuiz() {
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const isSubmittingRef = useRef(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set());
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [liveViolations, setLiveViolations] = useState<Violation[]>([]);
  // const [lockedQuestions, setLockedQuestions] = useState<string[]>([]);
  const [questions, setQuestions] = useState<IExamQuestion[]>([]);
  const [prvViolations, setPrvViolations] = useState(0);
  const violationsRef = useRef<Violation[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const screenshotIntervalRef = useRef<NodeJS.Timeout>();
  const fullscreenElementRef = useRef<Element | null>(null);
  const [showTabSwitchModal, setShowTabSwitchModal] = useState(false);
  const isTabSwitchModalOpen = useRef(false);
  const isSubmittingFromModal = useRef(false);

  const originalWindowSize = useRef({ width: window.innerWidth, height: window.innerHeight });
  const pingIntervalRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { exam, accessCode, setExam } = useExamStore();
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const displayAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }
    alertTimeoutRef.current = setTimeout(() => setShowAlert(false), QUIZ_CONFIG.alertTimeout);
  };

  const { data: examData, isLoading: isExamLoading } = useSWR(
    `${examEndpoint.BY_ID}/${exam?.id}`,
    (url: string) => examApi.get(url, accessCode),
    {
      revalidateOnFocus: true,
      revalidateOnMount: true,
      revalidateOnReconnect: true,
      revalidateIfStale: true,
    }
  );


  const {
    isLong: isQuestionLong,
    expanded: questionExpanded,
    displayText: displayQuestion,
    toggle: toggleQuestion,
  } = useTruncatedText(questions[currentQuestionIndex]?.question.question || '', {
    wordLimit: 50,
    charLimit: 200,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { isMutating, trigger } = useSWRMutation<SubmitAnsReponse, any, string, SubmitAnsPayload>(
    `${examEndpoint.CANDIDATE_EXAM}/${exam?.id}/submit-answer`,
    (url: string, { arg }) => examApi.post(url, arg, accessCode)
  );
  const { trigger: videoTrigger, isMutating: isVideoMutating } = useSWRMutation(
    `${examEndpoint.CANDIDATE_EXAM}/${exam?.id}/submit-answer`,
    (
      url: string,
      {
        arg,
      }: {
        arg: {
          foldername: string;
          UploadId: string;
          parts: { ETag: string; PartNumber: number }[];
          question_id: string;
          merge_chunk: boolean;
        };
      }
    ) => examApi.post(url, arg, accessCode)
  );

  const { isMutating: isSubmiting, trigger: submitTrigger } = useSWRMutation(
    `${examEndpoint.CANDIDATE_EXAM}/${exam?.id}/finish`,
    (url: string) => examApi.get(url, accessCode)
  );
  const { isMutating: isReseting, trigger: resetTrigger } = useSWRMutation(
    `${examEndpoint.CANDIDATE_EXAM}/${exam?.id}/reset-answer`,
    (url: string, { arg }: { arg: { answer_id: string } }) => examApi.post(url, arg, accessCode)
  );

  const { cameraStreamRef } = useExamStore();

  // Add validation function for question answers
  const isQuestionAnswered = (question: IExamQuestion, answer: QuizAnswer | undefined): boolean => {
    if (!answer) return false;

    switch (question.question.type) {
      case QuestionType.MCQ:
      case QuestionType.CODE_SNIPPET_WITH_MCQ:
        // For MCQ, check if a valid option is selected (not empty string)
        return typeof answer.answer === 'string' && answer.answer.trim() !== '';

      case QuestionType.MULTIPLE_SELECT:
      case QuestionType.CODE_SNIPPET:
        // For multiple select and code_snippet, check if at least one option is selected
        return Array.isArray(answer.answer) && answer.answer.length > 0;

      case QuestionType.TEXT:
      case QuestionType.CODE_EDITOR:
        // For text-based questions, check if there's meaningful content
        return typeof answer.answer === 'string' && answer.answer.trim() !== '';

      case QuestionType.VIDEO:
        // For video questions, check if there's a temp_url or answer
        return !!(
          answer.temp_url ||
          (typeof answer.answer === 'string' && answer.answer.trim() !== '')
        );

      default:
        return false;
    }
  };

  useEffect(() => {
    if (examData) {
      setExam(examData.data);
      const obj: Record<string, LocalAnswer> = {};
      examData.data?.answers?.forEach(
        (a: { question_id: string; user_answer: string[]; id: string }) => {
          const question = examData.data?.exam_questions.find(
            (q: IExamQuestion) => q.question_id == a.question_id
          );

          obj[a.question_id as string] = {
            question: question.question,
            answer:
              question.question.type == QuestionType.MULTIPLE_SELECT
                ? a.user_answer
                : a.user_answer[0],
            answer_id: a.id,
          };
          obj[a.question_id as string].answer =
            question.question.type == QuestionType.VIDEO && obj[a.question_id as string].answer
              ? (process.env.NEXT_PUBLIC_IMGAE_PREFIX || '') + obj[a.question_id as string].answer
              : obj[a.question_id as string].answer;
        }
      );
      setAnswers(obj);
      localStorage.setItem('quizAnswers', JSON.stringify(obj));
      setQuestions(examData.data?.exam_questions || []);
      setTimeLeft(examData.data?.assessment?.duration * 60);
      checkExamStatus();
      setPrvViolations(examData?.data?.violations);
    }
  }, [examData]);

  useEffect(() => {
    const savedAnswers = localStorage.getItem('quizAnswers');

    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
  }, []);

  const checkExamStatus = async () => {
    if (!exam?.id || !accessCode || !examData.data?.assessment?.duration) return;

    try {
      setIsLoading(true);

      const { data: statusData } = await examApi.get(
        `${examEndpoint.CANDIDATE_EXAM}/${exam.id}/status`,
        accessCode
      );
      const status = statusData.status;

      let startTime: string | null = null;

      if (status === 'pending') {
        const { data: startData } = await examApi.get(
          `${examEndpoint.CANDIDATE_EXAM}/${exam.id}/start`,
          accessCode
        );
        startTime = startData.start_time;
      } else if (status === 'in_progress') {
        startTime = statusData.start_time;
      }

      if (status === 'completed') {
        router.push('/feedback');
        return;
      }

      if (startTime) {
        const now = Date.now();
        const startedAt = new Date(startTime).getTime();
        const examDurationInSeconds = examData.data.assessment.duration * 60;
        const remainingTime = examDurationInSeconds - (now - startedAt) / 1000;

        setTimeLeft(remainingTime);

        if (remainingTime <= 0) {
          router.push('/feedback');
        }
      }
    } catch (error) {
      console.error('checkExamStatus error:', error);
      setAccessError(isAxiosError(error) ? error.response?.data.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopRecording = (blob: Blob | null, url: string) => {
    setRecordingBlob(blob);
    setRecordingUrl(url);

    if (questions[currentQuestionIndex].question.type == 'video') {
      setAnswers((prev) => ({
        ...prev,
        [questions[currentQuestionIndex].question_id]: {
          question: questions[currentQuestionIndex],
          answer: prev[questions[currentQuestionIndex]?.question_id]?.answer || '',
          temp_url: url,
          answer_id: prev[questions[currentQuestionIndex]?.question_id]?.answer_id || '',
        },
      }));
    }
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case QuestionType.MCQ:
        return 'Multiple Choice (Select One)';
      case QuestionType.MULTIPLE_SELECT:
        return 'Multiple Select';
      case QuestionType.TEXT:
        return 'Text Answer';
      case QuestionType.CODE_SNIPPET:
        return 'Code Answer';
      case QuestionType.CODE_EDITOR:
        return 'Code Editor';
      case QuestionType.VIDEO:
        return 'Video Answer';
      default:
        return 'Question';
    }
  };

  const requestFullScreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        containerRef.current.classList.add('h-screen');
        containerRef.current.classList.add('overflow-auto');
        await containerRef.current.requestFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      // Don't add violation here since it might be a permissions issue
    }
  };

  const submitViolation = async () => {
    if (violationsRef.current.length === 0) return;
    try {
      await examApi.post(
        `${examEndpoint.CANDIDATE_EXAM}/${exam?.id}/submit-violation`,
        { violations: violationsRef.current },
        accessCode
      );
      setPrvViolations((prev) => prev + violationsRef.current.length);
      violationsRef.current = [];
      setLiveViolations([]); // Clear violations after successful submission
    } catch (error) {
      console.error('Error submitting violations:', error);
    }
  };

  // Submit the quiz on max violations
  // useEffect(() => {
  //   const totalViolations = liveViolations.length + prvViolations;

  //   if (totalViolations > QUIZ_CONFIG.maxViolations) {
  //     submitViolation();
  //     submitQuiz();
  //   }
  // }, [liveViolations, prvViolations]);

  useEffect(() => {
    if (questions.length && Object.keys(answers).length === 0) {
      const unansweredIndex = questions.findIndex((q) => !answers[q.question_id]);
      if (unansweredIndex !== -1) {
        setCurrentQuestionIndex(unansweredIndex);
      }
    }
  }, [questions]);

  // Track visited questions
  useEffect(() => {
    if (questions[currentQuestionIndex]) {
      setVisitedQuestions((prev) => {
        const newSet = new Set(prev);
        newSet.add(questions[currentQuestionIndex].question_id);
        return newSet;
      });
    }
  }, [currentQuestionIndex, questions]);

  const addViolation = useCallback((violation: Omit<Violation, 'timestamp'>) => {
    if (audioRef.current) audioRef.current.play();

    const newViolation: Violation = { ...violation, timestamp: Date.now() };

    // Update state & ref
    violationsRef.current.push(newViolation);

    // Update the count immediately
    setLiveViolations([...violationsRef.current]);

    displayAlert(`Warning: ${violation.details}`);
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'F11') {
      e.preventDefault();
      requestFullScreen();
      return;
    }

    if (PROHIBITED_KEYS.includes(e.key)) {
      e.preventDefault();
      addViolation({
        type: 'PROHIBITED_KEY',
        details: `Attempted to use ${e.key} key`,
      });
      return;
    }

    // Check for prohibited key combinations
    for (const combo of PROHIBITED_COMBINATIONS) {
      if (
        e.key.toLowerCase() === combo.key.toLowerCase() &&
        e[combo.modifier as keyof KeyboardEvent]
      ) {
        e.preventDefault();
        addViolation({
          type: 'PROHIBITED_KEY_COMBO',
          details: `Attempted to use ${combo.modifier.replace('Key', '')}+${combo.key}`,
        });
        return;
      }
    }

    // Prevent browser shortcuts

    if ((e.ctrlKey || e.metaKey) && BROWSER_KEY.includes(e.key)) {
      e.preventDefault();
      addViolation({
        type: 'BROWSER_SHORTCUT',
        details: `Attempted to use ${e.ctrlKey ? 'Ctrl' : 'Cmd'}+${e.key}`,
      });
      return;
    }

    // Prevent Alt key combinations (menu shortcuts)
    if (e.altKey) {
      e.preventDefault();
      addViolation({
        type: 'ALT_SHORTCUT',
        details: `Attempted to use Alt+${e.key}`,
      });
      return;
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      addViolation({
        type: 'INSPECT_ELEMENT',
        details: `Attempted to inspect element`,
      });
      return;
    }
  };

  const handleResize = () => {
    const { width, height } = originalWindowSize.current;

    if (
      (Math.abs(window.innerWidth - width) > 20 || Math.abs(window.innerHeight - height) > 20) &&
      fullscreenElementRef.current?.tagName !== 'VIDEO'
    ) {
      addViolation({ type: 'WINDOW_RESIZE', details: 'Detected significant window size change' });
    }
  };

  const handleFullScreenChange = () => {
    if (!document.fullscreenElement && fullscreenElementRef.current?.tagName !== 'VIDEO') {
      if (!isSubmittingFromModal.current) {
        addViolation({ type: 'FULLSCREEN_EXIT', details: 'Exited full screen mode' });
      }
    }
    fullscreenElementRef.current = document.fullscreenElement;
  };
  
  const handleWindowFocus = () => {
    if (!document.hasFocus() && !isTabSwitchModalOpen.current && !isSubmittingFromModal.current) {
      isTabSwitchModalOpen.current = true;
      setShowTabSwitchModal(true);
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden && !isTabSwitchModalOpen.current && !isSubmittingFromModal.current) {
      isTabSwitchModalOpen.current = true;
      setShowTabSwitchModal(true);
    }
  };

  const submitQuiz = async () => {
    if (isSubmitting) return;
    try {
      await handleNextQuestion();
      setIsSubmitting(true);

      isSubmittingFromModal.current = true; 

      await submitTrigger();

      if (document.fullscreenElement) document.exitFullscreen();

      cameraStreamRef?.getTracks().forEach((track) => {
        track.stop();
      });

      router.push('/feedback');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setIsSubmitting(false);
      setShowAlert(true);
      setAlertMessage(isAxiosError(error) ? error.response?.data.message : 'An error occurred');
    }
  };

  // Also update the timer end handler to send email on auto-submit
  const handleTimerEnd = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      await submitTrigger();

      router.push('/feedback'); // use router if available
    } catch (error) {
      console.error('Auto-submit failed:', error);
      isSubmittingRef.current = false;
    }
  };

  const detectMultipleScreens = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window.screen as any).isExtended) {
      addViolation({ type: 'MULTIPLE_SCREENS', details: 'Multiple screens detected' });
    }
  };
  // Effects
  useEffect(() => {
    if (process.env.MODE == 'development') return;

    // Request fullscreen after 1 second
    const fullscreenTimeout = setTimeout(() => {
      requestFullScreen();
    }, 1000);

    // Initial screenshot after 2 seconds
    const initialScreenshotTimeout = setTimeout(() => {
      // takeScreenshot();
    }, 2000);

    // Interval to auto-submit violations
    const violationInterval = setInterval(() => {
      if (violationsRef.current.length > 0) submitViolation();
    }, 10000);

    detectMultipleScreens();
    const screenInterval = setInterval(() => {
      detectMultipleScreens();
    }, 5000);

    // Store original window size
    originalWindowSize.current = { width: window.innerWidth, height: window.innerHeight };

    // Handlers
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';

      addViolation({
        type: 'TAB_CLOSE_ATTEMPT',
        details: 'User attempted to close or refresh the tab',
      });

      displayAlert('WARNING: Attempting to close or refresh the tab is not allowed!');
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      addViolation({ type: 'CONTEXT_MENU', details: 'Attempted to open context menu' });
    };

    // Add listeners
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowFocus);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const fullscreenEventTimeout = setTimeout(() => {
      document.addEventListener('fullscreenchange', handleFullScreenChange);
      window.addEventListener('resize', handleResize);
    }, 3000);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);

    // Cleanup
    return () => {
      clearTimeout(fullscreenTimeout);
      clearTimeout(fullscreenEventTimeout);
      clearTimeout(initialScreenshotTimeout);
      clearInterval(violationInterval);
      clearInterval(screenInterval);
      if (screenshotIntervalRef.current) clearInterval(screenshotIntervalRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

      window.removeEventListener('resize', handleResize);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowFocus);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Handle save answer for Quiz functions
  const saveAnswer = (question: IExamQuestion, answerValue: Answer) => {
    const updatedAnswers = {
      ...answers,
      [question.question_id]: {
        question,
        answer: answerValue,
      },
    };
    setAnswers(updatedAnswers);
    localStorage.setItem('quizAnswers', JSON.stringify(updatedAnswers));
  };

  // Lock the question after save
  const lockQuestion = (questionId: string) => {
    // Removed locking - users can change answers anytime
  };

  const handleReset = async () => {
    const current_question = questions[currentQuestionIndex];
    try {
      const answerId = answers[current_question.question_id]?.answer_id;
      if (typeof answerId === 'string' && answerId) {
        await resetTrigger({ answer_id: answerId });
      }
    } catch (error) {
      setShowAlert(true);
      setAlertMessage(
        isAxiosError(error)
          ? error.response?.data.message
          : 'An error occurred while resetting the answer'
      );
      return;
    }
    if (current_question.question.type == 'video') {
      setRecordingUrl(null);
      await deleteVideoFromIndexedDB(current_question.id, exam?.id || '');
    }
    setAnswers((prv) => {
      const temp = { ...prv };
      delete temp[current_question.question_id];
      return temp;
    });
  };
  const handleNextQuestion = async () => {
    if (!questions.length) return;

    const current = questions[currentQuestionIndex];
    const questionId = current.question_id;
    const questionType = current.question.type;
    const currentAnswer = answers[questionId];
    const existingAnswer = currentAnswer?.answer;

    if (!existingAnswer && questionType !== QuestionType.VIDEO) return;

    try {
      let success = false;

      if (questionType === QuestionType.VIDEO) {
        if (!recordingBlob) return;
        const { fileName, parts, UploadId } = await uploadFileInChunks(
          recordingBlob as Blob,
          5 * 1024 * 1024,
          exam?.id || ''
        );

        const payload = {
          foldername: fileName,
          UploadId,
          parts,
          merge_chunk: true,
          question_id: questionId,
        };
        const response = await videoTrigger(payload).catch((error) => {
          console.error('Background video processing failed:', error);
        });
        if (response.success) {
          setAnswers((prev) => ({
            ...prev,
            [questionId]: {
              question: current,
              answer: recordingUrl || '',
              answer_id: response.data?.answer?.id || questionId,
              pending: true,
            },
          }));
          success = true;
        }
      } else {
        const payload = {
          question_id: questionId,
          user_answer: (Array.isArray(existingAnswer) ? existingAnswer : [existingAnswer]) as (
            | string
            | number
          )[],
        };
        const response = await trigger(payload);

        if (response?.success) {
          setAnswers((prev) => ({
            ...prev,
            [questionId]: { ...prev[questionId], answer_id: response.data?.answer?.id },
          }));
          localStorage.setItem('quizAnswers', JSON.stringify({
            ...answers,
            [questionId]: { ...answers[questionId], answer_id: response.data?.answer?.id },
          }));
          success = true;
        }
      }

      if (success) {
        lockQuestion(questionId);
        goToNextQuestion();
      }
    } catch (error) {
      setShowAlert(true);
      setAlertMessage(isAxiosError(error) ? error.response?.data.message : 'An error occurred');
    }
  };

  const goToNextQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const visibleButtons = () => {
    const total = questions.length;
    const current = currentQuestionIndex;

    const buttons = new Set<number>();

    [0, 1, 2].forEach((i) => i < total && buttons.add(i));

    [total - 3, total - 2, total - 1].forEach((i) => i >= 0 && i < total && buttons.add(i));

    // Current ±2
    for (let i = current - 2; i <= current + 2; i++) {
      if (i >= 0 && i < total) buttons.add(i);
    }

    return Array.from(buttons).sort((a, b) => a - b);
  };

  // const buttonIndexes = visibleButtons();

  const TabSwitchConfirmationModal = () => {
  if (!showTabSwitchModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-4">
          <h3 className="text-lg font-semibold text-red-600 mb-4">Tab Switch Detected!</h3>
          <p className="text-gray-700 mb-6">
            You tried to switch tabs or leave the exam window. This action is not permitted. After 2
            such attempts, your test will be automatically submitted.
          </p>
          <div className="flex gap-4">
            <Button onClick={handleConfirmTabSwitch} variant="destructive" className="flex-1">
              Confirm & Submit Test
            </Button>
            <Button onClick={handleCancelTabSwitch} variant="outline" className="flex-1">
              Cancel & Continue
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Add these handler functions
  const handleConfirmTabSwitch = async () => {
    setShowTabSwitchModal(false);
    isTabSwitchModalOpen.current = false;
    isSubmittingFromModal.current = true;

    addViolation({
      type: 'TAB_SWITCH_CONFIRMED',
      details: 'User confirmed tab switch and chose to submit test',
    });

    await submitQuiz();
  };

  const handleCancelTabSwitch = () => {
    setShowTabSwitchModal(false);
    isTabSwitchModalOpen.current = false;

    addViolation({
      type: 'TAB_SWITCH_CANCELLED',
      details: 'User attempted tab switch but chose to continue',
    });
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-4 md:py-8"
    >
      {accessError ? (
        <TestWarning
          text={
            <ul>
              <li>{accessError}</li>
            </ul>
          }
          title="Access Denied"
        />
      ) : isLoading || isExamLoading ? (
        <TestLoading />
      ) : (
        <>
          <AlertWrapper
            showAlert={showAlert}
            alertMessage={alertMessage}
            onClose={() => setShowAlert(false)}
          />

          <audio src="/assets/alert.wav" ref={audioRef} style={{ display: 'none' }} />

          <div className="flex gap-6 w-full mx-auto px-4 md:px-8">
            {/* Left Sidebar - Question Navigation */}
            <QuestionTabs
              questions={questions}
              currentQuestionIndex={currentQuestionIndex}
              setCurrentQuestionIndex={setCurrentQuestionIndex}
              answeredQuestions={answers}
              visitedQuestions={visitedQuestions}
              violations={prvViolations + liveViolations.length}
              maxViolations={QUIZ_CONFIG.maxViolations}
              totalAnswered={Object.keys(answers).length}
            />

            {/* Main Content Card */}
            <Card className="flex-1 min-h-[85vh] shadow-xl border-0 rounded-xl overflow-hidden bg-white/95 backdrop-blur-sm">
              <TestHeader
                submitQuiz={submitQuiz}
                timeLeft={timeLeft}
                currentQuestionIndex={currentQuestionIndex}
                totalQuestion={questions.length || 0}
                handleTimerEnd={handleTimerEnd}
                isSubmiting={isSubmiting}
                isMutating={isMutating}
                answeredQuestionsCount={Object.keys(answers).length}
              />

              <CardContent className="p-4 md:p-8 space-y-6 pt-2 md:pt-4">

                {questions.length > 0 && (
                  <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 transition-all hover:shadow-md">
                    <div className="space-y-6">
                      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 leading-relaxed break-all whitespace-pre-wrap overflow-hidden flex-1">
                        <span className="text-blue-600">Q{currentQuestionIndex + 1}.</span>{' '}
                        {displayQuestion}
                        {isQuestionLong && (
                          <button
                            className="ml-2 text-blue-600 underline text-sm font-medium"
                            onClick={toggleQuestion}
                          >
                            {questionExpanded ? 'Show less' : 'Show more'}
                          </button>
                        )}
                        <span className="ml-3 text-sm font-medium text-gray-600">
                          ({getQuestionTypeLabel(
                            questions[currentQuestionIndex].question.type as QuestionType
                          )})
                        </span>
                      </h2>

                      <div className=" text-black">
                        <Question
                          question={questions[currentQuestionIndex]}
                          answers={answers}
                          isLoading={isMutating || isSubmiting || isVideoMutating}
                          handleAnswerChange={(question, value) => saveAnswer(question, value)}
                          handleStopRecording={handleStopRecording}
                          handleNextQuestion={handleNextQuestion}
                          isLocked={false}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress and navigation */}
                <div className="flex gap-3 justify-end">
                  {answers[questions[currentQuestionIndex].question_id] && (
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      disabled={isReseting}
                      className="px-5 py-2.5 text-base font-semibold rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900"
                    >
                      {isReseting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'Reset'
                      )}
                    </Button>
                  )}

                  <Button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(prev + 1, questions.length - 1))}
                    disabled={currentQuestionIndex === questions.length - 1}
                    variant="outline"
                    className="px-5 py-2.5 text-base font-semibold flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900"
                  >
                    Skip
                    <ChevronRight className="w-5 h-5" />
                  </Button>

                  <Button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                    className="px-5 py-2.5 text-base font-semibold flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </Button>

                  <Button
                    onClick={() => handleNextQuestion()}
                    disabled={
                      !isQuestionAnswered(
                        questions[currentQuestionIndex],
                        answers[questions[currentQuestionIndex].question_id]
                      ) ||
                      isMutating ||
                      isSubmiting ||
                      isVideoMutating ||
                      currentQuestionIndex === questions.length - 1
                    }
                    className="px-6 py-2.5 flex text-base items-center font-semibold gap-2 rounded-lg transition-all min-w-[120px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg"
                  >
                    {isMutating || isSubmiting ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin mx-auto" />
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      <TabSwitchConfirmationModal />
    </div>
  );
}
