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
  
  const { trigger } = useSWRMutation(`${examEndpoint.CANDIDATE_EXAM}/${exam?.id}/submit-answer`, 
    (url: string, { arg }: { arg: {foldername:string,question_name:string,merge_chunk:boolean} }) => 
      examApi.post(url, arg, accessCode)
  );
  
  const onContinue = async () => {
    // If we're using an existing video, proceed immediately
    if(recordingUrl == videoLink){
      onRecordingComplete();
      return;
    }

    try {
      setIsUploading(true);
      
      // Upload chunks - this we need to wait for
      const foldername = await uploadFileInChunks(recordingBlob as Blob);
      
      // Prepare payload for background processing
      const payload = {
        foldername,
        merge_chunk: true,
        question_name: 'introduction'
      };
      onRecordingComplete();
      trigger(payload)
        .catch(error => {
          console.error('Background video processing failed:', error);
        })
        .finally(() => {
          setIsUploading(false);
        });
    } catch (error) {
      console.error('Error uploading video chunks:', error);
      setIsUploading(false);
      // Show error to user but don't block UI
    }
  };

  const handleStopRecording = (blob: Blob | null, url: string) => {
    setRecordingBlob(blob);
    setRecordingUrl(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Instructions Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 h-full">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-2 text-blue-700">
                <Camera className="h-5 w-5" />
                <h2 className="text-xl font-bold">Recording Instructions</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">Follow these guidelines for the best recording</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0 mt-0.5">
                      <SunIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">Ensure good lighting on your face</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0 mt-0.5">
                      <MicIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">Speak clearly and maintain eye contact</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0 mt-0.5">
                      <MonitorIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">Keep a professional background</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0 mt-0.5">
                      <VideoIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">Recording will last for up to 90 seconds</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0 mt-0.5">
                      <Camera className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">You can re-record if needed</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
                <h3 className="font-semibold text-indigo-700 mb-3">Tips for a Great Introduction</h3>
                <ul className="space-y-2 text-indigo-900">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Briefly introduce yourself and your background</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Mention your relevant experience and skills</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Speak naturally and confidently</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Stay focused and concise</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Video Recorder Card */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 h-full">
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-2 text-indigo-700">
                <Camera className="h-5 w-5" />
                <h2 className="text-xl font-bold">Record Your Introduction</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">Please introduce yourself and your experience</p>
            </div>
            
            <div className="p-6">
              <VideoRecorder 
                videoKey='introduction' 
                onRecordingComplete={onContinue} 
                onRecordingStop={handleStopRecording} 
                maxTime={90} 
                videoLink={videoLink} 
                isLoading={isUploading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
