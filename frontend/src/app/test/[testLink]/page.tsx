"use client";
import BasicInfoForm from "@/components/test/BasicInfo";
import ProctoredQuiz from "@/components/test/ProctoredQuiz";
import { VideoRecorder } from "@/components/test/VideoRecorder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

const QuizPage = () => {
    const [step, setStep] = useState('basicInfo'); // 'basicInfo' | 'videoRecording' | 'quiz'
   
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft]);


    const handleNextStep = () => {
        setStep('videoRecording');
    };

    const handleRecordingComplete = (recordedChunks:Blob[]) => {
        console.log('Recording complete:', recordedChunks);
        setStep('quiz');
    };

    const renderBasicInfo = () => (
      <BasicInfoForm handleBasicInfoSubmit={handleNextStep}/>
    );

    const renderVideoRecording = () => (
        <Card className="mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold text-center">
                    Record Your Introduction
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[60%]">
                <VideoRecorder onRecordingComplete={handleRecordingComplete} />
            </CardContent>
        </Card>
    );

    return (
        <div className="flex justify-center items-center w-screen h-screen bg-gray-50 p-8">
            {step === 'basicInfo' && renderBasicInfo()}
            {step === 'videoRecording' && renderVideoRecording()}
            {step === 'quiz' && <ProctoredQuiz />}
        </div>
    );
};

export default QuizPage;