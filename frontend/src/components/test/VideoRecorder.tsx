'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertCircle,
  Camera,
  Loader2,
  Maximize2,
  Pause,
  Play,
  RefreshCw,
  StopCircle,
  Video,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/form/button';

// Types
interface VideoRecorderProps {
  onRecordingComplete: (chunks: Blob[]) => void;
}

type RecordingStatus = 'idle' | 'loading' | 'recording' | 'preview' | 'error';

const VideoPreview = ({ videoUrl }: { videoUrl: string }) => {
  console.log('VideoPreview rendered');
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState<TimeRanges | null>(null);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);

  // Auto-hide controls after inactivity
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isDragging) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, isDragging]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => {
      // Only set duration if it's a valid number
      if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
        setDuration(video.duration);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setShowControls(true);
    };
    const handleVolumeChange = () => setVolume(video.volume);
    const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement === video);
    const handleMouseMove = () => resetControlsTimeout();
    const handleVideoClick = () => togglePlay();
    const handleProgress = () => setBuffered(video.buffered);
    const handleLoadedMetadata = () => {
      setIsMetadataLoaded(true);
      if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
        setDuration(video.duration);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    video.addEventListener('mousemove', handleMouseMove);
    video.addEventListener('click', handleVideoClick);

    // Auto-play the video when loaded
    video.play().catch((err) => console.error('Auto-play failed:', err));
    setIsPlaying(true);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      video.removeEventListener('mousemove', handleMouseMove);
      video.removeEventListener('click', handleVideoClick);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      resetControlsTimeout();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) {
      return '0:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressContainerRef.current || !videoRef.current) return;

    const rect = progressContainerRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = duration * clickPosition;

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleProgressClick(e);

    const handleMouseMove = (e: MouseEvent) => {
      if (!progressContainerRef.current || !videoRef.current) return;

      const rect = progressContainerRef.current.getBoundingClientRect();
      const movePosition = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newTime = duration * movePosition;

      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      resetControlsTimeout();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      } else if (isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  // Get appropriate volume icon based on current volume level
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="w-5 h-5" />;
    } else if (volume < 0.5) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      );
    } else {
      return <Volume2 className="w-5 h-5" />;
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      const newTime = Math.max(0, videoRef.current.currentTime - 5);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      const newTime = Math.min(duration, videoRef.current.currentTime + 5);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Calculate buffered segments for progress bar
  const getBufferedRanges = useCallback(() => {
    if (!buffered || !duration) return [];

    const ranges = [];
    for (let i = 0; i < buffered.length; i++) {
      const start = (buffered.start(i) / duration) * 100;
      const end = (buffered.end(i) / duration) * 100;
      ranges.push({ start, end });
    }
    return ranges;
  }, [buffered, duration]);

  // Preview tooltip for progress bar
  const [showTimeTooltip, setShowTimeTooltip] = useState(false);
  const [tooltipTime, setTooltipTime] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState(0);

  const handleProgressMouseEnter = () => {
    setShowTimeTooltip(true);
  };

  const handleProgressMouseLeave = () => {
    setShowTimeTooltip(false);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressContainerRef.current) return;

    const rect = progressContainerRef.current.getBoundingClientRect();
    const position = e.clientX - rect.left;
    const percent = position / rect.width;

    setTooltipTime(duration * percent);
    setTooltipPosition(position);
  };

  // Handle playback speed change
  const changePlaybackSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
    }
  };

  return (
    <div
      className="relative group w-full h-full rounded-lg overflow-hidden bg-black"
      onMouseMove={resetControlsTimeout}
    >
      <video ref={videoRef} src={videoUrl} className="w-full h-full object-cover" />

      {/* Play/Pause overlay - only shown when paused or on hover */}
      {(!isPlaying || showControls) && (
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 ${
            isPlaying && !showControls ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="bg-white/20 backdrop-blur-sm rounded-full p-4 text-white hover:bg-white/30 transition-all transform hover:scale-105 hover:shadow-glow"
            >
              <Play className="w-8 h-8" />
            </button>
          )}
        </div>
      )}

      {/* Video Title Bar - only shown when controls are visible */}
      {showControls && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent px-4 py-3 opacity-100 transition-opacity duration-300">
          <h3 className="text-white font-medium">Your Recording</h3>
        </div>
      )}

      {/* Loading indicator for video */}
      {!isMetadataLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-white animate-spin" />
            <span className="text-white mt-2">Loading video...</span>
          </div>
        </div>
      )}

      {/* Video Controls Overlay - shown on hover/activity */}
      <div
        className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Enhanced Progress Bar */}
        <div
          className="px-4 pb-1 relative"
          onMouseEnter={handleProgressMouseEnter}
          onMouseLeave={handleProgressMouseLeave}
          onMouseMove={handleProgressMouseMove}
        >
          {/* Time tooltip on hover */}
          {showTimeTooltip && (
            <div
              className="absolute bottom-full mb-2 bg-white/90 text-gray-900 px-2 py-1 rounded text-xs font-medium transform -translate-x-1/2 pointer-events-none shadow-md"
              style={{ left: `${tooltipPosition}px` }}
            >
              {formatTime(tooltipTime)}
            </div>
          )}

          <div
            ref={progressContainerRef}
            className="h-2 bg-gray-800 cursor-pointer rounded-full overflow-hidden hover:h-3 transition-all group/progress"
            onClick={handleProgressClick}
            onMouseDown={handleProgressMouseDown}
          >
            {/* Buffered segments */}
            {getBufferedRanges().map((range, index) => (
              <div
                key={index}
                className="absolute h-full bg-gray-600/80"
                style={{
                  left: `${range.start}%`,
                  width: `${range.end - range.start}%`,
                }}
              />
            ))}

            {/* Playback progress */}
            <div
              ref={progressRef}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 relative z-10"
              style={{
                width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
              }}
            >
              {/* Handle for seeking */}
              <div
                className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md transform -translate-x-1/2 transition-transform ${
                  showTimeTooltip || isDragging
                    ? 'scale-100'
                    : 'scale-0 group-hover/progress:scale-100'
                }`}
              >
                <div className="absolute inset-1 bg-purple-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Time Indicator */}
        <div className="px-4 py-1 text-white text-sm font-medium flex justify-between">
          <span>{formatTime(currentTime)}</span>
          <span className="text-gray-300">{formatTime(duration)}</span>
        </div>

        {/* Controls Bar */}
        <div className="px-4 pb-4 flex items-center justify-between backdrop-blur-sm bg-black/10">
          <div className="flex items-center gap-4">
            {/* Playback Controls */}
            <div className="flex items-center gap-3">
              <button
                className="text-white hover:text-purple-400 transition-colors p-2 rounded-full hover:bg-white/10"
                onClick={skipBackward}
                title="Back 5 seconds"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="19 20 9 12 19 4 19 20"></polygon>
                  <line x1="5" y1="19" x2="5" y2="5"></line>
                </svg>
              </button>

              <button
                className="text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full p-3 transition-all flex items-center justify-center shadow-lg"
                onClick={togglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>

              <button
                className="text-white hover:text-purple-400 transition-colors p-2 rounded-full hover:bg-white/10"
                onClick={skipForward}
                title="Forward 5 seconds"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 4 15 12 5 20 5 4"></polygon>
                  <line x1="19" y1="5" x2="19" y2="19"></line>
                </svg>
              </button>
            </div>

            {/* Volume Control - with enhanced volume slider */}
            <div className="flex items-center gap-2 relative group/volume">
              <button
                className="text-white hover:text-purple-400 transition-colors p-2 rounded-full hover:bg-white/10"
                onClick={toggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {getVolumeIcon()}
              </button>
              <div className="hidden md:flex w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300 items-center bg-black/80 backdrop-blur-sm rounded-full opacity-0 group-hover/volume:opacity-100 py-1.5 px-2 shadow-lg">
                <div className="w-full relative">
                  <div className="w-full bg-white/30 h-1.5 rounded-full">
                    <div
                      className="absolute left-0 top-0 h-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                      style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg transform -translate-x-1/2 flex items-center justify-center">
                        <div className="absolute inset-0.5 bg-purple-600 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full absolute inset-0 cursor-pointer opacity-0"
                  />
                </div>
              </div>
            </div>

            {/* Playback Speed Control */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="text-white text-xs px-2.5 py-1.5 rounded-full hover:bg-white/20 transition-colors flex items-center bg-white/10"
                title="Playback Speed"
              >
                {playbackSpeed}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-black/95 backdrop-blur-sm rounded-md overflow-hidden shadow-xl z-20 border border-white/10">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => changePlaybackSpeed(speed)}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        playbackSpeed === speed
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            <button
              className="text-white hover:text-purple-400 transition-colors p-2 rounded-full hover:bg-white/10"
              onClick={handleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                </svg>
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const VideoControls = ({
  status,
  onStart,
  onStop,
  onReset,
  onContinue,
}: {
  status: RecordingStatus;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onContinue: () => void;
}) => (
  <div className="flex justify-center space-x-4 mt-6">
    {status === 'idle' && (
      <Button
        onClick={onStart}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl text-white px-6 py-3 rounded-full font-medium transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
      >
        <Camera className="w-5 h-5 mr-2" />
        Start Recording
      </Button>
    )}

    {status === 'loading' && (
      <Button
        disabled
        className="bg-gray-400 text-white px-6 py-3 rounded-full font-medium flex items-center cursor-not-allowed"
      >
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        Initializing...
      </Button>
    )}

    {status === 'recording' && (
      <Button
        onClick={onStop}
        className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg hover:shadow-xl text-white px-6 py-3 rounded-full font-medium transform hover:-translate-y-0.5 transition-all duration-200 flex items-center pulse-animation"
      >
        <StopCircle className="w-5 h-5 mr-2" />
        Stop Recording
      </Button>
    )}

    {status === 'preview' && (
      <div className="flex gap-4">
        <Button
          className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-medium transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
          onClick={onReset}
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Record Again
        </Button>
        <Button
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl text-white px-6 py-3 rounded-full font-medium transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
          onClick={onContinue}
        >
          <Video className="w-5 h-5 mr-2" />
          Continue
        </Button>
      </div>
    )}
  </div>
);

// Main Component
export const VideoRecordingScreen = ({ onRecordingComplete }: VideoRecorderProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeLeftRef = useRef<number>(30);
  const timeLeftRefSpan = useRef<HTMLSpanElement>(null);
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [error, setError] = useState<string>('');
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  console.log('VideoRecordingScreen rendered, status:', status, 'isStreamReady:', isStreamReady);

  // Define startCamera function first
  const startCamera = useCallback(async () => {
    console.log('startCamera - attempting to access camera');
    setIsStreamReady(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      console.log('Camera stream obtained:', stream);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => {
          console.error('Error playing video:', err);
        });
      } else {
        console.error('Video ref is null, cannot set srcObject');
      }

      setIsStreamReady(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setStatus('error');
    }
  }, []);

  // Define stopCamera function
  const stopCamera = useCallback(() => {
    console.log('stopCamera', streamRef.current);

    if (streamRef.current) {
      console.log('Stopping all tracks in stream');
      streamRef.current.getTracks().forEach((track) => {
        console.log(`Stopping track: ${track.kind}`, track);
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      console.log('Clearing video srcObject');
      videoRef.current.srcObject = null;
    }

    setIsStreamReady(false);
  }, []);

  // Define stopRecording function
  const stopRecording = useCallback(() => {
    console.log('stopRecording');

    // Clear timer interval
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop recording if MediaRecorder is active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        console.log('Stopping MediaRecorder...');
        // Add event listener for stop event to ensure cleanup happens after recorder is fully stopped
        const handleStop = () => {
          console.log('MediaRecorder stop event fired, stopping camera...');
          stopCamera();
          mediaRecorderRef.current?.removeEventListener('stop', handleStop);
        };

        mediaRecorderRef.current.addEventListener('stop', handleStop);
        mediaRecorderRef.current.stop();
        console.log('MediaRecorder stop initiated');
      } catch (error) {
        console.error('Error stopping MediaRecorder:', error);
        // Still try to stop camera if MediaRecorder fails
        stopCamera();
      }
    } else {
      // If no active MediaRecorder, still stop camera
      console.log('No active MediaRecorder, stopping camera directly');
      stopCamera();
    }
  }, [stopCamera]);

  // Function to reset recording
  const resetRecording = useCallback(() => {
    console.log('resetRecording');

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

  // Function to start recording
  const startRecording = useCallback(async () => {
    console.log('startRecording');

    // Check if camera is ready, if not, start it first
    if (!streamRef.current || !isStreamReady) {
      await startCamera();

      // Add a small delay to ensure camera is ready
      await new Promise((resolve) => setTimeout(resolve, 500));

      // If still not ready after camera start, show error
      if (!streamRef.current) {
        setError('Failed to access camera. Please try again.');
        return;
      }
    }

    // Ensure the video element has the stream assigned before recording
    if (videoRef.current && streamRef.current) {
      // Double-check that srcObject is set
      if (!videoRef.current.srcObject) {
        console.log('Re-assigning stream to video element before recording');
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
        console.log('Recording stopped, chunks:', chunks);
        setRecordedChunks(chunks);

        // Create blob and URL for preview
        const blob = new Blob(chunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideo(videoUrl);

        // Change status to preview
        setStatus('preview');
      };

      // Start recording
      mediaRecorder.start();
      setStatus('recording');

      // Set up timer for 30 seconds
      timeLeftRef.current = 30;
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
  }, [isStreamReady, startCamera, stopRecording]);

  // Stop camera when component unmounts
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
    startCamera();
  }, [startCamera]);

  // Process video with effect when background effect is active
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

  const VideoRecorder = () => {
    return (
      <div className="space-y-4 max-w-4xl mx-auto p-6">
        {error && (
          <Alert variant="destructive" className="animate-in fade-in-50 slide-in-from-top-5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gradient-to-b from-gray-900 to-gray-800 p-1 hover:shadow-blue-800/20 transition-all duration-300">
          <div className="aspect-video relative rounded-lg overflow-hidden bg-black">
            {/* Loading indicator only when actually loading */}
            {status === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-2" />
                  <span className="text-white animate-pulse text-sm">Loading camera...</span>
                </div>
              </div>
            )}

            {/* Always show the camera feed */}
            {status !== 'preview' && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                />
                {status === 'idle' && isStreamReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-blue-600/90 backdrop-blur-md text-white px-5 py-3 rounded-full font-medium shadow-lg transform hover:scale-105 transition-transform flex items-center">
                      <Camera className="w-5 h-5 mr-2" />
                      Ready to record
                    </div>
                  </div>
                )}
              </>
            )}

            {status === 'preview' && recordedVideo && <VideoPreview videoUrl={recordedVideo} />}

            {status === 'recording' && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600/90 backdrop-blur text-white px-5 py-2 rounded-full shadow-lg z-20 animate-pulse">
                <div className="h-3 w-3 rounded-full bg-white animate-pulse" />
                <span ref={timeLeftRefSpan} className="font-medium">
                  {timeLeftRef.current}s
                </span>
              </div>
            )}
          </div>
        </div>

        <VideoControls
          status={status}
          onStart={startRecording}
          onStop={stopRecording}
          onReset={resetRecording}
          onContinue={() => onRecordingComplete(recordedChunks)}
        />
      </div>
    );
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
        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
          <CardHeader className="space-y-1 border-b pb-6">
            <div className="flex items-center gap-2 text-purple-600">
              <Camera className="h-5 w-5" />
              <CardTitle className="text-xl font-semibold">Record Your Introduction</CardTitle>
            </div>
            <p className="text-sm text-gray-500">Please introduce yourself and your experience</p>
          </CardHeader>
          <CardContent className="pt-6">
            <VideoRecorder />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
