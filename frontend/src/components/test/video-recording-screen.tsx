'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Camera,
} from 'lucide-react';
import VideoRecorder from '../video-recording/VideoRecorder';
import { examApi } from '@/lib/api';
import { useExamStore } from '@/store/examStore';
import useSWRMutation from 'swr/mutation';
import {  useState } from 'react';
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Instructions Card */}
        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
          <CardHeader className="space-y-1 border-b pb-6">
            <div className="flex items-center gap-2 text-blue-600">
              <Camera className="h-5 w-5" />
              <CardTitle className="text-xl font-semibold">Recording Instructions</CardTitle>
            </div>
            <p className="text-sm text-gray-500">Follow these guidelines for the best recording</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <ul className="space-y-4">
                  {[
                    'Ensure good lighting on your face',
                    'Speak clearly and maintain eye contact',
                    'Keep a professional background',
                    'Recording will last for 30 seconds',
                    'You can re-record if needed',
                  ].map((tip, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-700">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video Recorder Card */}
        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 flex flex-col">
          <CardHeader className="space-y-1 border-b pb-6">
            <div className="flex items-center gap-2 text-purple-600">
              <Camera className="h-5 w-5" />
              <CardTitle className="text-xl font-semibold">Record Your Introduction</CardTitle>
            </div>
            <p className="text-sm text-gray-500">Please introduce yourself and your experience</p>
          </CardHeader>
          <CardContent className="pt-6">

            <VideoRecorder 
              videoKey='introduction' 
              onRecordingComplete={onContinue} 
              onRecordingStop={handleStopRecording} 
              maxTime={90} 
              videoLink={videoLink} 
              isLoading={isUploading}
            />
            {/* {error && (
              <div className="mt-4 text-red-600">
                <p>Error: {error.message}</p>
              </div>
            )} */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
