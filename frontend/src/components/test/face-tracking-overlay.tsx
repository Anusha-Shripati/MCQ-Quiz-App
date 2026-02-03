'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { FaceTrackingStatus } from '@/components/test/testUtils/faceTracking';

interface FaceTrackingOverlayProps {
  stream: MediaStream | null;
  tracking: FaceTrackingStatus | null;
}

const formatDuration = (durationMs: number) => `${(durationMs / 1000).toFixed(1)}s`;

export const FaceTrackingOverlay = ({ stream, tracking }: FaceTrackingOverlayProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const violationType = useMemo(() => {
    if (!tracking) return null;
    if (!tracking.hasFace) return 'noFaceDetected';
    if (tracking.hasMultipleFaces) return 'multipleFaces';
    if (tracking.isLookingAway) return 'lookAway';
    return null;
  }, [tracking]);

  useEffect(() => {
    if (!videoRef.current || !stream) return;
    const videoEl = videoRef.current;
    videoEl.srcObject = stream;
    videoEl.muted = true;
    videoEl
      .play()
      .catch(() => {
        // Autoplay might be blocked; user gesture will resume.
      });
  }, [stream]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const resizeCanvas = () => {
      const { clientWidth, clientHeight } = video;
      if (clientWidth === 0 || clientHeight === 0) return;
      canvas.width = clientWidth;
      canvas.height = clientHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !tracking) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawBorder = (color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    };

    if (!tracking.hasFace) {
      drawBorder('#dc2626');
      return;
    }

    if (!tracking.faceBoxes || tracking.faceBoxes.length === 0) return;

    const scaleX = canvas.width / (video.videoWidth || canvas.width);
    const scaleY = canvas.height / (video.videoHeight || canvas.height);

    // Draw all face boxes
    tracking.faceBoxes.forEach((faceBox, index) => {
      const x = faceBox.x * scaleX;
      const y = faceBox.y * scaleY;
      const width = faceBox.width * scaleX;
      const height = faceBox.height * scaleY;

      // Color based on violation type
      let color = '#16a34a'; // Green for normal
      if (tracking.hasMultipleFaces) {
        color = '#dc2626'; // Red for multiple faces
      } else if (tracking.isLookingAway) {
        color = '#dc2626'; // Red for looking away
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      // Add face number for multiple faces
      if (tracking.hasMultipleFaces) {
        ctx.fillStyle = color;
        ctx.font = '14px Arial';
        ctx.fillText(`${index + 1}`, x + 5, y + 20);
      }
    });
  }, [tracking]);

  if (!stream) return null;

  return (
    <div className="fixed top-24 right-6 z-40 w-64 md:w-72">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-3 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">Live Face Monitor</span>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              violationType
                ? 'bg-red-100 text-red-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {violationType === 'noFaceDetected'
              ? 'No Face'
              : violationType === 'multipleFaces'
                ? `${tracking?.faceCount || 0} Faces`
                : violationType === 'lookAway'
                  ? 'Looking Away'
                  : 'Stable'}
          </span>
        </div>

        <div className="relative">
          <video
            ref={videoRef}
            className="w-full aspect-video object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

          {violationType && (
            <div className="absolute left-2 top-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow">
              {violationType === 'noFaceDetected' 
                ? 'Face Missing' 
                : violationType === 'multipleFaces'
                  ? `${tracking?.faceCount} Faces Detected`
                  : 'Look Away Detected'
              }
            </div>
          )}
        </div>

        <div className="p-3 space-y-2 text-[11px] text-slate-600">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Detection</span>
            <span className={tracking?.hasFace ? 'text-emerald-700' : 'text-red-700'}>
              {tracking?.hasFace ? `${tracking.faceCount} Face${tracking.faceCount !== 1 ? 's' : ''}` : 'No Face'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Look Away Timer</span>
            <span className={tracking?.isLookingAway ? 'text-red-700' : 'text-slate-700'}>
              {tracking ? formatDuration(tracking.lookAwayDuration) : '--'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">No Face Timer</span>
            <span className={!tracking?.hasFace ? 'text-red-700' : 'text-slate-700'}>
              {tracking ? formatDuration(tracking.noFaceDuration) : '--'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Multiple Face Timer</span>
            <span className={tracking?.hasMultipleFaces ? 'text-red-700' : 'text-slate-700'}>
              {tracking ? formatDuration(tracking.multipleFaceDuration) : '--'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
