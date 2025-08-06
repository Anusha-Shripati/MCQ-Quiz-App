import React, { FC, useEffect, useMemo, useState } from 'react';
import VideoRecorder from '../video-recording/VideoRecorder';
import { IExamQuestion } from '@/types/exam.types';
interface VideoRecorderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  question: any;
  answers: Record<
    string,
    {
      question: IExamQuestion;
      temp_url?: string | Blob | (string | number)[];
      answer: string | Blob | (string | number)[];
    }
  >;
  onRecordingComplete: (blob: Blob, url: string) => void;
  onRecordingStop?: (blob: Blob | null, url: string) => void;
  isLoading: boolean;
}

export const VideoRecorderQuestion: FC<VideoRecorderProps> = React.memo(
  ({ question, answers, onRecordingComplete, onRecordingStop, isLoading }) => {
    const iframeHTML = useMemo(() => question.question?.meta?.video_url || '', [question]);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    useEffect(() => {
      setVideoUrl(
        (answers[question.question_id]?.answer as string)
      );
    }, [answers, question.question_id]);
    
    return (
      <div className="space-y-8">
        {/* Question Video */}
        <div className="w-full max-w-4xl mx-auto">
          <div className="aspect-video rounded-lg overflow-hidden shadow-md">
            {iframeHTML.includes('iframe') ? (
              <StaticIframe html={iframeHTML} />
            ) : (
              question.question?.meta?.videoToVideo && (
                <video controls className="w-full h-full object-cover rounded-lg shadow font-semibold">
                  <source src={iframeHTML} type="video/mp4" />
                </video>
              )
            )}
          </div>
        </div>

        {/* Video Recorder Input */}
        <div className="w-full max-w-4xl mx-auto">
          <VideoRecorder
            onRecordingComplete={(chunks, url) => {
              const blob = new Blob(chunks, { type: 'video/mp4' });
              onRecordingComplete && onRecordingComplete(blob, url);
            }}
            maxTime={120}
            videoKey={question.id}
            videoLink={videoUrl}
            onRecordingStop={(blob, url) => onRecordingStop && onRecordingStop(blob, url)}
            isLoading={isLoading}
            showNextButton={false}
          />
        </div>
      </div>
    );
  }
);

VideoRecorderQuestion.displayName = 'VideoRecorderQuestion';

const StaticIframe: FC<{ html: string }> = React.memo(({ html }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} className="flex justify-center w-full h-full" />;
});
StaticIframe.displayName = 'StaticIframe';

// export const VideoRecorderQuestion: FC<VideoRecorderProps> = React.memo(({ handleAnswerChange, question }) => {

//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
//   const recordedChunksRef = useRef<Blob[]>([]);
//   const [recordedVideoURL, setRecordedVideoURL] = useState<string | null>(null);
//   const [isRecording, setIsRecording] = useState(false);
//   const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const timer = useRef<TimerRef | null>(null);

//   useEffect(() => {
//     const startCamera = async () => {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//       }

//       const recorder = new MediaRecorder(stream);

//       setMediaRecorder(recorder);

//       recorder.ondataavailable = (e) => {

//         if (e.data.size > 0) {
//           recordedChunksRef.current.push(e.data);
//         }
//       };

//       recorder.onstop = () => {

//         const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
//         const url = URL.createObjectURL(blob);
//         setRecordedVideoURL(url);
//         handleAnswerChange(question.id as string, blob);
//         clearTimeout(recordingTimeoutRef.current!);
//         setIsRecording(false);
//       };
//       recorder.start();

//     };

//     if (isRecording) {
//       startCamera();
//     }

//     return () => {
//       if (videoRef.current?.srcObject) {
//         (videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, [isRecording]);

//   const handleStart = () => {
//     recordedChunksRef.current = [];
//     setRecordedVideoURL(null);
//     setIsRecording(true);

//     setTimeout(() => {
//       timer.current?.start();
//     }, 1000);

//     recordingTimeoutRef.current = setTimeout(() => {
//       handleStop();
//     }, 120000);
//   };

//   const handleStop = () => {
//     mediaRecorder?.stop();
//     timer.current?.stop();

//     if (videoRef.current?.srcObject) {
//       (videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
//       videoRef.current.srcObject = null;
//     }

//   };

//   const [iframeHTML] = useState(() => question.question?.meta?.video_url || '');

//   return (
//     <div className="space-y-4">
//      {iframeHTML.includes('iframe') ? (
//         <StaticIframe html={iframeHTML} />
//       ) : (
//         <video controls className="w-full max-h-[400px] rounded-lg shadow">
//           <source src={iframeHTML} type="video/mp4" />
//         </video>
//       )}
//       <div className="flex justify-center items-center mb-4 gap-4">
//         <button
//           onClick={isRecording ? handleStop : handleStart}
//           className={`px-4 py-2 rounded text-white ${isRecording ? 'bg-red-600' : 'bg-green-600'}`}
//         >
//           {isRecording ? 'Stop Recording' : (recordedVideoURL ? 'Record again' : 'Start Recording')}
//         </button>
//       </div>

//       {isRecording ? (
//         <div className='flex justify-center items-center mb-4'>
//         <video ref={videoRef} autoPlay muted className="rounded h-[500px] w-[500px]" />
//         </div>

//       ) : (
//         ''
//       )}

//       {isRecording && <TimeLeft ref={timer} />}

//       {recordedVideoURL && (
//         <div className='flex flex-col items-center'>
//           <p className="text-gray-700 mt-4">Your Recorded Answer:</p>
//           <video controls src={recordedVideoURL} className="max-h-[500px] max-w-[500px] border rounded" />
//         </div>
//       )}
//     </div>
//   );
// });

export default VideoRecorderQuestion;
