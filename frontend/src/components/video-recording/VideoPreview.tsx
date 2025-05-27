import { Loader2, Maximize2, Minimize2, Pause, Play, SkipBack, SkipForward, Volume, Volume1, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VideoPreview = ({ videoUrl, onError }: { videoUrl: string, onError: (err: any) => void }) => {
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
        }, 1000);
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        video.play().catch((err: any) => onError(err));
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
                <Volume1 size={20} strokeWidth={2} />
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
                    className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 ${isPlaying && !showControls ? 'opacity-0' : 'opacity-100'
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
                    <h3 className="text-white font-medium">Recording</h3>
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
                className={` absolute inset-0 flex  flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 opacity-0 hover:opacity-100`}
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
                                className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md transform -translate-x-1/2 transition-transform ${showTimeTooltip || isDragging
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
                                <SkipBack />
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
                                <SkipForward />
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
                                            className={`block w-full text-left px-4 py-2 text-sm ${playbackSpeed === speed
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
                                <Minimize2 className="w-5 h-5" />
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

export default VideoPreview;
