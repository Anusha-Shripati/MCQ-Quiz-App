'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Camera,
} from 'lucide-react';
import  VideoRecorder from '../video-recording/VideoRecorder';

// Types
interface VideoRecorderProps {
  onRecordingComplete: (chunks: Blob[]) => void;
}


// Main Component
export const VideoRecordingScreen = ({ onRecordingComplete }: VideoRecorderProps) => {

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
        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
          <CardHeader className="space-y-1 border-b pb-6">
            <div className="flex items-center gap-2 text-purple-600">
              <Camera className="h-5 w-5" />
              <CardTitle className="text-xl font-semibold">Record Your Introduction</CardTitle>
            </div>
            <p className="text-sm text-gray-500">Please introduce yourself and your experience</p>
          </CardHeader>
          <CardContent className="pt-6">
            <VideoRecorder videoKey='introduction' onRecordingComplete={onRecordingComplete} maxTime={90} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
