"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ProctoredQuiz from "@/components/test/ProctoredQuiz";
import { VideoRecorder } from "@/components/test/VideoRecorder";
import BasicInfoForm from "@/components/test/BasicInfo";

// Main Quiz Component
const QuizPage = () => {
    const [step, setStep] = useState('basicInfo'); // 'basicInfo' | 'videoRecording' | 'quiz'
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        experienceYear: '',
        jobProfile: ''
    });
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft]);


    const handleBasicInfoSubmit = (formData:FormData) => {
        console.log('Form data:', formData);
        setStep('videoRecording');
    };

    const handleRecordingComplete = (recordedChunks) => {
        console.log('Recording complete:', recordedChunks);
        setStep('quiz');
    };

    const renderBasicInfo = () => (
      <BasicInfoForm handleBasicInfoSubmit={handleBasicInfoSubmit}/>
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
        <div className="flex justify-center items-center w-screen h-screen w-auto bg-gray-50 p-8">
            {step === 'basicInfo' && renderBasicInfo()}
            {step === 'videoRecording' && renderVideoRecording()}
            {step === 'quiz' && <ProctoredQuiz />}
        </div>
    );
};

export default QuizPage;