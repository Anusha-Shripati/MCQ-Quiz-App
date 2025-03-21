import { AlertCircle, StopCircle, Video } from "lucide-react";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { useEffect, useRef, useState } from "react";

export const VideoRecorder = ({ onRecordingComplete }) => {
    // Refs for DOM elements and MediaRecorder
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);

    // State management
    const [status, setStatus] = useState('idle'); // idle, recording, preview
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(30);
    const [recordedVideo, setRecordedVideo] = useState(null);
    const [recordedChunks, setRecordedChunks] = useState([]);

    // Initialize camera when component mounts
    useEffect(() => {
        initCamera();
        return () => {
            stopCamera();
        };
    }, []);

    // Initialize camera
    const initCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            streamRef.current = stream;
            setError('');
        } catch (err) {
            setError('Camera access denied. Please check your permissions.');
            console.error('Camera init error:', err);
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    // Start recording
    const startRecording = () => {
        if (!streamRef.current) {
            setError('No camera access');
            return;
        }

        const chunks = [];
        const options = { mimeType: 'video/webm;codecs=vp8,opus' };

        try {
            const mediaRecorder = new MediaRecorder(streamRef.current, options);

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                    setRecordedChunks([...chunks]);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                setRecordedVideo(url);
                setStatus('preview');
            };

            mediaRecorder.start(1000);
            mediaRecorderRef.current = mediaRecorder;
            setStatus('recording');
            setTimeLeft(30);

            // Start countdown
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        stopRecording();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err) {
            setError('Recording failed to start. Please try again.');
            console.error('Recording error:', err);
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setStatus('preview');
        }
    };

    // Reset recording
    const resetRecording = () => {
        setStatus('idle');
        setTimeLeft(30);
        setRecordedVideo(null);
        setRecordedChunks([]);
        initCamera();
    };

    return (
        <div className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="relative">
                {status !== 'preview' && (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-[500px] bg-gray-100 rounded-lg object-cover"
                    />
                )}

                {status === 'preview' && recordedVideo && (
                    <video
                        src={recordedVideo}
                        controls
                        className="w-full h-[500px] bg-gray-100 rounded-lg"
                    />
                )}

                {status === 'recording' && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full">
                        Recording: {timeLeft}s
                    </div>
                )}
            </div>

            <div className="flex justify-center space-x-4">
                {status === 'idle' && (
                    <Button
                        onClick={startRecording}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Video className="w-4 h-4 mr-2" />
                        Start Recording
                    </Button>
                )}

                {status === 'recording' && (
                    <Button
                        onClick={stopRecording}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        <StopCircle className="w-4 h-4 mr-2" />
                        Stop Recording
                    </Button>
                )}

                {status === 'preview' && (
                    <>
                        <Button
                            variant="outline"
                            onClick={resetRecording}
                        >
                            Record Again
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => onRecordingComplete(recordedChunks)}
                        >
                            Continue
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};