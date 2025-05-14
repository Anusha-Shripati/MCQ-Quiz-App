import { FC, useEffect, useRef, useState } from 'react';

interface VideoRecorderProps {
  handleAnswerChange: (questionId: string, blob: Blob) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  question: any;
}

export const VideoRecorderQuestion: FC<VideoRecorderProps> = ({ handleAnswerChange, question }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedVideoURL, setRecordedVideoURL] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setRecordedChunks((prev) => [...prev, e.data]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoURL(url);
        handleAnswerChange(question.id as string, blob);
        clearTimeout(recordingTimeoutRef.current!);
        clearInterval(countdownIntervalRef.current!);
        setTimeLeft(0);
      };
    };

    if (isRecording) {
      startCamera();
    }

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      }
    };
  }, [isRecording]);

  const handleStart = () => {
    setRecordedChunks([]);
    mediaRecorder?.start();
    setIsRecording(true);
    setTimeLeft(120);

    countdownIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Stop after 2 minutes
    recordingTimeoutRef.current = setTimeout(() => {
      handleStop();
    }, 120000);
  };

  const handleStop = () => {
    mediaRecorder?.stop();

    // Turn off the camera
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null; // Clear the video source
    }

    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    setRecordedVideoURL(url);
    handleAnswerChange(question.id as string, blob);
    setIsRecording(false);
  };

  console.log('questionnnnn video recorder', question);

  return (
    <div className="space-y-4">
      {/* Question prompt */}
      {question.question?.meta?.video_url ? (
        <video controls className="w-full max-h-[400px] rounded-lg shadow">
          <source src={question.question.meta.video_url} type="video/mp4" />
        </video>
      ) : (
        <></>
      )}

      <div className="flex justify-center items-center mb-4 gap-4">
        <button
          onClick={isRecording ? handleStop : handleStart}
          className={`px-4 py-2 rounded text-white ${isRecording ? 'bg-red-600' : 'bg-green-600'}`}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>

      {/* Live video preview */}
      {isRecording ? (
        <video ref={videoRef} autoPlay muted className="w-full h-full border rounded" />
      ) : (
        ''
      )}

      {/* Controls */}

      {/* Countdown display */}
      {isRecording && <p className="text-sm text-gray-700">Time left: {timeLeft}s</p>}

      {/* Playback of recorded video */}
      {recordedVideoURL && (
        <div>
          <p className="text-gray-700 mt-4">Your Recorded Answer:</p>
          <video controls src={recordedVideoURL} className="w-full max-h-[300px] border rounded" />
        </div>
      )}
    </div>
  );
};
