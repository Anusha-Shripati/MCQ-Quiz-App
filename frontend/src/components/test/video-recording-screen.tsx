'use client';

import {
  Camera,
  VideoIcon,
  MicIcon,
  SunIcon,
  MonitorIcon
} from 'lucide-react';
import VideoRecorder from '../video-recording/VideoRecorder';
import { examApi } from '@/lib/api';
import { useExamStore } from '@/store/examStore';
import useSWRMutation from 'swr/mutation';
import { useState } from 'react';
import { examEndpoint } from '@/lib/endpoint';
import { uploadFileInChunks } from '@/lib/utils';
import FaceVerification from './face-verification';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { useParams } from 'next/navigation';

// Configuration
const VIDEO_CONFIG = {
  instructions: [
    { icon: SunIcon, text: 'Ensure good lighting on your face' },
    { icon: MicIcon, text: 'Speak clearly and maintain eye contact' },
    { icon: MonitorIcon, text: 'Keep a professional background' },
    { icon: VideoIcon, text: 'Recording will last for up to 90 seconds' },
    { icon: Camera, text: 'You can re-record if needed' },
  ],
  tips: [
    'Briefly introduce yourself and your background',
    'Mention your relevant experience and skills',
    'Speak naturally and confidently',
    'Stay focused and concise',
  ],
  maxTime: 90,
  questionName: 'introduction',
};

// Types
interface VideoRecorderProps {
  onRecordingComplete: () => void;
  videoLink?: string;
}

// Main Component
export const VideoRecordingScreen = ({ onRecordingComplete, videoLink }: VideoRecorderProps) => {
  const { exam, accessCode } = useExamStore();
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [faceVerified, setFaceVerified] = useState<boolean>(false);
  const { cameraStreamRef } = useExamStore();
  const examId = useParams()?.examId;
  const { trigger } = useSWRMutation(`${examEndpoint.CANDIDATE_EXAM}/${exam?.id}/submit-answer`, 
    (url: string, { arg }: { arg: {foldername:string,UploadId:string,parts:{ETag:string,PartNumber:number}[],question_name:string,merge_chunk:boolean} }) => 
      examApi.post(url, arg, accessCode)
  );
  
  const onContinue = async () => {
    // If we're using an existing video, proceed immediately
    if ((recordingUrl && recordingBlob) || (recordingUrl && !recordingBlob) || videoLink) {
      try {
        if (!recordingBlob && videoLink) {
          // If no new recording then get the existing video
          onRecordingComplete();
          return;
        }

        setIsUploading(true);

        // Upload only if we actually recorded a new blob
        if (recordingBlob) {
          const { fileName, parts, UploadId } = await uploadFileInChunks(
            recordingBlob as Blob,
            5 * 1024 * 1024,
            exam?.id || ''
          );

          // Prepare payload for background processing
          const payload = {
            foldername: fileName,
            UploadId,
            parts,
            merge_chunk: true,
            question_name: VIDEO_CONFIG.questionName,
          };

          trigger(payload).catch((error) => {
            console.error('Background video processing failed:', error);
          });
        }
        onRecordingComplete();
      } catch (error) {
        console.error('Error uploading video chunks:', error);
      } finally {
        setIsUploading(false);
      }
      return;
    }
    // No video found please record introduction
    alert('No video found. Please record your introduction.');
  };

  const handleStopRecording = (blob: Blob | null, url: string) => {
    setRecordingBlob(blob);
    setRecordingUrl(url);
  };

  const handleFaceVerificationComplete = () => {
    setFaceVerified(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-5 gap-8 mt-6">
        {/* Instructions Card */}
        <div className="lg:col-span-2">
          <Card className="bg-white shadow-md overflow-hidden border border-gray-100 h-full">
            <CardHeader className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2 text-blue-700 text-xl font-semibold">
                <Camera className="h-5 w-5 self-center" />
                <span className="align-middle leading-tight">Recording Instructions</span>
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1 font-semibold">
                Follow these guidelines for the best recording
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                <ul className="space-y-4">
                  {VIDEO_CONFIG.instructions.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <li key={index} className="flex items-center gap-3">
                        <div className="bg-blue-100 rounded-full p-2 flex-shrink-0 mt-0.5">
                          <Icon className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-gray-700">{item.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
                <h3 className="font-semibold text-indigo-700 mb-3">
                  Tips for a Great Introduction
                </h3>
                <ul className="space-y-2 text-indigo-900">
                  {VIDEO_CONFIG.tips.map((tip, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span>•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Video Recorder Card */}
        <div className="lg:col-span-3">
          <Card className="bg-white shadow-md overflow-hidden border border-gray-100 h-full">
            <CardHeader className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle className="flex items-center gap-2 text-indigo-700 text-xl font-semibold">
                <Camera className="h-5 w-5 self-center" />
                <span className="align-middle leading-tight">
                  {!faceVerified ? 'Face Verification Required' : 'Record Your Introduction'}
                </span>
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1 font-semibold">
                {!faceVerified
                  ? 'Please complete face verification before recording'
                  : 'Please introduce yourself and your experience'}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              {!faceVerified ? (
                <FaceVerification
                  onVerificationComplete={handleFaceVerificationComplete}
                  cameraStream={cameraStreamRef}
                  examId={examId as string}
                />
              ) : (
                <VideoRecorder
                  videoKey="introduction"
                  onRecordingComplete={onContinue}
                  onRecordingStop={handleStopRecording}
                  maxTime={VIDEO_CONFIG.maxTime}
                  videoLink={videoLink}
                  isLoading={isUploading}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
