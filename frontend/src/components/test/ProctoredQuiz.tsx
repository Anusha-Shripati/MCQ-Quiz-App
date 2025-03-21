// ProctoredQuiz.tsx
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import html2canvas from 'html2canvas';

// Types
type Question = {
  id: number;
  text: string;
};

type Screenshot = {
  timestamp: number;
  image: string;
};

type Violation = {
  type: string;
  timestamp: number;
  details?: string;
};

const QUIZ_CONFIG = {
  timeLimit: 20 * 60,
  screenshotInterval: 20000, // 20 seconds
  maxViolations: 5,
  alertTimeout: 3000
};

const QUESTIONS: Question[] = [
  { id: 1, text: "What is the purpose of JSX in React?" },
  { id: 2, text: "Explain the concept of state in React." },
  { id: 3, text: "What are props in React and how are they used?" },
  { id: 4, text: "Describe the lifecycle methods of a React component." },
  { id: 5, text: "How does React handle events?" },
  { id: 6, text: "What is the difference between functional and class components in React?" }
];

const PROHIBITED_KEYS = [
  'Tab',
  'Alt',
  'Control',
  'Meta',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
];

export default function ProctoredQuiz() {
  const router = useRouter();

  // State
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_CONFIG.timeLimit);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const screenshotIntervalRef = useRef<NodeJS.Timeout>();
  const originalWindowSize = useRef({ width: window.innerWidth, height: window.innerHeight });

  const displayAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), QUIZ_CONFIG.alertTimeout);
  };

  const takeScreenshot = async () => {
    if (!containerRef.current || document.hidden) {
      addViolation({
        type: 'HIDDEN_SCREENSHOT',
        details: 'Window was hidden during screenshot'
      });
      return;
    }
  
    try {
      const canvas = await html2canvas(containerRef.current, { allowTaint: true, useCORS: true });
      const image = canvas.toDataURL('image/jpeg', 0.5);
  
      setScreenshots(prev => [...prev, { timestamp: Date.now(), image }]);
    } catch (error) {
      addViolation({
        type: 'SCREENSHOT_FAILED',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  

  const requestFullScreen = async () => {
    if (!containerRef.current) return;

    try {
      // Only request if not already in fullscreen
      if (!document.fullscreenElement) {
        // Wait for user interaction before requesting fullscreen
        await containerRef.current.requestFullscreen();
        setIsFullScreen(true);
        
        // Update original window size after entering fullscreen
        originalWindowSize.current = {
          width: window.innerWidth,
          height: window.innerHeight
        };
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      // Don't add violation here since it might be a permissions issue
    }
  };
  

  const handleAutoSubmit = async () => {
    try {
      if (isSubmitting) return;
      
      setIsSubmitting(true);
      
      // Take final screenshot
      await takeScreenshot();
      
      // Wait for state updates
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create final state snapshot with current state
      const finalState = {
        answers: { ...answers },
        violations: [...violations],
        screenshots: [...screenshots],
        timeLeft: 0,
        autoSubmitted: true
      };

      console.log('Auto submitting quiz data:', finalState);

      // Cleanup
      if (screenshotIntervalRef.current) {
        clearInterval(screenshotIntervalRef.current);
      }

      localStorage.clear();

      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }

      router.push('/thank-you');
    } catch (error) {
      console.error('Auto-submit failed:', error);
      setIsSubmitting(false);
    }
  };

  const addViolation = (violation: Omit<Violation, 'timestamp'>) => {
    const newViolation: Violation = {
      ...violation,
      timestamp: Date.now()
    };

    setViolations(prev => {
      const updated = [...prev, newViolation];
      if (updated.length >= QUIZ_CONFIG.maxViolations) {
        handleAutoSubmit();
      }
      return updated;
    });

    displayAlert(`Warning: ${violation.type}`);
  };

  // Event handlers
  const handleVisibilityChange = () => {
    if (document.hidden) {
      addViolation({
        type: 'TAB_SWITCH',
        details: 'User switched tabs or minimized window'
      });
      takeScreenshot();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Prevent tab switching
    if (e.key === 'Tab') {
      e.preventDefault();
      addViolation({
        type: 'TAB_KEY_PRESSED',
        details: 'Attempted to use Tab key'
      });
    }

    // Prevent ctrl/cmd + key combinations
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      addViolation({
        type: 'KEYBOARD_SHORTCUT',
        details: `Attempted to use ${e.ctrlKey ? 'Ctrl' : 'Cmd'} + ${e.key}`
      });
    }

    // Prevent function keys
    if (PROHIBITED_KEYS.includes(e.key)) {
      e.preventDefault();
      addViolation({
        type: 'PROHIBITED_KEY',
        details: `Attempted to use ${e.key} key`
      });
    }
  };

  const handleResize = () => {
    if (!document.fullscreenElement) return;
    const { width, height } = originalWindowSize.current;
  
    if (Math.abs(window.innerWidth - width) > 20 || Math.abs(window.innerHeight - height) > 20) {
      addViolation({
        type: 'WINDOW_RESIZE',
        details: 'Detected significant window size change'
      });
    }
  };
  
  

  const handleFullScreenChange = () => {
    if (!document.fullscreenElement) {
      addViolation({
        type: 'FULLSCREEN_EXIT',
        details: 'Exited full screen mode'
      });
      requestFullScreen();
    }
  };

  // Quiz functions
  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    localStorage.setItem('quizAnswers', JSON.stringify({
      ...answers,
      [questionId]: value
    }));
  };

  const submitQuiz = async (auto: boolean = false) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await takeScreenshot();
      
      const finalData = {
        answers,
        violations,
        screenshots,
        timeLeft,
        autoSubmitted: auto
      };

      console.log('Submitting quiz data:', finalData);

      // Cleanup
      if (screenshotIntervalRef.current) {
        clearInterval(screenshotIntervalRef.current);
      }

      localStorage.clear();

      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }

      router.push('/thank-you');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setIsSubmitting(false);
      alert('There was an error submitting your quiz. Please try again.');
    }
  };

  // Effects
  useEffect(() => {
    // Request full screen immediately
    requestFullScreen();

    // Initialize security measures
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleFullScreenChange);

    // Start taking screenshots
    screenshotIntervalRef.current = setInterval(takeScreenshot, QUIZ_CONFIG.screenshotInterval);

    // Load saved progress
    const savedAnswers = localStorage.getItem('quizAnswers');
    const savedTime = localStorage.getItem('quizTimeLeft');

    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
    if (savedTime) {
      setTimeLeft(parseInt(savedTime, 10));
    }

    // Take initial screenshot
    takeScreenshot();

    // Store original window size
    originalWindowSize.current = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      if (screenshotIntervalRef.current) {
        clearInterval(screenshotIntervalRef.current);
      }
    };
  }, []);

  // Timer effect
  useEffect(() => {
    // Skip effect if already submitting
    if (isSubmitting) return;

    let interval: NodeJS.Timeout | null = null;

    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = prevTime - 1;
          localStorage.setItem('quizTimeLeft', String(newTime));
          return newTime;
        });
      }, 1000);
    } else if (timeLeft <= 0) {
      // Handle timer end once
      const handleTimerEnd = async () => {
        if (!isSubmitting) {
          setIsSubmitting(true);
          try {
            // Take final screenshot
            await takeScreenshot();
            
            // Create final state snapshot
            const finalState = {
              answers,
              violations,
              screenshots,
              timeLeft: 0,
              autoSubmitted: true
            };

            console.log('Timer ended, submitting:', finalState);
            
            // Cleanup
            if (screenshotIntervalRef.current) {
              clearInterval(screenshotIntervalRef.current);
            }

            localStorage.clear();

            if (document.fullscreenElement) {
              await document.exitFullscreen();
            }

            router.push('/thank-you');
          } catch (error) {
            console.error('Auto-submit failed:', error);
            setIsSubmitting(false);
          }
        }
      };

      handleTimerEnd();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timeLeft, isSubmitting]);

  // Add a state initialization effect
  useEffect(() => {
    // Load saved state if exists
    const currentState = localStorage.getItem('currentQuizState');
    if (currentState) {
      const parsedState = JSON.parse(currentState);
      setAnswers(parsedState.answers);
      setViolations(parsedState.violations);
      setScreenshots(parsedState.screenshots);
    }
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 p-8">
      <Card className="w-[90vw] max-w-[1200px] mx-auto min-h-[80vh]">
        <CardHeader className="border-b bg-white sticky top-0 z-10 shadow-sm">
          <div className="flex justify-between items-center px-6">
            <CardTitle className="text-2xl font-bold">Proctored Quiz</CardTitle>
            <div className="flex items-center gap-6">
              <div className="text-xl font-semibold text-red-600">
                Time Remaining: {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {QUESTIONS.length}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {showAlert && (
            <Alert variant="destructive">
              <AlertDescription>{alertMessage}</AlertDescription>
            </Alert>
          )}

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {QUESTIONS[currentQuestionIndex].text}
              </h2>
              <Input
                type="text"
                value={answers[QUESTIONS[currentQuestionIndex].id] || ''}
                onChange={(e) => handleAnswerChange(QUESTIONS[currentQuestionIndex].id, e.target.value)}
                placeholder="Type your answer here..."
                className="w-full p-4 text-lg"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-6">
            <div className="text-sm text-gray-600">
              {Object.keys(answers).length} of {QUESTIONS.length} questions answered
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                variant="outline"
                className="px-6"
              >
                Previous
              </Button>

              <Button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(QUESTIONS.length - 1, prev + 1))}
                disabled={currentQuestionIndex === QUESTIONS.length - 1}
                variant="outline"
                className="px-6"
              >
                Next
              </Button>

              <Button
                onClick={() => submitQuiz(false)}
                className="px-6 bg-green-600 hover:bg-green-700 text-white"
              >
                Submit Quiz
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}