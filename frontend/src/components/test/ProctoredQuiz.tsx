import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/form/button';
import { useExamStore } from '@/store/examStore';
import { Answer, IExamQuestion, QuestionType, Violation } from '@/types/exam.types';
import { useCallback, useEffect, useRef, useState } from 'react';
import TestHeader from './TestHeader';
import useSWR from 'swr';
import { examApi, isAxiosError } from '@/lib/api';
import { useRouter } from 'next/navigation';
import useSWRMutation from 'swr/mutation';
import AlertWrapper from './AlertWrapper';
import TestLoading from './TestLoading';
import TestError from './TestError';
import Question from './Question';
import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { BROWSER_KEY, PROHIBITED_COMBINATIONS, PROHIBITED_KEYS, QUIZ_CONFIG } from '@/shared/constants/data';






export default function ProctoredQuiz() {
  const [answers, setAnswers] = useState<Record<string, { question: IExamQuestion, answer: Answer }>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const isSubmittingRef = useRef(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const router = useRouter();
  const violations = useRef<Violation[]>([]);
  // const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setTabSwitchCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const screenshotIntervalRef = useRef<NodeJS.Timeout>();
  const fullscreenElementRef = useRef<Element | null>(null);



  // const [, captureElement] = useScreenshot();


  const originalWindowSize = useRef({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const pingIntervalRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { exam, accessCode, setExam } = useExamStore();
  const [questions, setQuestions] = useState<IExamQuestion[]>([]);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const displayAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }
    alertTimeoutRef.current = setTimeout(() => setShowAlert(false), QUIZ_CONFIG.alertTimeout);
  };

  const { data: examData, isLoading: isExamLoading } = useSWR(`/candidate-exam/${exam?.id}`, (url: string) => examApi.get(url, accessCode), {
    revalidateOnFocus: true,
    revalidateOnMount: true,
    revalidateOnReconnect: true,
    revalidateIfStale: true,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { isMutating, trigger } = useSWRMutation<{ success: boolean; message?: string; data?: { answer: { user_answer: (string | number)[] } } }, any, string, FormData | { question_id: string; user_answer: (string | number)[] }>(
    `/candidate-exam/${exam?.id}/submit-answer`,
    (url: string, { arg }) => examApi.post(url, arg, accessCode)
  )
  const { isMutating: isSubmiting, trigger: submitTrigger } = useSWRMutation(`/candidate-exam/${exam?.id}/finish`, (url: string) => examApi.get(url, accessCode))

  useEffect(() => {
    if (examData) {
      setExam(examData.data);
      const obj: Record<string, { question: IExamQuestion, answer: string | Blob | (string | number)[] }> = {}
      examData.data?.answers?.forEach((a: any) => {
        const question = examData.data?.exam_questions.find((q: IExamQuestion) => q.question_id == a.question_id)

        obj[a.question_id as string] = {
          question: question.question,
          answer: question.question.type == QuestionType.MULTIPLE_SELECT ? a.user_answer : a.user_answer[0]
        }
      })
      setAnswers(obj)
      localStorage.setItem('quizAnswers', JSON.stringify(obj))
      setQuestions(examData.data?.exam_questions || []);
      setTimeLeft(examData.data?.assessment?.duration * 60);
      checkExamStatus();
    }
  }, [examData]);

  // const dataURLtoBlob = (dataURL: string) => {
  //   const arr = dataURL.split(',');
  //   const mimeMatch = arr[0].match(/:(.*?);/);
  //   const mime = mimeMatch ? mimeMatch[1] : '';
  //   const bstr = atob(arr[1]);
  //   let n = bstr.length;
  //   const u8arr = new Uint8Array(n);

  //   while (n--) {
  //     u8arr[n] = bstr.charCodeAt(n);
  //   }

  //   return new Blob([u8arr], { type: mime });
  // }

  const checkExamStatus = async () => {
    if (!exam?.id || !accessCode || !examData.data?.assessment?.duration) return;

    try {
      setIsLoading(true);

      const { data: statusData } = await examApi.get(`/candidate-exam/${exam.id}/status`, accessCode);
      const status = statusData.status;

      let startTime: string | null = null;

      if (status === 'pending') {
        const { data: startData } = await examApi.get(`/candidate-exam/${exam.id}/start`, accessCode);
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


  // const takeScreenshot = async () => {
  //   if (!containerRef.current || document.hidden) {
  //     addViolation({
  //       type: 'HIDDEN_SCREENSHOT',
  //       details: 'Window was hidden during screenshot',
  //     });
  //     return;
  //   }

  //   try {
  //     const image = await captureElement(containerRef.current);
  //     const blob = dataURLtoBlob(image);
  //     const formData = new FormData();
  //     formData.append('file', blob, 'screenshot.png');
  //     formData.append('timestamp', Date.now().toString());
  //     await examApi.post(`/candidate-exam/${exam?.id}/screenshot`, formData, accessCode);
  //   } catch (error) {
  //     console.log(error);
  //     addViolation({
  //       type: 'SCREENSHOT_FAILED',
  //       details: error instanceof Error ? error.message : 'Unknown error',
  //     });
  //   }
  // };

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

      // Only request if not already in fullscreen
      if (!document.fullscreenElement) {
        // Wait for user interaction before requesting fullscreen
        containerRef.current.classList.add('h-screen');
        containerRef.current.classList.add('overflow-auto');
        await containerRef.current.requestFullscreen();
        // setIsFullScreen(true);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      // Don't add violation here since it might be a permissions issue
    }
  };

  const submitViolation = async () => {
    if (violations.current.length === 0) return;
    try {
      await examApi.post(`/candidate-exam/${exam?.id}/submit-violation`, {
        violations: violations.current,
      }, accessCode);
      violations.current = []; // Clear violations after successful submission
    } catch (error) {
      console.error('Error submitting violations:', error);
    }
  }

  const addViolation = (violation: Omit<Violation, 'timestamp'>) => {
    const newViolation: Violation = {
      ...violation,
      timestamp: Date.now(),
    };

    violations.current = [...violations.current, newViolation];

    if (violations.current.length >= QUIZ_CONFIG.maxViolations) {
      // submitQuiz();
    }
    displayAlert(`Warning: ${violation.details}`);

  };

  // Event handlers
  // const handleVisibilityChange = useCallback(() => {
  //   if (document.hidden) {
  //     setTabSwitchCount((prev) => {
  //       const newCount = prev + 1;
  //       if (newCount > 5) {
  //         // submitQuiz();
  //       }
  //       addViolation({
  //         type: 'TAB_SWITCH',
  //         details: 'User switched tabs or minimized window',
  //       });

  //       displayAlert(`WARNING: Tab switching detected! This is violation ${newCount} of 5.`);
  //       return newCount;


  //   });

  //     // Play audio alert to notify user
  //     if (audioRef.current) {
  //       audioRef.current.play()
  //     }

  //     // Force window to regain focus using a combination of methods
  //     try {
  //       window.focus();
  //       // Attempt to create a subtle window movement to regain focus
  //       window.moveBy(1, 0);
  //       window.moveBy(-1, 0);
  //     } catch (e) {
  //       console.error('Could not force focus:', e);
  //     }
  //   }
  // },[tabSwitchCount]);

  const handleKeyDown = (e: KeyboardEvent) => {
    // Allow F11 for fullscreen
    
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
    console.log(e);
    
    console.log(BROWSER_KEY.includes(e.key));
    
    if (
      (e.ctrlKey || e.metaKey) && BROWSER_KEY.includes(e.key)) {
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
      setTabSwitchCount((prev) => {
        const newCount = prev + 1;
        if (newCount > 5) {
          // submitQuiz();
        }
        displayAlert(`WARNING: Tab switching detected! This is violation ${newCount} of 5.`);
        return newCount;
      });

      addViolation({
        type: 'WINDOW_FOCUS_LOST',
        details: 'User switched to another window',
      });

      // takeScreenshot();

      // Play audio alert
      if (audioRef.current) {
        audioRef.current.play()
      }
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
      await submitTrigger()
      // await takeScreenshot();
      // // Get access code from URL for submission or use the provided accessCode
      // let quizAccessCode = accessCode || '';
      // // If not provided as prop, try to get from URL
      // if (!quizAccessCode) {
      //   const urlParts = window.location.pathname.split('/');
      //   quizAccessCode = urlParts[urlParts.length - 1];
      // }
      // Convert answers to the format expected by the API
      // const formattedAnswers = Object.entries(answers).map(
      // 	([questionId, answer]) => ({
      // 		questionId,
      // 		answer,
      // 	})
      // );
      // Create submission data
      // const submissionData = {
      // 	answers: formattedAnswers,
      // 	violations,
      // 	screenshots,
      // };
      // Submit exam using the access code and candidateApi
      // const result = await candidateApi.submitExam(quizAccessCode, submissionData);
      // if (!result.success) {
      // 	throw new Error(result.message || 'Failed to submit exam');
      // }
      // Cleanup
      // if (screenshotIntervalRef.current) {
      //   clearInterval(screenshotIntervalRef.current);
      // }
      // localStorage.clear();
      // if (document.fullscreenElement) {
      //   await document.exitFullscreen();
      // }
      router.push('/thank-you');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setIsSubmitting(false);
      setShowAlert(true)
      setAlertMessage(isAxiosError(error) ? error.response?.data.message : 'An error occurred')
    }
  };

  const handleTimerEnd = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      await submitTrigger()
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
    }, 10000);

    // screenshotIntervalRef.current = setInterval(takeScreenshot, QUIZ_CONFIG.screenshotInterval);

    // Store original window size
    originalWindowSize.current = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    setTabSwitchCount(0);

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
    // document.addEventListener('visibilitychange', handleVisibilityChange);
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
      // document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, []);


  const handleReset = () => {
    const current_question = questions[currentQuestionIndex]
    setAnswers((prev) => ({
      ...prev,
      [current_question.question_id]: { question: current_question, answer: '' },
    }));

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
        if (recordingUrl === existingAnswer) {
          goToNextQuestion();
          return;
        }

        const formData = new FormData();
        formData.append('question_id', questionId);
        formData.append('file', recordingBlob as Blob);
        const response = await trigger(formData)
        if (response.success) {

          const userAnswer = response.data?.answer?.user_answer?.[0] as string;

          setAnswers((prev) => ({
            ...prev,
            [questionId]: {
              question: current,
              answer: userAnswer,
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

  // if (accessError) {
  //   return (
  //   );
  // }

  // if (isLoading|| isExamLoading || isMutating || isSubmiting ) {
  //   return (
  //   );
  // }
  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8"
    >
      {accessError ? (
        <TestError accessError={accessError} errorTitle="Access Denied" />
      ) : (isLoading || isExamLoading) ? (
        <TestLoading />
      ) : (
        <>

          <AlertWrapper showAlert={showAlert} alertMessage={alertMessage} onClose={() => setShowAlert(false)} />

          <audio src="/alert.mp3" ref={audioRef} style={{ display: 'none' }} />

          <Card className="w-[95vw] max-w-[1200px] mx-auto min-h-[85vh] shadow-xl border-0 rounded-xl overflow-hidden bg-white/95 backdrop-blur-sm">
            <TestHeader timeLeft={timeLeft} currentQuestionIndex={currentQuestionIndex} totalQuestion={questions.length || 0} handleTimerEnd={handleTimerEnd} />

            <CardContent className="p-4 md:p-8 space-y-6">

              <div className="flex flex-wrap gap-2 justify-center">
                {questions?.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${currentQuestionIndex === index
                      ? 'bg-blue-600 text-white shadow-md'
                      : answers[q.question_id]
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    aria-label={`Go to question ${index + 1}`}
                  >
                    {index + 1}
                  </button>
                ))}
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
                      <Button variant="default" size='lg' onClick={handleReset}>Reset</Button>
                    </div>
                  </div>

                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800 leading-relaxed">
                    {questions[currentQuestionIndex].question.question}
                  </h2>

                  <div className="pt-2 text-black">
                    <Question question={questions[currentQuestionIndex]} answers={answers} handleAnswerChange={handleAnswerChange} handleStopRecording={handleStopRecording} handleNextQuestion={handleNextQuestion} />
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
                  disabled={(answers[questions[currentQuestionIndex].question_id]?.answer ? false : true) || (isMutating || isSubmiting)}
                  variant="outline"
                  className="px-6 py-2 flex items-center gap-2 rounded-full transition-all"
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

              <div className="flex justify-center pt-2">
                <Button
                  onClick={() => submitQuiz()}
                  disabled={Object.keys(answers).length !== questions.length || isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-medium rounded-full shadow-sm hover:shadow transition-all flex items-center gap-2"
                >{(isMutating || isSubmiting) ? <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                  : <>
                    Submit Quiz
                    <Check />
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







// useEffect(() => {
//   const validateAccess = async () => {
//     try {
//       setIsLoading(true);

//       let quizAccessCode = accessCode || '';

//       if (!quizAccessCode) {
//         const urlParts = window.location.pathname.split('/');
//         quizAccessCode = urlParts[urlParts.length - 1];
//       }

//       if (!quizAccessCode) {
//         setAccessError('Invalid exam access. Missing access code.');
//         setIsLoading(false);
//         return;
//       }

//       // Set exam data and questions
//       // const examData = data.data;

//       // // Update time limit based on exam data
//       // if (examData.end_time) {
//       // 	const endTime = new Date(examData.end_time).getTime();
//       // 	const now = new Date().getTime();
//       // 	const remainingTime = Math.max(0, Math.floor((endTime - now) / 1000));
//       // 	setTimeLeft(remainingTime);
//       // }

//       // If all is good, initialize the exam
//       setIsLoading(false);
//     } catch (error) {
//       console.error('Error validating exam access:', error);
//       setAccessError('Error accessing exam. Please try again or contact support.');
//       setIsLoading(false);
//     }
//   };

//   validateAccess();
// }, [accessCode]);


// const renderQuestion = (question: IExamQuestion) => {
//   switch (question.question.type) {
//     case QuestionType.MCQ:
//       return (
//         <RadioGroup
//           value={answers[question.question_id]?.answer as string}
//           onValueChange={(value) => handleAnswerChange(question, value)}
//           className="space-y-4"
//         >
//           {question.question.options?.map((option, idx) => (
//             <div key={idx} className="flex items-center space-x-3">
//               <Radio value={option} id={`option-${question.question_id}-${idx}`} />
//               <label
//                 htmlFor={`option-${question.question_id}-${idx}`}
//                 className="text-lg text-gray-800 cursor-pointer"
//               >
//                 {option}
//               </label>
//             </div>
//           ))}
//         </RadioGroup>
//       );
//     case QuestionType.VIDEO:
//       return (
//         <VideoRecorderQuestion question={question} answers={answers} onRecordingStop={(blob, url) => handleStopRecording(blob, url)} onRecordingComplete={() => handleNextQuestion()} />
//       );
//     case QuestionType.MULTIPLE_SELECT:
//       return (
//         <div className="space-y-4">
//           {question.question.options?.map((option, idx) => {
//             const currentAnswers = answers[question.question_id]
//               ? (answers[question.question_id]?.answer as (string | number)[])
//               : [];

//             return (
//               <div key={idx} className="flex items-center space-x-3">
//                 <Checkbox
//                   id={`option-${question.question_id}-${idx}`}
//                   checked={currentAnswers.includes(option)}
//                   onCheckedChange={(checked) => {
//                     let newAnswers: (string | number)[];

//                     if (!checked) {
//                       newAnswers = currentAnswers.filter((a) => a !== option);
//                     } else {
//                       newAnswers = [...currentAnswers, option];
//                     }
//                     handleAnswerChange(question, newAnswers);
//                   }}
//                 />
//                 <label
//                   htmlFor={`option-${question.question_id}-${idx}`}
//                   className="text-lg text-gray-800 cursor-pointer"
//                 >
//                   {option}
//                 </label>
//               </div>
//             );
//           })}
//         </div>
//       );

//     case QuestionType.TEXT:
//       return (
//         <Textarea
//           value={(answers[question.question_id]?.answer as string) || ''}
//           onChange={(e) => handleAnswerChange(question, e.target.value)}
//           placeholder="Type your answer here..."
//           className="min-h-[120px] text-lg"
//         />
//       );

//     case QuestionType.CODE_SNIPPET:
//       return (
//         <div className="space-y-2">
//           <Textarea
//             value={(answers[question.question_id]?.answer as string) || ''}
//             onChange={(e) => handleAnswerChange(question, e.target.value)}
//             placeholder="Write your code here..."
//             className="min-h-[200px] font-mono text-black text-base"
//           />
//           <div className="text-sm text-gray-500">
//             Tip: Use proper indentation and comments where necessary
//           </div>
//         </div>
//       );

//     case QuestionType.CODE_EDITOR:
//       return (
//         <div className="space-y-2">
//           <EditorPage
//             onChange={(value) => handleAnswerChange(question, value)}
//             value={(answers[question.question_id]?.answer as string) || ''}
//           />
//           <div className="text-sm text-gray-500">
//             Tip: Use proper indentation and comments where necessary
//           </div>
//         </div>
//       );

//     default:
//       return <div className="text-red-500">Unsupported question type</div>;
//   }
// };
