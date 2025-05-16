import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/form/button';
import { useExamStore } from '@/store/examStore';
import { IExamQuestion, QuestionType } from '@/types/exam.types';
// import html2canvas from 'html2canvas';
// import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Checkbox } from '../ui/form/checkbox';
import { Radio, RadioGroup } from '../ui/form/radio';
import { Textarea } from '../ui/form/textarea';
import { VideoRecorderQuestion } from './VideoRecorderQuestion';
import TestHeader from './TestHeader';
import useSWR from 'swr';
import { examApi, isAxiosError } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// type Screenshot = {
//   timestamp: number;
//   image: string;
// };

type Violation = {
  type: string;
  timestamp: number;
  details?: string;
};

const QUIZ_CONFIG = {
  screenshotInterval: 20000,
  maxViolations: 3,
  alertTimeout: 5000,
};

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

export default function ProctoredQuiz() {
  const [answers, setAnswers] = useState<Record<string, { question: IExamQuestion, answer: string | Blob | (string | number)[] }>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const isSubmittingRef = useRef(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  // const [violations, setViolations] = useState<Violation[]>([]);
  // const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  // const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const screenshotIntervalRef = useRef<NodeJS.Timeout>();
  const originalWindowSize = useRef({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const pingIntervalRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { exam, accessCode, setExam } = useExamStore();
  const [questions, setQuestions] = useState<IExamQuestion[]>([]);

  const displayAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), QUIZ_CONFIG.alertTimeout);
  };

  const { data: examData, isLoading: isExamLoading } = useSWR(`/candidate-exam/${exam?.id}`, (url: string) => examApi.get(url, accessCode))

  useEffect(() => {
    if (examData) {
      setExam(examData.data);
      console.log('examData.data.exam', examData?.data?.exam_questions);
      setQuestions(examData.data?.exam_questions || []);
      setTimeLeft(examData.data?.assessment?.duration * 60);
      checkExamStatus();

    }
  }, [examData]);

  const checkExamStatus = async () => {
    try {
      const data = await examApi.get(`/candidate-exam/${exam?.id}/status`, accessCode)
      if (data.data.status == 'pending') {
        const startData = await examApi.get(`/candidate-exam/${exam?.id}/start`, accessCode)
        const remainingTime = (examData.data?.assessment?.duration * 60) - (new Date().getTime() - new Date(startData.data.startTime).getTime()) / 1000;
        setTimeLeft(remainingTime);
        if (remainingTime <= 0) {
          router.push('/thank-you');
        }
      } else if (data.data.status == 'completed') {
        router.push('/thank-you');
      } else if (data.data.status == 'in_progress') {
        const remainingTime = (examData.data?.assessment?.duration * 60) - (new Date().getTime() - new Date(data.data.startTime).getTime()) / 1000;
        setTimeLeft(remainingTime);
        if (remainingTime <= 0) {
          router.push('/thank-you');
        }
      }
    } catch (error) {
      console.log('error', error);
      setAccessError(isAxiosError(error) ? error?.response?.data.message : 'Unknown error');
    }
  }



  const takeScreenshot = async () => {
    if (!containerRef.current || document.hidden) {
      addViolation({
        type: 'HIDDEN_SCREENSHOT',
        details: 'Window was hidden during screenshot',
      });
      return;
    }

    try {
      // const canvas = await html2canvas(containerRef.current, {
      //   allowTaint: true,
      //   useCORS: true,
      // });
      // const image = canvas.toDataURL('image/jpeg', 0.5);
      // setScreenshots((prev) => [...prev, { timestamp: Date.now(), image }]);
    } catch (error) {
      addViolation({
        type: 'SCREENSHOT_FAILED',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const renderQuestion = (question: IExamQuestion) => {
    switch (question.question.type) {
      case QuestionType.MCQ:
        return (
          <RadioGroup
            value={answers[question.id]?.answer as string}
            onValueChange={(value) => handleAnswerChange(question, value)}
            className="space-y-4"
          >
            {question.question.options?.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <Radio value={option} id={`option-${question.id}-${idx}`} />
                <label
                  htmlFor={`option-${question.id}-${idx}`}
                  className="text-lg text-gray-800 cursor-pointer"
                >
                  {option}
                </label>
              </div>
            ))}
          </RadioGroup>
        );
      case QuestionType.VIDEO:
        return (
          <VideoRecorderQuestion handleAnswerChange={handleAnswerChange} question={question} onRecordingComplete={() =>
            setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
          } />
        );
      case QuestionType.MULTIPLE_SELECT:
        return (
          <div className="space-y-4">
            {question.question.options?.map((option, idx) => {
              const currentAnswers = answers[question.id]
                ? (answers[question.id]?.answer as (string | number)[])
                : [];
              console.log('currentAnswers', currentAnswers);

              return (
                <div key={idx} className="flex items-center space-x-3">
                  <Checkbox
                    id={`option-${question.id}-${idx}`}
                    checked={currentAnswers.includes(option)}
                    onCheckedChange={(checked) => {
                      let newAnswers: (string | number)[];
                      if (!checked) {
                        newAnswers = currentAnswers.filter((a) => a !== option);
                      } else {
                        newAnswers = [...currentAnswers, option];
                      }
                      handleAnswerChange(question, newAnswers);
                    }}
                  />
                  <label
                    htmlFor={`option-${question.id}-${idx}`}
                    className="text-lg text-gray-800 cursor-pointer"
                  >
                    {option}
                  </label>
                </div>
              );
            })}
          </div>
        );

      case QuestionType.TEXT:
        return (
          <Textarea
            value={(answers[question.id]?.answer as string) || ''}
            onChange={(e) => handleAnswerChange(question, e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-[120px] text-lg"
          />
        );

      case QuestionType.CODE_SNIPPET:
        return (
          <div className="space-y-2">
            <Textarea
              value={(answers[question.id]?.answer as string) || ''}
              onChange={(e) => handleAnswerChange(question, e.target.value)}
              placeholder="Write your code here..."
              className="min-h-[200px] font-mono text-black text-base"
            />
            <div className="text-sm text-gray-500">
              Tip: Use proper indentation and comments where necessary
            </div>
          </div>
        );

      default:
        return <div className="text-red-500">Unsupported question type</div>;
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
        await containerRef.current.requestFullscreen();
        // setIsFullScreen(true);

        // Update original window size after entering fullscreen
        originalWindowSize.current = {
          width: window.innerWidth,
          height: window.innerHeight,
        };
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      // Don't add violation here since it might be a permissions issue
    }
  };

  const handleAutoSubmit = async () => {
    // try {
    //   if (isSubmitting) return;
    //   setIsSubmitting(true);
    //   // Take final screenshot
    //   await takeScreenshot();
    //   // Wait for state updates
    //   await new Promise(resolve => setTimeout(resolve, 1000));
    //   // Create final state snapshot with current state
    //   const finalState = {
    //     answers: { ...answers },
    //     violations: [...violations],
    //     screenshots: [...screenshots],
    //     timeLeft: 0,
    //     autoSubmitted: true
    //   };
    //   console.log('Auto submitting quiz data:', finalState);
    //   // Cleanup
    //   if (screenshotIntervalRef.current) {
    //     clearInterval(screenshotIntervalRef.current);
    //   }
    //   localStorage.clear();
    //   if (document.fullscreenElement) {
    //     await document.exitFullscreen();
    //   }
    //   // router.push('/thank-you');
    // } catch (error) {
    //   console.error('Auto-submit failed:', error);
    //   setIsSubmitting(false);
    // }
  };

  const addViolation = (violation: Omit<Violation, 'timestamp'>) => {
    // const newViolation: Violation = {
    //   ...violation,
    //   timestamp: Date.now(),
    // };

    // setViolations((prev) => {
    //   const updated = [...prev, newViolation];
    //   if (updated.length >= QUIZ_CONFIG.maxViolations) {
    //     handleAutoSubmit();
    //   }
    //   return updated;
    // });

    displayAlert(`Warning: ${violation.type}`);
  };

  // Event handlers
  const handleVisibilityChange = () => {
    if (document.hidden) {
      setTabSwitchCount((prev) => prev + 1);
      addViolation({
        type: 'TAB_SWITCH',
        details: 'User switched tabs or minimized window',
      });
      takeScreenshot();

      // Show specific alert for tab switching
      displayAlert('WARNING: Tab switching detected! This violation has been recorded.');

      // Play audio alert to notify user
      if (audioRef.current) {
        audioRef.current.play().catch((e) => console.error('Error playing audio:', e));
      }

      // Force window to regain focus using a combination of methods
      try {
        window.focus();
        // Attempt to create a subtle window movement to regain focus
        window.moveBy(1, 0);
        window.moveBy(-1, 0);
      } catch (e) {
        console.error('Could not force focus:', e);
      }

      if (tabSwitchCount >= 2) {
        handleAutoSubmit();
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
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
  };

  const handleResize = () => {
    if (!document.fullscreenElement) return;
    const { width, height } = originalWindowSize.current;

    if (Math.abs(window.innerWidth - width) > 20 || Math.abs(window.innerHeight - height) > 20) {
      addViolation({
        type: 'WINDOW_RESIZE',
        details: 'Detected significant window size change',
      });
    }
  };

  const handleFullScreenChange = () => {
    if (!document.fullscreenElement) {
      addViolation({
        type: 'FULLSCREEN_EXIT',
        details: 'Exited full screen mode',
      });
      requestFullScreen();
    }
  };

  const handleWindowFocus = () => {
    if (!document.hasFocus()) {
      setTabSwitchCount((prev) => prev + 1);
      addViolation({
        type: 'WINDOW_FOCUS_LOST',
        details: 'User switched to another window',
      });
      takeScreenshot();

      // Play audio alert
      if (audioRef.current) {
        audioRef.current.play().catch((e) => console.error('Error playing audio:', e));
      }

      if (tabSwitchCount >= 2) {
        handleAutoSubmit();
      }
    }
  };

  // Quiz functions
  const handleAnswerChange = useCallback((question: IExamQuestion, value: string | Blob | (string | number)[]) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: { question, answer: value },
    }));
    localStorage.setItem(
      'quizAnswers',
      JSON.stringify({
        ...answers,
        [question.id]: { question, answer: value },
      })
    );
  }, [answers]);

  const submitQuiz = async () => {
    if (isSubmitting) return;
    console.log('answers', answers);
    try {
      // setIsSubmitting(true);
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
      // router.push('/thank-you');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setIsSubmitting(false);
      alert('There was an error submitting your quiz. Please try again.');
    }
  };

  const handleTimerEnd = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    try {
      // await takeScreenshot();  // uncomment if used
      const finalState = {
        // answers,
        // violations,
        // screenshots,
        timeLeft: 0,
        autoSubmitted: true,
      };
      console.log('Timer ended, submitting:', finalState);

      // Cleanup
      // if (screenshotIntervalRef.current) clearInterval(screenshotIntervalRef.current);
      // localStorage.clear();

      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      router.push('/thank-you');  // use router if available
    } catch (error) {
      console.error('Auto-submit failed:', error);
      isSubmittingRef.current = false;
    }
  };


  useEffect(() => {
    const validateAccess = async () => {
      try {
        setIsLoading(true);

        let quizAccessCode = accessCode || '';

        if (!quizAccessCode) {
          const urlParts = window.location.pathname.split('/');
          quizAccessCode = urlParts[urlParts.length - 1];
        }

        if (!quizAccessCode) {
          setAccessError('Invalid exam access. Missing access code.');
          setIsLoading(false);
          return;
        }

        // Set exam data and questions
        // const examData = data.data;

        // // Update time limit based on exam data
        // if (examData.end_time) {
        // 	const endTime = new Date(examData.end_time).getTime();
        // 	const now = new Date().getTime();
        // 	const remainingTime = Math.max(0, Math.floor((endTime - now) / 1000));
        // 	setTimeLeft(remainingTime);
        // }

        // If all is good, initialize the exam
        setIsLoading(false);
      } catch (error) {
        console.error('Error validating exam access:', error);
        setAccessError('Error accessing exam. Please try again or contact support.');
        setIsLoading(false);
      }
    };

    validateAccess();
  }, [accessCode]);

  // Effects
  useEffect(() => {

    // Request full screen immediately
    requestFullScreen();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowFocus);

    window.addEventListener('beforeunload', (e) => {
      // Cancel the event
      e.preventDefault();
      // Chrome requires returnValue to be set
      e.returnValue = '';

      // Record violation if user tries to close/refresh tab
      addViolation({
        type: 'TAB_CLOSE_ATTEMPT',
        details: 'User attempted to close or refresh the tab',
      });

      // Display alert message
      displayAlert('WARNING: Attempting to close or refresh the tab is not allowed!');

      // Return value for older browsers
      return '';
    });

    // Disable right-click context menu
    document.addEventListener(
      'contextmenu',
      (e) => {
        e.preventDefault();
        addViolation({
          type: 'CONTEXT_MENU',
          details: 'Attempted to open context menu',
        });
        return false;
      },
      true
    );

    // Start taking screenshots
    screenshotIntervalRef.current = setInterval(takeScreenshot, QUIZ_CONFIG.screenshotInterval);

    // Load saved progress
    const savedAnswers = localStorage.getItem('quizAnswers');
    // const savedTime = localStorage.getItem('quizTimeLeft');

    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }

    // if (savedTime) {
    //   setTimeLeft(parseInt(savedTime, 10));
    // }

    // Take initial screenshot
    takeScreenshot();

    // Store original window size
    originalWindowSize.current = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowFocus);
      window.removeEventListener('beforeunload', (e) => e.preventDefault());
      document.removeEventListener('contextmenu', (e) => e.preventDefault(), true);
      if (screenshotIntervalRef.current) {
        clearInterval(screenshotIntervalRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, []);


  useEffect(() => {
    const currentState = localStorage.getItem('currentQuizState');
    if (currentState) {
      const parsedState = JSON.parse(currentState);
      setAnswers(parsedState.answers);
      // setViolations(parsedState.violations);
      // setScreenshots(parsedState.screenshots);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Card className="w-[90%] max-w-md p-6">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
            <p className="text-gray-600">Loading exam...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Card className="w-[90%] max-w-md p-6">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{accessError}</AlertDescription>
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

  console.log('Quiz rendered');
  if (isExamLoading) {
    return (
      <div className="w-screen min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-gray-600 animate-pulse">Loading your test environment...</p>
      </div>
    );
  }
  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8"
    >
      {/* Hidden audio element for alert sounds */}
      <audio src="/alert.mp3" ref={audioRef} style={{ display: 'none' }} />

      <Card className="w-[95vw] max-w-[1200px] mx-auto min-h-[85vh] shadow-xl border-0 rounded-xl overflow-hidden bg-white/95 backdrop-blur-sm">
        <TestHeader timeLeft={timeLeft} currentQuestionIndex={currentQuestionIndex} totalQuestion={questions.length || 0} handleTimerEnd={handleTimerEnd} />


        <CardContent className="p-4 md:p-8 space-y-6">
          <AlertWrapper showAlert={showAlert} alertMessage={alertMessage} />

          {/* Question navigation pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {questions?.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${currentQuestionIndex === index
                    ? 'bg-blue-600 text-white shadow-md'
                    : answers[q.id]
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
              </div>

              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 leading-relaxed">
                {questions[currentQuestionIndex].question.question}
              </h2>

              <div className="pt-2 text-black">
                {renderQuestion(questions[currentQuestionIndex])}
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Previous
            </Button>

            <Button
              onClick={() =>
                setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
              }
              disabled={currentQuestionIndex === questions.length - 1}
              variant="outline"
              className="px-6 py-2 flex items-center gap-2 rounded-full transition-all"
            >
              Next
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </div>

          <div className="flex justify-center pt-2">
            <Button
              onClick={() => submitQuiz()}
              disabled={Object.keys(answers).length !== questions.length || isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-medium rounded-full shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              Submit Quiz
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    // <div
    //   ref={containerRef}
    //   className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8"
    // >
    //   {/* Hidden audio element for alert sounds */}
    //   <audio src="/alert.mp3" ref={audioRef} style={{ display: 'none' }} />

    //   <Card className="w-[95vw] max-w-[1200px] mx-auto min-h-[85vh] shadow-xl border-0 rounded-xl overflow-hidden bg-white/95 backdrop-blur-sm">
    //     <CardHeader className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm px-6 py-5">
    //       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
    //         <div className="flex items-center gap-3">
    //           <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
    //             <svg
    //               xmlns="http://www.w3.org/2000/svg"
    //               className="h-5 w-5 text-white"
    //               viewBox="0 0 20 20"
    //               fill="currentColor"
    //             >
    //               <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
    //             </svg>
    //           </div>
    //           <CardTitle className="text-2xl font-bold text-blue-800 tracking-tight">
    //             Proctored Exam
    //           </CardTitle>
    //         </div>

    //         <div className="flex flex-col sm:flex-row items-center gap-4">
    //           <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full border border-red-200 shadow-sm">
    //             <svg
    //               xmlns="http://www.w3.org/2000/svg"
    //               className="h-5 w-5"
    //               viewBox="0 0 20 20"
    //               fill="currentColor"
    //             >
    //               <path
    //                 fillRule="evenodd"
    //                 d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
    //                 clipRule="evenodd"
    //               />
    //             </svg>
    //             <span className="text-xl font-mono font-semibold tabular-nums">
    //               {formatTime(timeLeft)}
    //             </span>
    //           </div>
    //           <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-200 shadow-sm">
    //             <svg
    //               xmlns="http://www.w3.org/2000/svg"
    //               className="h-4 w-4"
    //               viewBox="0 0 20 20"
    //               fill="currentColor"
    //             >
    //               <path
    //                 fillRule="evenodd"
    //                 d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
    //                 clipRule="evenodd"
    //               />
    //             </svg>
    //             <span className="font-medium">
    //               Q{currentQuestionIndex + 1} of {questions.length}
    //             </span>
    //           </div>
    //         </div>
    //       </div>
    //     </CardHeader>

    //     <CardContent className="p-4 md:p-8 space-y-6">
    //       {showAlert && (
    //         <Alert
    //           variant="destructive"
    //           className="border-l-4 border-l-red-700 slide-in-from-top-5 duration-300"
    //         >
    //           <div className="flex items-center gap-2">
    //             <svg
    //               xmlns="http://www.w3.org/2000/svg"
    //               className="h-5 w-5"
    //               viewBox="0 0 20 20"
    //               fill="currentColor"
    //             >
    //               <path
    //                 fillRule="evenodd"
    //                 d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
    //                 clipRule="evenodd"
    //               />
    //             </svg>
    //             <AlertDescription className="font-medium">{alertMessage}</AlertDescription>
    //           </div>
    //         </Alert>
    //       )}

    //       {/* Quick navigation pills */}
    //       <div className="flex flex-wrap gap-2 justify-center">
    //         {questions?.map((q, index) => (
    //           <button
    //             key={q.id}
    //             onClick={() => setCurrentQuestionIndex(index)}
    //             className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
    //               currentQuestionIndex === index
    //                 ? 'bg-blue-600 text-white shadow-md'
    //                 : answers[q.id]
    //                   ? 'bg-green-100 text-green-800 border border-green-200'
    //                   : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    //             }`}
    //             aria-label={`Go to question ${index + 1}`}
    //           >
    //             {index + 1}
    //           </button>
    //         ))}
    //       </div>

    //       <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 transition-all hover:shadow-md">
    //         <div className="space-y-6">
    //           <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
    //             Question {currentQuestionIndex + 1}
    //           </span>

    //           <h2 className="text-xl md:text-2xl font-semibold text-gray-800 leading-relaxed">
    //             {questions[currentQuestionIndex].question.question}
    //           </h2>

    //           <div className="pt-4">
    //             <div className="flex justify-between mb-2">
    //               {/* <label className="block text-sm font-medium text-gray-600">Your Answer:</label>
    //               <span className="text-sm text-gray-500">
    //                 {answers[questions[currentQuestionIndex]]?.length || 0} characters
    //               </span> */}
    //             </div>
    //             {/* <Input
    //               type="text"
    //               value={answers[questions[currentQuestionIndex].id] || ''}
    //               onChange={(e) =>
    //                 handleAnswerChange(questions[currentQuestionIndex].id, e.target.value)
    //               }
    //               placeholder="Type your answer here..."
    //               className="w-full p-4 text-lg rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all"
    //             /> */}
    //           </div>
    //         </div>
    //       </div>

    //       {/* Progress indicator */}
    //       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
    //         <div className="flex flex-col space-y-2">
    //           <div className="flex justify-between text-sm text-gray-600 px-1">
    //             <span className="font-medium">Quiz Progress</span>
    //             <span>
    //               {Object.keys(answers).length} of {questions.length} questions answered
    //             </span>
    //           </div>
    //           <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
    //             <div
    //               className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
    //               style={{
    //                 width: `${(Object.keys(answers).length / questions.length) * 100}%`,
    //               }}
    //             ></div>
    //           </div>
    //         </div>
    //       </div>

    //       <div className="flex flex-col sm:flex-row justify-between items-center pt-3 gap-4">
    //         <div className="flex gap-3 order-2 sm:order-1 w-full sm:w-auto">
    //           <Button
    //             onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
    //             disabled={currentQuestionIndex === 0}
    //             variant="outline"
    //             className="px-6 py-2 flex items-center gap-2 rounded-full transition-all"
    //           >
    //             <svg
    //               xmlns="http://www.w3.org/2000/svg"
    //               className="h-4 w-4"
    //               viewBox="0 0 20 20"
    //               fill="currentColor"
    //             >
    //               <path
    //                 fillRule="evenodd"
    //                 d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
    //                 clipRule="evenodd"
    //               />
    //             </svg>
    //             Previous
    //           </Button>

    //           <Button
    //             onClick={() =>
    //               setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
    //             }
    //             disabled={currentQuestionIndex === questions.length - 1}
    //             variant="outline"
    //             className="px-6 py-2 flex items-center gap-2 rounded-full transition-all"
    //           >
    //             Next
    //             <svg
    //               xmlns="http://www.w3.org/2000/svg"
    //               className="h-4 w-4"
    //               viewBox="0 0 20 20"
    //               fill="currentColor"
    //             >
    //               <path
    //                 fillRule="evenodd"
    //                 d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
    //                 clipRule="evenodd"
    //               />
    //             </svg>
    //           </Button>
    //         </div>

    //         <Button
    //           onClick={() => submitQuiz()}
    //           className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-medium rounded-full shadow-sm hover:shadow transition-all flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto"
    //         >
    //           Submit Quiz
    //           <svg
    //             xmlns="http://www.w3.org/2000/svg"
    //             className="h-5 w-5"
    //             viewBox="0 0 20 20"
    //             fill="currentColor"
    //           >
    //             <path
    //               fillRule="evenodd"
    //               d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
    //               clipRule="evenodd"
    //             />
    //           </svg>
    //         </Button>
    //       </div>
    //     </CardContent>
    //   </Card>
    // </div>
  );
}



const AlertWrapper = ({ showAlert, alertMessage }: { showAlert: boolean; alertMessage: string }) => {
  if (!showAlert) return null;

  return (
    <Alert
      variant="destructive"
      className="border-l-4 border-l-red-700 slide-in-from-top-5 duration-300"
    >
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <AlertDescription className="font-medium">{alertMessage}</AlertDescription>
      </div>
    </Alert>
  );
};
