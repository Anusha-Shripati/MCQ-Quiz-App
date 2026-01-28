'use client';

import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

/**
 * Debug component to visualize face tracking
 * Shows real-time head pose angles and detection status
 */
export const FaceTrackingDebug = ({ videoRef }: { videoRef: HTMLVideoElement | null }) => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [headPose, setHeadPose] = useState({ yaw: 0, pitch: 0, roll: 0 });
  const [isLookingAway, setIsLookingAway] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        ]);
        setIsModelLoaded(true);
        console.log('Face tracking models loaded');
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    if (!isModelLoaded || !videoRef || !canvasRef.current) return;

    let isActive = true;

    const detectFace = async () => {
      if (!isActive || !videoRef || !canvasRef.current) return;

      try {
        const detection = await faceapi
          .detectSingleFace(videoRef, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        if (detection) {
          setFaceDetected(true);

          // Calculate head pose
          const landmarks = detection.landmarks.positions;
          const noseTip = landmarks[30];
          const leftEye = landmarks[36];
          const rightEye = landmarks[45];
          const chin = landmarks[8];

          const eyeCenter = {
            x: (leftEye.x + rightEye.x) / 2,
            y: (leftEye.y + rightEye.y) / 2,
          };

          const noseToEyeCenter = noseTip.x - eyeCenter.x;
          const eyeDistance = Math.abs(rightEye.x - leftEye.x);
          const yaw = (noseToEyeCenter / eyeDistance) * 90;

          const faceHeight = Math.abs(chin.y - eyeCenter.y);
          const noseToEyeVertical = noseTip.y - eyeCenter.y;
          const pitch = (noseToEyeVertical / faceHeight) * 45;

          const eyeSlope = (rightEye.y - leftEye.y) / (rightEye.x - leftEye.x);
          const roll = Math.atan(eyeSlope) * (180 / Math.PI);

          setHeadPose({ yaw, pitch, roll });

          const lookingAway =
            Math.abs(yaw) > 30 || Math.abs(pitch) > 30 || Math.abs(roll) > 45;
          setIsLookingAway(lookingAway);

          // Draw on canvas
          const canvas = canvasRef.current;
          if (canvas) {
            const displaySize = { width: videoRef.videoWidth, height: videoRef.videoHeight };
            faceapi.matchDimensions(canvas, displaySize);

            const resizedDetection = faceapi.resizeResults(detection, displaySize);
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              faceapi.draw.drawDetections(canvas, [resizedDetection]);
              faceapi.draw.drawFaceLandmarks(canvas, [resizedDetection]);
            }
          }
        } else {
          setFaceDetected(false);
          setIsLookingAway(true);
        }
      } catch (error) {
        console.error('Face detection error:', error);
      }

      if (isActive) {
        setTimeout(detectFace, 100);
      }
    };

    detectFace();

    return () => {
      isActive = false;
    };
  }, [isModelLoaded, videoRef]);

  if (!isModelLoaded) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg">
        <p>Loading face tracking models...</p>
      </div>
    );
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 pointer-events-none z-50"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg space-y-2 text-sm">
        <div className="font-bold text-lg mb-2">Face Tracking Debug</div>
        
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              faceDetected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span>{faceDetected ? 'Face Detected' : 'No Face'}</span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isLookingAway ? 'bg-red-500' : 'bg-green-500'
            }`}
          />
          <span>{isLookingAway ? 'Looking Away' : 'Looking at Screen'}</span>
        </div>

        <div className="border-t border-gray-600 pt-2 mt-2">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-gray-400">Yaw:</span>
            <span className={Math.abs(headPose.yaw) > 30 ? 'text-red-400' : ''}>
              {headPose.yaw.toFixed(1)}°
            </span>

            <span className="text-gray-400">Pitch:</span>
            <span className={Math.abs(headPose.pitch) > 30 ? 'text-red-400' : ''}>
              {headPose.pitch.toFixed(1)}°
            </span>

            <span className="text-gray-400">Roll:</span>
            <span className={Math.abs(headPose.roll) > 45 ? 'text-red-400' : ''}>
              {headPose.roll.toFixed(1)}°
            </span>
          </div>
        </div>

        <div className="text-xs text-gray-400 mt-2">
          Thresholds: Yaw/Pitch: 30°, Roll: 45°
        </div>
      </div>
    </>
  );
};
