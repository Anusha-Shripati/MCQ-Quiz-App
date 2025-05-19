import React, { useEffect, useRef, useState } from 'react'
import { CardHeader, CardTitle } from '../ui/card'

function TestHeader({ timeLeft, currentQuestionIndex, totalQuestion, handleTimerEnd }: { timeLeft: number, currentQuestionIndex: number, totalQuestion: number, handleTimerEnd: () => void }) {


    const [seconds, setSeconds] = useState(0);
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        if(mins == 0 && secs == 0){
            return 'Time Up!';
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    useEffect(() => {
        if (timeLeft - seconds <= 0) {
            handleTimerEnd();
        }
    }, [seconds, timeLeft, handleTimerEnd]);
    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <CardHeader className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm px-6 py-5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                        </svg>
                    </div>
                    <CardTitle className="text-2xl font-bold text-blue-800 tracking-tight">
                        Proctored Exam
                    </CardTitle>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full border border-red-200 shadow-sm">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span className="text-xl font-mono font-semibold tabular-nums">
                            {formatTime(timeLeft - seconds)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-200 shadow-sm">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span className="font-medium">
                            Q{currentQuestionIndex + 1} of {totalQuestion}
                        </span>
                    </div>
                </div>
            </div>
        </CardHeader>
    )
}

export default TestHeader