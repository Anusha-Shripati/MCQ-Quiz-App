'use client';

import { X, Eye, RotateCcw, Timer, Camera } from 'lucide-react';
import { Button } from '@/components/ui/form/button';

interface FaceViolationDetails {
  timestamp: number;
  duration: number;
  headPose: {
    yaw: number;
    pitch: number;
    roll: number;
  };
  violationType: 'lookAway' | 'noFaceDetected' | 'multipleFaces';
  faceCount?: number;
  thresholds: {
    yawThreshold: number;
    pitchThreshold: number;
    rollThreshold: number;
  };
}

interface FaceViolationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  violationDetails: FaceViolationDetails;
}

export const FaceViolationPopup: React.FC<FaceViolationPopupProps> = ({
  isOpen,
  onClose,
  violationDetails
}) => {
  if (!isOpen) return null;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDuration = (duration: number) => {
    return `${(duration / 1000).toFixed(1)}s`;
  };

  const getViolationReason = () => {
    if (violationDetails.violationType === 'noFaceDetected') {
      return 'No face detected in camera frame';
    }

    if (violationDetails.violationType === 'multipleFaces') {
      return `Multiple faces detected in camera frame (${violationDetails.faceCount || 'unknown'} faces). Only one person should be visible during the exam.`;
    }

    const { yaw, pitch, roll } = violationDetails.headPose;
    const { yawThreshold, pitchThreshold, rollThreshold } = violationDetails.thresholds;
    
    const reasons = [];
    
    if (Math.abs(yaw) > yawThreshold) {
      reasons.push(`Head turned ${yaw > 0 ? 'right' : 'left'} (${Math.abs(yaw).toFixed(1)}° > ${yawThreshold}°)`);
    }
    
    if (Math.abs(pitch) > pitchThreshold) {
      reasons.push(`Head tilted ${pitch > 0 ? 'down' : 'up'} (${Math.abs(pitch).toFixed(1)}° > ${pitchThreshold}°)`);
    }
    
    if (Math.abs(roll) > rollThreshold) {
      reasons.push(`Head rolled ${roll > 0 ? 'clockwise' : 'counter-clockwise'} (${Math.abs(roll).toFixed(1)}° > ${rollThreshold}°)`);
    }

    return reasons.join(', ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-red-50">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">Face Violation Detected</h3>
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Violation Type */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h4 className="font-medium text-red-800 mb-2">Violation Type</h4>
            <p className="text-red-700 text-sm">
              {violationDetails.violationType === 'noFaceDetected' 
                ? 'Face Not Detected' 
                : violationDetails.violationType === 'multipleFaces'
                  ? 'Multiple Faces Detected'
                  : 'Looking Away from Screen'
              }
            </p>
            {violationDetails.violationType === 'multipleFaces' && (
              <p className="text-red-600 text-xs mt-1 font-medium">
                {violationDetails.faceCount} faces detected in frame
              </p>
            )}
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Timer className="h-4 w-4" />
            <span>Detected at: {formatTime(violationDetails.timestamp)}</span>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <RotateCcw className="h-4 w-4" />
            <span>Duration: {formatDuration(violationDetails.duration)}</span>
          </div>

          {/* Head Pose Details */}
          {violationDetails.violationType === 'lookAway' && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Head Pose Analysis
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Yaw (Left/Right):</span>
                  <span className={`font-medium ${Math.abs(violationDetails.headPose.yaw) > violationDetails.thresholds.yawThreshold ? 'text-red-600' : 'text-green-600'}`}>
                    {violationDetails.headPose.yaw.toFixed(1)}°
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Pitch (Up/Down):</span>
                  <span className={`font-medium ${Math.abs(violationDetails.headPose.pitch) > violationDetails.thresholds.pitchThreshold ? 'text-red-600' : 'text-green-600'}`}>
                    {violationDetails.headPose.pitch.toFixed(1)}°
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Roll (Tilt):</span>
                  <span className={`font-medium ${Math.abs(violationDetails.headPose.roll) > violationDetails.thresholds.rollThreshold ? 'text-red-600' : 'text-green-600'}`}>
                    {violationDetails.headPose.roll.toFixed(1)}°
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Multiple Faces Details */}
          {violationDetails.violationType === 'multipleFaces' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <h4 className="font-medium text-orange-800 mb-3 flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Multiple Face Detection
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-orange-600">Faces Detected:</span>
                  <span className="font-medium text-orange-800">
                    {violationDetails.faceCount || 'Unknown'}
                  </span>
                </div>
                
                <p className="text-orange-700 text-xs">
                  Only one person should be visible during the exam. Please ensure no one else is in the camera frame.
                </p>
              </div>
            </div>
          )}

          {/* Thresholds */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-800 mb-2">Detection Thresholds</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <div className="flex justify-between">
                <span>Yaw Threshold:</span>
                <span>±{violationDetails.thresholds.yawThreshold}°</span>
              </div>
              <div className="flex justify-between">
                <span>Pitch Threshold:</span>
                <span>±{violationDetails.thresholds.pitchThreshold}°</span>
              </div>
              <div className="flex justify-between">
                <span>Roll Threshold:</span>
                <span>±{violationDetails.thresholds.rollThreshold}°</span>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="font-medium text-yellow-800 mb-2">Violation Reason</h4>
            <p className="text-yellow-700 text-sm">
              {getViolationReason()}
            </p>
          </div>

          {/* Important Note */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h4 className="font-medium text-green-800 mb-2">Note</h4>
            <p className="text-green-700 text-sm">
              Face violations are recorded as integrity evidence but do NOT count toward the 5-violation limit that triggers automatic exam submission.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Continue Exam
          </Button>
        </div>
      </div>
    </div>
  );
};