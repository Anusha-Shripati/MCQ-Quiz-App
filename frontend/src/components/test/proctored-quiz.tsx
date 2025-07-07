import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/form/button';
import { useExamStore } from '@/store/examStore';
import { Answer, IExamQuestion, LocalAnswer, QuestionType, SubmitAnsPayload, SubmitAnsReponse, Violation } from '@/types/exam.types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import TestHeader from './test-header';
import useSWR from 'swr';
import { examApi, isAxiosError } from '@/lib/api';
import { useRouter } from 'next/navigation';
import useSWRMutation from 'swr/mutation';
import AlertWrapper from './error/alert-wrapper';
import TestLoading from './loading/test-loading';
import Question from './question';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { BROWSER_KEY, PROHIBITED_COMBINATIONS, PROHIBITED_KEYS, QUIZ_CONFIG } from '@/shared/constants/data';
import { examEndpoint } from '@/lib/endpoint';
import TestWarning from './error/test-warning';
import { deleteVideoFromIndexedDB, uploadFileInChunks } from '@/lib/utils';

export default function ProctoredQuiz() {
  const [answers, setAnswers] = useState<Record<string, { question: IExamQuestion, answer: Answer, answer_id?: string }>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const isSubmittingRef = useRef(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const router = useRouter();
  const violations = useRef<Violation[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const screenshotIntervalRef = useRef<NodeJS.Timeout>();
  const fullscreenElementRef = useRef<Element | null>(null);


  const originalWindowSize = useRef({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const pingIntervalRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { exam, accessCode, setExam } = useExamStore();
  const [questions, setQuestions] = useState<IExamQuestion[]>([]);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [prvViolations, setPrvViolations] = useState(0)

  const displayAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }
    alertTimeoutRef.current = setTimeout(() => setShowAlert(false), QUIZ_CONFIG.alertTimeout);
  };

  const { data: examData, isLoading: isExamLoading } = useSWR(`${examEndpoint.BY_ID}/${exam?.id}`, (url: string) => examApi.get(url, accessCode), {
    revalidateOnFocus: true,
    revalidateOnMount: true,
    revalidateOnReconnect: true,
    revalidateIfStale: true,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { isMutating, trigger } = useSWRMutation<SubmitAnsReponse, any, string, SubmitAnsPayload>(
    `${examEndpoint.CANDIDATE_EXAM}/${exam?.id}/submit-answer`,
    (url: string, { arg }) => examApi.post(url, arg, accessCode)
  )
  const { trigger:videoTrigger, isMutating:isVideoMutating } = useSWRMutation(`${examEndpoint.CANDIDATE_EXAM}/${exam?.id}/submit-answer`, 
    (url: string, { arg }: { arg: {foldername:string,UploadId:string,parts:{ETag:string,PartNumber:number}[],question_id:string,merge_chunk:boolean} }) => 
      examApi.post(url, arg, accessCode)
  );
  
  const { isMutating: isSubmiting, trigger: submitTrigger } = useSWRMutation(`${examEndpoint.CANDIDATE_EXAM}/${exam?.id}/finish`, (url: string) => examApi.get(url, accessCode))
  const { isMutating: isReseting, trigger: resetTrigger } = useSWRMutation(`${examEndpoint.CANDIDATE_EXAM}/${exam?.id}/reset-answer`, (url: string, { arg }: { arg: { answer_id: string } }) => examApi.post(url, arg, accessCode))

  const {cameraStreamRef} = useExamStore()
  useEffect(() => {
    if (examData) {
      setExam(examData.data);
      const obj: Record<string, LocalAnswer> = {}
      examData.data?.answers?.forEach((a: { question_id: string, user_answer: string[], id: string }) => {
        const question = examData.data?.exam_questions.find((q: IExamQuestion) => q.question_id == a.question_id)

        obj[a.question_id as string] = {
          question: question.question,
          answer: question.question.type == QuestionType.MULTIPLE_SELECT ? a.user_answer : a.user_answer[0],
          answer_id: a.id
        }
        obj[a.question_id as string].answer = question.question.type == QuestionType.VIDEO ? (process.env.NEXT_PUBLIC_IMGAE_PREFIX || '')+obj[a.question_id as string].answer : obj[a.question_id as string].answer
      })
      setAnswers(obj)
      localStorage.setItem('quizAnswers', JSON.stringify(obj))
      setQuestions(examData.data?.exam_questions || []);
      setTimeLeft(examData.data?.assessment?.duration * 60);
      checkExamStatus();
      setPrvViolations(examData?.data?.violations)
    }
  }, [examData]);

  const checkExamStatus = async () => {
    if (!exam?.id || !accessCode || !examData.data?.assessment?.duration) return;

    try {
      setIsLoading(true);

      const { data: statusData } = await examApi.get(`${examEndpoint.CANDIDATE_EXAM}/${exam.id}/status`, accessCode);
      const status = statusData.status;

      let startTime: string | null = null;

      if (status === 'pending') {
        const { data: startData } = await examApi.get(`${examEndpoint.CANDIDATE_EXAM}/${exam.id}/start`, accessCode);
        startTime = startData.start_time;
      } else if (status === 'in_progress') {
        startTime = statusData.start_time;
      }

      if (status === 'completed') {
        router.push('/thank-you');
        return;
      }

      if (startTime) {
        const now = Date.now();
        const startedAt = new Date(startTime).getTime();
        const examDurationInSeconds = examData.data.assessment.duration * 60;
        const remainingTime = examDurationInSeconds - (now - startedAt) / 1000;

        setTimeLeft(remainingTime);

        if (remainingTime <= 0) {
          router.push('/thank-you');
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
  }


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
    if (violations.current.length === 0) return;
    try {
      await examApi.post(`${examEndpoint.CANDIDATE_EXAM}/${exam?.id}/submit-violation`, {
        violations: violations.current,
      }, accessCode);
      setPrvViolations((prv) => prv + violations.current.length)
      violations.current = []; // Clear violations after successful submission
    } catch (error) {
      console.error('Error submitting violations:', error);
    }
  }

  const addViolation = (violation: Omit<Violation, 'timestamp'>) => {

    if (audioRef.current) {
      audioRef.current.play()
    }
    const newViolation: Violation = {
      ...violation,
      timestamp: Date.now(),
    };

    violations.current = [...violations.current, newViolation];

    if ((violations.current.length + prvViolations) >= QUIZ_CONFIG.maxViolations) {
      // submitQuiz();
    }
    displayAlert(`Warning: ${violation.details}`);

  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'F11') {
      e.preventDefault();
      requestFullScreen();
      return;
    }

    if (PROHIBITED_KEYS.includes(e.key)) {
      e.preventDefault();
      // addViolation({
      //   type: 'PROHIBITED_KEY',
      //   details: `Attempted to use ${e.key} key`,
      // });
      return;
    }

    // Check for prohibited key combinations
    for (const combo of PROHIBITED_COMBINATIONS) {
      if (
        e.key.toLowerCase() === combo.key.toLowerCase() &&
        e[combo.modifier as keyof KeyboardEvent]
      ) {
        e.preventDefault();
        // addViolation({
        //   type: 'PROHIBITED_KEY_COMBO',
        //   details: `Attempted to use ${combo.modifier.replace('Key', '')}+${combo.key}`,
        // });
        return;
      }
    }

    // Prevent browser shortcuts

    if (
      (e.ctrlKey || e.metaKey) && BROWSER_KEY.includes(e.key)) {
      e.preventDefault();
      // addViolation({
      //   type: 'BROWSER_SHORTCUT',
      //   details: `Attempted to use ${e.ctrlKey ? 'Ctrl' : 'Cmd'}+${e.key}`,
      // });
      return;
    }

    // Prevent Alt key combinations (menu shortcuts)
    if (e.altKey) {
      e.preventDefault();
      // addViolation({
      //   type: 'ALT_SHORTCUT',
      //   details: `Attempted to use Alt+${e.key}`,
      // });
      return;
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      // addViolation({
      //   type: 'INSPECT_ELEMENT',
      //   details: `Attempted to inspect element`,
      // });
      return;
    }
  };

  const handleResize = () => {

    const { width, height } = originalWindowSize.current;

    if ((Math.abs(window.innerWidth - width) > 20 || Math.abs(window.innerHeight - height) > 20) && fullscreenElementRef.current?.tagName !== 'VIDEO') {
      addViolation({
        type: 'WINDOW_RESIZE',
        details: 'Detected significant window size change',
      });
    }
  };

  const handleFullScreenChange = () => {
    if (!document.fullscreenElement && fullscreenElementRef.current?.tagName !== 'VIDEO') {
      addViolation({
        type: 'FULLSCREEN_EXIT',
        details: 'Exited full screen mode',
      });
    }
    fullscreenElementRef.current = document.fullscreenElement;

  };

  const handleWindowFocus = () => {
    if (!document.hasFocus()) {
      displayAlert(`WARNING: Tab switching detected!`);

      addViolation({
        type: 'WINDOW_FOCUS_LOST',
        details: 'User switched to another window',
      });
    }
  };

  // Quiz functions
  const handleAnswerChange = useCallback((question: IExamQuestion, value: string | Blob | (string | number)[]) => {
    setAnswers((prev) => ({
      ...prev,
      [question.question_id]: { question, answer: value },
    }));
  }, [answers]);

  const submitQuiz = async () => {
    if (isSubmitting) return;
    try {
      
      await handleNextQuestion();
      setIsSubmitting(true);

      await submitTrigger();
      if (document.fullscreenElement) document.exitFullscreen();

      cameraStreamRef?.getTracks().forEach((track)=>{
        track.stop()
      })


      router.push('/thank-you');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setIsSubmitting(false);
      setShowAlert(true)
      setAlertMessage(isAxiosError(error) ? error.response?.data.message : 'An error occurred')
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


      router.push('/thank-you');  // use router if available
    } catch (error) {
      console.error('Auto-submit failed:', error);
      isSubmittingRef.current = false;
    }
  };

  const detectMultipleScreens = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window.screen as any).isExtended) {
      addViolation({
        type: 'MULTIPLE_SCREENS',
        details: 'Multiple screens detected',
      });
    }
  }
  // Effects
  useEffect(() => {
    if (process.env.MODE == 'development') return

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
      if (violations.current.length > 0) submitViolation();
    }, 10000);

    detectMultipleScreens();
    const screenInterval = setInterval(() => {
      detectMultipleScreens();
    }, 5000);


    // Store original window size
    originalWindowSize.current = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

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
      addViolation({
        type: 'CONTEXT_MENU',
        details: 'Attempted to open context menu',
      });
    };

    // Add listeners
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowFocus);
    window.addEventListener('beforeunload', handleBeforeUnload);


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
    };
  }, []);


  const handleReset = async () => {
    const current_question = questions[currentQuestionIndex]
    try {
      const answerId = answers[current_question.question_id]?.answer_id;
      if (typeof answerId === 'string') {
        await resetTrigger({ answer_id: answerId });
      }
    } catch (error) {
      // setShowAlert(true);
      // setAlertMessage(isAxiosError(error)
      //   ? error.response?.data.message
      //   : 'An error occurred while resetting the answer');
      // return;
    }
    if(current_question.question.type == 'video'){
      deleteVideoFromIndexedDB(current_question.id,exam?.id || '')
    }
    setAnswers((prv) => {
      const temp = { ...prv }
      delete temp[current_question.question_id];
      return temp
    })
   


  }
  const handleNextQuestion = async () => {

    if (!questions.length) return;

    const current = questions[currentQuestionIndex];
    const questionId = current.question_id;
    const questionType = current.question.type;
    const existingAnswer = answers[questionId]?.answer;

    if (!existingAnswer && questionType !== QuestionType.VIDEO) return;

    try {
      let success = false;

      if (questionType === QuestionType.VIDEO) {
        // if (recordingUrl === existingAnswer) {
        //   goToNextQuestion();
        //   return;
        // }
        const { fileName, parts, UploadId } = await uploadFileInChunks(recordingBlob as Blob, 5 * 1024 * 1024, exam?.id || '');

        // Prepare payload for background processing
        const payload = {
          foldername: fileName,
          UploadId,
          parts,
          merge_chunk: true,
          question_id: questionId
        };

        const response = await videoTrigger(payload)
          .catch(error => {
            console.error('Background video processing failed:', error);
          })
        if (response.success) {

          // const userAnswer = response.data?.answer?.user_answer?.[0] as string;

          setAnswers((prev) => ({
            ...prev,
            [questionId]: {
              question: current,
              answer: recordingUrl || '',
              answer_id: questionId
            },
          }));
          success = true;
        }

      } else {
        const payload = {
          question_id: questionId,
          user_answer: (Array.isArray(existingAnswer) ? existingAnswer : [existingAnswer]) as (string | number)[],
        };
        const response = await trigger(payload)

        setAnswers((prev) => ({
          ...prev,
          [questionId]: { ...prev[questionId], answer_id: response.data?.answer?.id },
        }));
        success = true;

        if (response.success) success = true;
      }

      if (success) {
        goToNextQuestion();
      }

    } catch (error) {
      setShowAlert(true);
      setAlertMessage(isAxiosError(error)
        ? error.response?.data.message
        : 'An error occurred');
    }
  };

  const goToNextQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const visibleButtons = () => {
    const total = questions.length;
    const current = currentQuestionIndex;

    const buttons = new Set<number>();

    [0, 1, 2].forEach(i => i < total && buttons.add(i));

    [total - 3, total - 2, total - 1].forEach(i => i >= 0 && i < total && buttons.add(i));

    // Current ±2
    for (let i = current - 2; i <= current + 2; i++) {
      if (i >= 0 && i < total) buttons.add(i);
    }

    return Array.from(buttons).sort((a, b) => a - b);
  };

  const buttonIndexes = visibleButtons();

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8"
    >
      {accessError ? (
        <TestWarning text={<ul>
          <li>{accessError}</li>
        </ul>} title="Access Denied" />
      ) : (isLoading || isExamLoading) ? (
        <TestLoading />
      ) : (
        <>
          <AlertWrapper showAlert={showAlert} alertMessage={alertMessage} onClose={() => setShowAlert(false)} />

          <audio src="/assets/alert.wav" ref={audioRef} style={{ display: 'none' }} />
          <Card className="w-[95vw] max-w-[1200px] mx-auto min-h-[70px] mb-3 shadow-xl border-0 rounded-xl text-black overflow-hidden bg-white/95 backdrop-blur-sm">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Violations:</span>
                <span className={`text-lg font-bold ${(prvViolations + violations.current.length) >= 4 ? 'text-red-600' : 'text-blue-600'}`}>
                  {prvViolations + violations.current.length} / 5
                </span>
              </div>
              {(prvViolations + violations.current.length) >= 3 && (
                <div className="text-sm text-red-600 font-medium">
                  Warning: Quiz will be automatically submitted at 5 violations
                </div>
              )}
            </div>
          </Card>

          <Card className="w-[95vw] max-w-[1200px] mx-auto min-h-[85vh] shadow-xl border-0 rounded-xl overflow-hidden bg-white/95 backdrop-blur-sm">
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

            <CardContent className="p-4 md:p-8 space-y-6">

              <div className="flex flex-wrap gap-2 justify-center items-center">
                {buttonIndexes.map((index, i) => {

                  const prev = buttonIndexes[i - 1];
                  const isGap = i > 0 && index - prev > 1;

                  return (
                    <React.Fragment key={index}>
                      {isGap && <span className="px-2">...</span>}
                      <button
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                          ${currentQuestionIndex === index
                            ? 'bg-blue-600 text-white shadow-md'
                            : answers[questions[index].question_id]
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        aria-label={`Go to question ${index + 1}`}
                      >
                        {index + 1}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>

              {questions.length > 0 && <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 transition-all hover:shadow-md">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        Question {currentQuestionIndex + 1}
                      </span>
                      <span className="text-xs font-semibold bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                        {getQuestionTypeLabel(
                          questions[currentQuestionIndex].question.type as QuestionType
                        )}
                      </span>
                    </div>
                    <div>
                      <Button variant="default" size='lg' onClick={handleReset} disabled={isReseting} className='w-24'>
                        {(isReseting) ? <div className="flex flex-col items-center justify-center gap-4">
                          <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                          : <>
                            Reset
                          </>
                        }
                      </Button>
                    </div>
                  </div>

                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800 leading-relaxed">
                    {questions[currentQuestionIndex].question.question}
                  </h2>

                  <div className="pt-2 text-black">
                    <Question question={questions[currentQuestionIndex]} answers={answers} isLoading={isMutating || isSubmiting || isVideoMutating} handleAnswerChange={handleAnswerChange} handleStopRecording={handleStopRecording} handleNextQuestion={handleNextQuestion} />
                  </div>
                </div>
              </div>}

              {/* Progress and navigation */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex-1">
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between text-sm text-gray-600 px-1">
                      <span className="font-medium">Quiz Progress</span>
                      <span>
                        {/* {Object.keys(answers).length} of {questions.length} questions answered */}
                        {currentQuestionIndex + 1} of {questions.length} questions answered
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                        style={{
                          width: `${(Object.keys(answers).length / questions.length) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                  className="px-6 py-2 flex items-center gap-2 rounded-full transition-all"
                >
                  <ChevronLeft />
                  Previous
                </Button>

                <Button
                  onClick={() => handleNextQuestion()}
                  disabled={(answers[questions[currentQuestionIndex].question_id]?.answer ? false : true) || (isMutating || isSubmiting || isVideoMutating)}
                  variant="outline"
                  className="px-6 py-2 flex items-center gap-2 rounded-full transition-all w-40"
                >
                  {(isMutating || isSubmiting) ? <div className="flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                  </div>
                    : <>
                      Save {currentQuestionIndex == questions.length - 1 ? '' : ' & Next'}
                      <ChevronRight />
                    </>
                  }
                </Button>
              </div>

            </CardContent>
          </Card>
        </>)}

    </div>
  );

}
