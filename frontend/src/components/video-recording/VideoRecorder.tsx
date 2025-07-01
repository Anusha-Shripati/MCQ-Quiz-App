import { AlertCircle, Camera, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import VideoPreview from "./VideoPreview";
import VideoControls from "./VideoControls";
import { useCallback, useEffect, useRef, useState } from "react";
import { loadVideoFromIndexedDB, saveVideoToIndexedDB } from "@/lib/utils";
import { useExamStore } from "@/store/examStore";

type RecordingStatus = 'idle' | 'loading' | 'recording' | 'preview' | 'error';

interface VideoRecorderProps {
    onRecordingComplete: (chunks: Blob[], videoUrl: string) => void;
    maxTime: number;
    videoKey: string;
    videoLink?: string | null;
    onRecordingStop?: (blob: Blob | null,url:string) => void;
    isLoading:boolean
    showControls?:boolean
}
const VideoRecorder = ({ onRecordingComplete, maxTime, videoKey = 'video', videoLink, onRecordingStop, isLoading, showControls=true }: VideoRecorderProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const timeLeftRef = useRef<number>(maxTime);
    const timeLeftRefSpan = useRef<HTMLSpanElement>(null);
    const [status, setStatus] = useState<RecordingStatus>('idle');
    const [error, setError] = useState<string>('');
    const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [isStreamReady, setIsStreamReady] = useState(false);
    const animationFrameRef = useRef<number | null>(null);
    const { exam, cameraStreamRef } = useExamStore();
    const [isUploading, setIsUploading] = useState(false);

    const startCamera = useCallback(async () => {
        setIsStreamReady(false);
        setRecordedVideo(null);
        try {
            streamRef.current = cameraStreamRef;
            if (videoRef.current) {
                videoRef.current.srcObject = streamRef.current;
                await videoRef.current.play().catch((err) => {
                    console.error('Error playing video:', err);
                });
            }

            setIsStreamReady(true);
        } catch (error) {
            console.error('Error accessing camera:', error);
            setStatus('error');
        }
    }, []);

    const controllerRef = useRef<AbortController | null>(null);

    const init = async () => {
        controllerRef.current?.abort();

        const controller = new AbortController();
        controllerRef.current = controller;

        const signal = controller.signal;
        if (videoLink) {
            setRecordedVideo(videoLink);
            onRecordingStop && onRecordingStop(null, videoLink);
            setStatus('preview');
            if (videoRef.current) {
                videoRef.current.pause();
            }
            stopCamera();

            return;
        }

        try {
            await loadVideoFromIndexedDB(videoKey, exam?.id as string,signal).then((video) => {
                if (video) {
                    const videoUrl = URL.createObjectURL(video);
                    setRecordedVideo(videoUrl);
                    onRecordingStop && onRecordingStop(video, videoUrl);
                    stopCamera();
                    setStatus('preview');
                } else {
                    startCamera();
                    setStatus('idle');
                }
            });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error :any) {
            console.log(error?.message);
        }
    }

    useEffect(() => {
        init();
        return () => {
            // Cleanup URLs when component unmounts
            if (recordedVideo && recordedVideo.startsWith('blob:')) {
                URL.revokeObjectURL(recordedVideo);
            }
        };
    }, [videoLink]);

    const startRecording = useCallback(async () => {
        if (!streamRef.current || !isStreamReady) {
            // Add a small delay to ensure camera is ready
            await new Promise((resolve) => setTimeout(resolve, 500));

            // If still not ready after camera start, show error
            if (!streamRef.current) {
                setError('Failed to access camera. Please try again.');
                return;
            }
        }
        if (videoRef.current && streamRef.current) {
            // Double-check that srcObject is set
            if (!videoRef.current.srcObject) {
                videoRef.current.srcObject = streamRef.current;
                // Make sure video plays before recording
                try {
                    await videoRef.current.play();
                } catch (error) {
                    console.error('Error playing video before recording:', error);
                }
            }
        }

        // Initialize the MediaRecorder
        try {
            const stream = streamRef.current;
            if (!stream) {
                throw new Error('No stream available');
            }

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            // Handle data available event
            const chunks: Blob[] = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            // Handle recording stop event
            mediaRecorder.onstop = () => {
                setRecordedChunks(chunks);
                // Create blob and URL for preview
                const blob = new Blob(chunks, { type: 'video/webm' });
                saveVideoToIndexedDB(blob, videoKey, exam?.id as string);
                const videoUrl = URL.createObjectURL(blob);
                if(onRecordingStop) {
                    onRecordingStop(blob,videoUrl);
                }
                setRecordedVideo(videoUrl);
                // Change status to preview
                setStatus('preview');
            };

            // Start recording
            mediaRecorder.start();
            setStatus('recording');

            // Set up timer for max seconds
            timeLeftRef.current = maxTime;
            if (timeLeftRefSpan.current) {
                timeLeftRefSpan.current.textContent = timeLeftRef.current + 's';
            }

            timerRef.current = setInterval(() => {
                timeLeftRef.current -= 1;
                if (timeLeftRefSpan.current) {
                    timeLeftRefSpan.current.textContent = timeLeftRef.current + 's';
                }

                if (timeLeftRef.current <= 0) {
                    stopRecording();
                }
            }, 1000);
        } catch (err) {
            console.error('Error starting recording:', err);
            setError('Failed to start recording. Please try again.');
            setStatus('idle');
        }
    }, [])

    const stopCamera = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setIsStreamReady(false);
    }, []);

    const stopRecording = useCallback(() => {
        // Clear timer interval
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        // Stop recording if MediaRecorder is active
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            try {
                // Add event listener for stop event to ensure cleanup happens after recorder is fully stopped
                const handleStop = () => {
                    stopCamera();
                    mediaRecorderRef.current?.removeEventListener('stop', handleStop);
                };

                mediaRecorderRef.current.addEventListener('stop', handleStop);
                mediaRecorderRef.current.stop();
            } catch (error) {
                console.error('Error stopping MediaRecorder:', error);
                // Still try to stop camera if MediaRecorder fails
                stopCamera();
            }
        } else {
            // If no active MediaRecorder, still stop camera
            stopCamera();
        }
    }, [stopCamera]);

    const resetRecording = useCallback(() => {
        // Release blob URL to avoid memory leaks
        if (recordedVideo) {
            URL.revokeObjectURL(recordedVideo);
        }

        // Clear timer if it's still running
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setRecordedVideo(null);
        setRecordedChunks([]);
        setStatus('idle');

        // Re-start camera if it was stopped
        if (!isStreamReady) {
            startCamera();
        }
    }, [recordedVideo, isStreamReady, startCamera]);

    useEffect(() => {
        return () => {
            stopCamera();
            // Clear any remaining interval
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            // Clear any animation frame
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [stopCamera]);
    
    useEffect(() => {
        if (status !== 'idle' && status !== 'recording') return;
        if (!videoRef.current || !streamRef.current) return;

        // If no effect, make sure we're showing the original stream
        if (videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            if (videoRef.current && streamRef.current) {
                videoRef.current.srcObject = streamRef.current;
            }
        };
    }, [status, isStreamReady]);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onError = (err: any) => {
        setStatus('idle');
        
        // Cleanup existing video URL
        if (recordedVideo && recordedVideo.startsWith('blob:')) {
            URL.revokeObjectURL(recordedVideo);
        }
        
        // Stop any existing recording
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        
        setRecordedChunks([]);
        setRecordedVideo(null);
        
        // Restart camera after a short delay
        setTimeout(() => {
            startCamera();
        }, 1000);
    }

    const handleContinue = () => {
        setIsUploading(true);
        onRecordingComplete(recordedChunks, recordedVideo as string);
    }

    
    return (
        <div className="space-y-4 max-w-4xl mx-auto">
            {error && (
                <Alert variant="destructive" className="animate-in fade-in-50 slide-in-from-top-5 mb-5">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="relative overflow-hidden rounded-xl shadow-lg bg-gradient-to-b from-indigo-900 to-purple-900 p-1.5">
                <div className="aspect-video relative rounded-lg overflow-hidden bg-black">
                    {/* Loading indicator */}
                    {status === 'loading' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-10">
                            <div className="flex flex-col items-center">
                                <Loader2 className="h-10 w-10 text-indigo-400 animate-spin mb-2" />
                                <span className="text-white/90 animate-pulse text-sm font-medium">Initializing camera...</span>
                            </div>
                        </div>
                    )}

                    {/* Camera feed */}
                    {status !== 'preview' && (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                            />
                            {status === 'idle' && isStreamReady && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300">
                                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full font-medium shadow-lg transform hover:scale-105 transition-transform flex items-center gap-2">
                                        <Camera className="w-5 h-5" />
                                        Ready to record
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Video preview */}
                    {status === 'preview' && recordedVideo && 
                        <VideoPreview videoUrl={recordedVideo} onError={onError} />
                    }

                    {/* Recording timer */}
                    {status === 'recording' && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg z-20">
                            <div className="h-3 w-3 rounded-full bg-white animate-pulse" />
                            <span ref={timeLeftRefSpan} className="font-medium">
                                {timeLeftRef.current}s
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {showControls && 
                <VideoControls
                    status={status}
                    onStart={startRecording}
                    onStop={stopRecording}
                    onReset={resetRecording}
                    onContinue={handleContinue}
                    isLoading={isLoading || isUploading}
                />
            }
        </div>
    );
};

export default VideoRecorder;