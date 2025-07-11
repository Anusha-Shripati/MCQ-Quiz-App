'use client';

import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { Button } from '../ui/form/button';
import { Camera, User, AlertTriangle, RefreshCw, Users, CheckCircle2, XCircle, MoveHorizontal, ShieldAlert } from 'lucide-react';
import { loadFaceDetectionModels, checkFaceCentered, checkFaceSize, detectMultipleFaces } from '@/components/test/testUtils/faceApiUtils';

interface FaceVerificationProps {
  onVerificationComplete: () => void;
  cameraStream: MediaStream | null;
}

const FaceVerification: React.FC<FaceVerificationProps> = ({
  onVerificationComplete,
  cameraStream
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'processing' | 'success' | 'failed' | 'loading' | 'multiple-faces'>('loading');
  const [faceDetected, setFaceDetected] = useState(false);
  const [multipleFacesDetected, setMultipleFacesDetected] = useState(false);
  const [isCentered, setIsCentered] = useState(false);
  const [isStable, setIsStable] = useState(false);
  const [isProperSize, setIsProperSize] = useState(false);
  const [message, setMessage] = useState('Preparing face verification...');
  const [loadingProgress, setLoadingProgress] = useState('');
  const [faceCount, setFaceCount] = useState(0);
  const [verificationProgress, setVerificationProgress] = useState(0);
  
  const stabilityBuffer = useRef<Array<{x: number, y: number, width: number, height: number}>>([]);
  const stabilityThreshold = 10;
  const detectionInterval = useRef<NodeJS.Timeout | null>(null);
  const successCountRef = useRef(0);
  const requiredSuccessCount = 15;
  const multipleFacesCountRef = useRef(0);
  const multipleFacesThreshold = 10;
  
  // Load face detection models
  const initModels = async () => {
    setVerificationStatus('loading');
    const success = await loadFaceDetectionModels(setLoadingProgress);
    
    if (success) {
      setModelsLoaded(true);
      setMessage('Models loaded. Position your face in the frame.');
      setVerificationStatus('pending');
    } else {
      setMessage('Failed to load face detection models. Please try again.');
      setVerificationStatus('failed');
    }
  };
  
  useEffect(() => {
    initModels();
    
    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, []);
  
  // Set up video stream
  useEffect(() => {
    if (!cameraStream || !videoRef.current || !modelsLoaded) return;
    
    videoRef.current.srcObject = cameraStream;
    
    const playVideo = async () => {
      try {
        await videoRef.current?.play();
        startFaceDetection();
      } catch (error) {
        console.error('Error playing video:', error);
        setMessage('Failed to access camera stream. Please check your camera permissions.');
        setVerificationStatus('failed');
      }
    };
    
    playVideo();
    
    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, [cameraStream, modelsLoaded]);

  const checkStability = (detection: faceapi.FaceDetection | null) => {
    if (!detection) return false;
    
    const { x, y, width, height } = detection.box;
    
    // Add current position to buffer
    stabilityBuffer.current.push({ x, y, width, height });
    
    // Keep only the last 10 positions
    if (stabilityBuffer.current.length > 10) {
      stabilityBuffer.current.shift();
    }
    
    // Need at least 5 positions to check stability
    if (stabilityBuffer.current.length < 5) return false;
    
    // Calculate average movement
    let totalMovement = 0;
    
    for (let i = 1; i < stabilityBuffer.current.length; i++) {
      const prev = stabilityBuffer.current[i - 1];
      const curr = stabilityBuffer.current[i];
      
      // Calculate movement as Manhattan distance
      const movement = 
        Math.abs(prev.x - curr.x) + 
        Math.abs(prev.y - curr.y);
      
      totalMovement += movement;
    }
    
    const avgMovement = totalMovement / (stabilityBuffer.current.length - 1);
    return avgMovement < stabilityThreshold;
  };
  
  const startFaceDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setVerificationStatus('processing');
    setMessage('Position your face in the center of the frame');
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Ensure canvas matches video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    
    detectionInterval.current = setInterval(async () => {
      if (!video || !ctx) return;
      
      try {
        // First check for multiple faces
        const multipleDetections = await detectMultipleFaces(video);
        const facesDetected = multipleDetections.length;
        setFaceCount(facesDetected);
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Apply transformation for mirrored drawing
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        
        // Draw camera frame guide
        drawCameraGuide(ctx, canvas.width, canvas.height);
        
        // Handle multiple faces
        if (facesDetected > 1) {
          multipleFacesCountRef.current += 1;
          
          // Draw all detected faces
          multipleDetections.forEach((detection, index) => {
            // Support both detection.box and detection.detection.box
            type DetectionWithBox = { box: faceapi.Box } | { detection: { box: faceapi.Box } };
            const det = detection as DetectionWithBox;
            const box =
              'box' in det
                ? det.box
                : 'detection' in det && det.detection && 'box' in det.detection
                  ? det.detection.box
                  : null;
            if (!box) return;
            const { x, y, width, height } = box;
            
            // Draw red rectangle for multiple faces
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);
            
            // Add pulsing effect
            const pulseOpacity = 0.3 + 0.2 * Math.sin(Date.now() / 200);
            ctx.fillStyle = `rgba(239, 68, 68, ${pulseOpacity})`;
            ctx.fillRect(x, y, width, height);
            
            // Label each face
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`Face ${index + 1}`, x + width/2, y - 10);
          });
          
          // Show warning if multiple faces detected consistently
          if (multipleFacesCountRef.current >= multipleFacesThreshold) {
            setMultipleFacesDetected(true);
            setVerificationStatus('multiple-faces');
            setMessage('Multiple faces detected. Only one person should be visible.');
            
            // Draw warning text with animation
            const warningOpacity = 0.7 + 0.3 * Math.sin(Date.now() / 300);
            ctx.fillStyle = `rgba(239, 68, 68, ${warningOpacity})`;
            ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 18px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⚠️ MULTIPLE FACES DETECTED', canvas.width / 2, canvas.height - 30);
          }
        } else {
          // Reset counter if we don't detect multiple faces
          multipleFacesCountRef.current = 0;
          setMultipleFacesDetected(false);
          
          // If we're in multiple faces state but don't detect multiple faces anymore, go back to processing
          if (verificationStatus === 'multiple-faces') {
            setVerificationStatus('processing');
          }
          
          // Continue with single face detection
          const detection = facesDetected === 1 ? 
            multipleDetections[0] : 
            await faceapi.detectSingleFace(
              video, 
              new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 })
            );
          
          const facePresent = !!detection;
          setFaceDetected(facePresent);
          
          if (facePresent) {
            // Update verification checks
            const stable = checkStability(detection);
            const centered = checkFaceCentered(detection, video.videoWidth, video.videoHeight);
            const properSize = checkFaceSize(detection, video.videoWidth, video.videoHeight);
            
            setIsStable(stable);
            setIsCentered(centered);
            setIsProperSize(properSize);
            
            // Draw face rectangle with visual feedback based on alignment
            const { x, y, width, height } = detection.box;
            
            // Base rectangle color based on overall status
            let rectColor = '#4ade80'; // Default green
            if (!centered) rectColor = '#f97316'; // Orange for not centered
            if (!stable) rectColor = '#8b5cf6'; // Purple for not stable
            if (!properSize) rectColor = '#f59e0b'; // Amber for wrong size
            
            // Draw face outline with pulsing effect for feedback
            ctx.strokeStyle = rectColor;
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);
            
            // Add corner highlights for better visibility
            const cornerSize = 15;
            ctx.lineWidth = 4;
            
            // Top-left corner
            ctx.beginPath();
            ctx.moveTo(x, y + cornerSize);
            ctx.lineTo(x, y);
            ctx.lineTo(x + cornerSize, y);
            ctx.stroke();
            
            // Top-right corner
            ctx.beginPath();
            ctx.moveTo(x + width - cornerSize, y);
            ctx.lineTo(x + width, y);
            ctx.lineTo(x + width, y + cornerSize);
            ctx.stroke();
            
            // Bottom-left corner
            ctx.beginPath();
            ctx.moveTo(x, y + height - cornerSize);
            ctx.lineTo(x, y + height);
            ctx.lineTo(x + cornerSize, y + height);
            ctx.stroke();
            
            // Bottom-right corner
            ctx.beginPath();
            ctx.moveTo(x + width - cornerSize, y + height);
            ctx.lineTo(x + width, y + height);
            ctx.lineTo(x + width, y + height - cornerSize);
            ctx.stroke();
            
            // Draw status indicators in an improved style
            drawImprovedStatusIndicators(ctx, video.videoWidth, video.videoHeight, {
              faceDetected: true,
              isCentered: centered,
              isStable: stable,
              isProperSize: properSize
            });
            
            // Update message based on what needs fixing
            if (!centered) {
              setMessage('Move your face to the center of the frame');
              
              // Add visual guides for centering
              drawCenteringGuide(ctx, x, y, width, height, video.videoWidth, video.videoHeight);
            } else if (!stable) {
              setMessage('Please hold still');
              
              // Add visual indicator for stability
              drawStabilityIndicator(ctx, stabilityBuffer.current, canvas.width);
            } else if (!properSize) {
              setMessage('Move closer or further from the camera');
              
              // Add visual guide for proper sizing
              drawSizeGuide(ctx, x, y, width, height, video.videoWidth, video.videoHeight);
            } else {
              setMessage('Great! Verifying your face...');
              
              // If all criteria met, increment success counter
              successCountRef.current += 1;
              
              // Update verification progress bar
              const progress = Math.min(100, Math.round((successCountRef.current / requiredSuccessCount) * 100));
              setVerificationProgress(progress);
              
              // Draw verification progress
              drawVerificationProgress(ctx, canvas.width, canvas.height, progress);
              
              // If enough consecutive successful frames, complete verification
              if (successCountRef.current >= requiredSuccessCount) {
                setVerificationStatus('success');
                if (detectionInterval.current) {
                  clearInterval(detectionInterval.current);
                }
              }
            }
          } else {
            // Reset success counter if face not detected
            successCountRef.current = 0;
            setVerificationProgress(0);
            
            // Show "no face detected" message
            drawNoFaceDetectedGuide(ctx, canvas.width, canvas.height);
            setMessage('No face detected. Please position your face in the frame.');
          }
        }
        
        // Restore the canvas transformation
        ctx.restore();
      } catch (error) {
        console.error('Face detection error:', error);
        // Don't set failed status here - just log the error
        // This prevents intermittent detection errors from stopping the process
      }
    }, 100);
  };
  
  // New helper drawing functions for enhanced UI
  
  const drawCameraGuide = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Draw subtle frame guides
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    
    // Rule of thirds grid
    ctx.beginPath();
    ctx.moveTo(width / 3, 0);
    ctx.lineTo(width / 3, height);
    ctx.moveTo(width * 2 / 3, 0);
    ctx.lineTo(width * 2 / 3, height);
    ctx.moveTo(0, height / 3);
    ctx.lineTo(width, height / 3);
    ctx.moveTo(0, height * 2 / 3);
    ctx.lineTo(width, height * 2 / 3);
    ctx.stroke();
    
    // Face positioning ideal area - center oval
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(
      width / 2,
      height / 2,
      width / 4,
      height / 3,
      0,
      0,
      2 * Math.PI
    );
    ctx.stroke();
  };
  
  const drawCenteringGuide = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    faceWidth: number,
    faceHeight: number,
    videoWidth: number,
    videoHeight: number
  ) => {
    // Calculate how off-center the face is
    const faceCenterX = x + faceWidth / 2;
    const faceCenterY = y + faceHeight / 2;
    const videoCenterX = videoWidth / 2;
    const videoCenterY = videoHeight / 2;
    
    // Draw center target
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    
    // Draw target at center of video
    ctx.beginPath();
    ctx.arc(videoCenterX, videoCenterY, 10, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(videoCenterX, videoCenterY, 20, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Draw arrow from face to center
    ctx.beginPath();
    ctx.moveTo(faceCenterX, faceCenterY);
    ctx.lineTo(videoCenterX, videoCenterY);
    ctx.stroke();
    
    // Arrow head
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const angle = Math.atan2(videoCenterY - faceCenterY, videoCenterX - faceCenterX);
    ctx.beginPath();
    ctx.moveTo(
      videoCenterX - 15 * Math.cos(angle - Math.PI / 6),
      videoCenterY - 15 * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(videoCenterX, videoCenterY);
    ctx.lineTo(
      videoCenterX - 15 * Math.cos(angle + Math.PI / 6),
      videoCenterY - 15 * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  };
  
  const drawStabilityIndicator = (
    ctx: CanvasRenderingContext2D,
    stabilityBuffer: Array<{x: number, y: number, width: number, height: number}>,
    width: number,
  ) => {
    if (stabilityBuffer.length < 2) return;
    
    // Create a small motion graph in the corner
    const graphWidth = 120;
    const graphHeight = 50;
    const graphX = width - graphWidth - 20;
    const graphY = 20;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(graphX, graphY, graphWidth, graphHeight);
    
    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(graphX, graphY, graphWidth, graphHeight);
    
    // Title
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Stability', graphX + graphWidth/2, graphY - 5);
    
    // Calculate movement values for the graph
    const movements = [];
    for (let i = 1; i < stabilityBuffer.length; i++) {
      const prev = stabilityBuffer[i - 1];
      const curr = stabilityBuffer[i];
      
      // Calculate movement as Manhattan distance
      const movement = Math.abs(prev.x - curr.x) + Math.abs(prev.y - curr.y);
      movements.push(movement);
    }
    
    // Find max for scaling
    const maxMovement = Math.max(...movements, stabilityThreshold * 2);
    
    // Draw movement graph
    ctx.beginPath();
    movements.forEach((movement, i) => {
      const x = graphX + 5 + (i / (movements.length - 1)) * (graphWidth - 10);
      const y = graphY + graphHeight - 5 - ((movement / maxMovement) * (graphHeight - 10));
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    // Style based on stability
    const isStable = movements.length > 0 && 
      movements.slice(-3).every(m => m < stabilityThreshold);
    
    ctx.strokeStyle = isStable ? '#4ade80' : '#f97316';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw threshold line
    const thresholdY = graphY + graphHeight - 5 - 
      ((stabilityThreshold / maxMovement) * (graphHeight - 10));
    
    ctx.beginPath();
    ctx.moveTo(graphX + 5, thresholdY);
    ctx.lineTo(graphX + graphWidth - 5, thresholdY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Threshold', graphX + 8, thresholdY - 3);
  };
  
  const drawSizeGuide = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    faceWidth: number,
    faceHeight: number,
    videoWidth: number,
    videoHeight: number,
  ) => {
    // Calculate face area percentage
    const faceArea = faceWidth * faceHeight;
    const videoArea = videoWidth * videoHeight;
    const facePercentage = faceArea / videoArea;
    
    // Determine if face is too small or too large
    const isTooSmall = facePercentage < 0.10;
    const isTooLarge = facePercentage > 0.50;
    
    // Draw ideal face size frame
    const idealWidth = videoWidth * 0.25;  // 25% of frame width
    const idealHeight = videoHeight * 0.33; // 33% of frame height
    const idealX = (videoWidth - idealWidth) / 2;
    const idealY = (videoHeight - idealHeight) / 2;
    
    // Draw ideal frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(idealX, idealY, idealWidth, idealHeight);
    ctx.setLineDash([]);
    
    // Draw arrows indicating direction to move
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 16px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    
    if (isTooSmall) {
      // Draw "move closer" indicator
      ctx.fillText('MOVE CLOSER', videoWidth / 2, videoHeight - 30);
      
      // Inward pointing arrows
      const arrowSize = 20;
      const arrowMargin = 50;
      
      // Left arrow
      ctx.beginPath();
      ctx.moveTo(arrowMargin + arrowSize, videoHeight / 2);
      ctx.lineTo(arrowMargin, videoHeight / 2);
      ctx.lineTo(arrowMargin + arrowSize/2, videoHeight / 2 - arrowSize/2);
      ctx.fill();
      
      // Right arrow
      ctx.beginPath();
      ctx.moveTo(videoWidth - arrowMargin - arrowSize, videoHeight / 2);
      ctx.lineTo(videoWidth - arrowMargin, videoHeight / 2);
      ctx.lineTo(videoWidth - arrowMargin - arrowSize/2, videoHeight / 2 - arrowSize/2);
      ctx.fill();
    }
    
    if (isTooLarge) {
      // Draw "move back" indicator
      ctx.fillText('MOVE BACK', videoWidth / 2, videoHeight - 30);
      
      // Outward pointing arrows
      const arrowSize = 20;
      const arrowMargin = 30;
      
      // Left arrow
      ctx.beginPath();
      ctx.moveTo(arrowMargin, videoHeight / 2);
      ctx.lineTo(arrowMargin + arrowSize, videoHeight / 2);
      ctx.lineTo(arrowMargin + arrowSize/2, videoHeight / 2 - arrowSize/2);
      ctx.fill();
      
      // Right arrow
      ctx.beginPath();
      ctx.moveTo(videoWidth - arrowMargin, videoHeight / 2);
      ctx.lineTo(videoWidth - arrowMargin - arrowSize, videoHeight / 2);
      ctx.lineTo(videoWidth - arrowMargin - arrowSize/2, videoHeight / 2 - arrowSize/2);
      ctx.fill();
    }
  };
  
  const drawNoFaceDetectedGuide = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, width, height);
    
    // Face outline in center
    const outlineSize = Math.min(width, height) * 0.4;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw face silhouette
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    
    // Head
    ctx.beginPath();
    ctx.arc(centerX, centerY, outlineSize / 2, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Features (simplified)
    const eyeY = centerY - outlineSize / 8;
    const eyeWidth = outlineSize / 6;
    const eyeDistance = outlineSize / 5;
    
    // Left eye
    ctx.beginPath();
    ctx.arc(centerX - eyeDistance, eyeY, eyeWidth / 2, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Right eye
    ctx.beginPath();
    ctx.arc(centerX + eyeDistance, eyeY, eyeWidth / 2, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Mouth
    ctx.beginPath();
    ctx.arc(centerX, centerY + outlineSize / 5, outlineSize / 4, 0, Math.PI);
    ctx.stroke();
    
    // Text instruction
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Position your face in the frame', centerX, centerY + outlineSize);
    
    // Pulsing effect
    const pulseOpacity = 0.5 + 0.5 * Math.sin(Date.now() / 500);
    ctx.strokeStyle = `rgba(255, 255, 255, ${pulseOpacity})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, outlineSize / 1.5, 0, 2 * Math.PI);
    ctx.stroke();
  };
  
  const drawVerificationProgress = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    progress: number
  ) => {
    const barWidth = 200;
    const barHeight = 6;
    const barX = (width - barWidth) / 2;
    const barY = height - 40;
    
    // Background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Progress
    const progressWidth = (progress / 100) * barWidth;
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(barX, barY, progressWidth, barHeight);
    
    // Text
    ctx.fillStyle = 'white';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Verifying...', width / 2, barY - 10);
    
    // Progress percentage
    ctx.fillText(`${progress}%`, width / 2, barY + barHeight + 15);
  };
  
  const drawImprovedStatusIndicators = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    status: {
      faceDetected: boolean;
      isCentered: boolean;
      isStable: boolean;
      isProperSize: boolean;
    }
  ) => {
    const { faceDetected, isCentered, isStable, isProperSize } = status;
    const startX = 15;
    const startY = 15;
    const itemHeight = 30;
    const iconSize = 20;
    const padding = 5;
    
    // Background for status panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(
      startX - padding, 
      startY - padding, 
      150 + padding * 2,
      (itemHeight + padding) * 4
    );
    
    // Draw each status item
    drawStatusItem(ctx, startX, startY, 'Face Detected', faceDetected, iconSize);
    drawStatusItem(ctx, startX, startY + itemHeight, 'Centered', isCentered, iconSize);
    drawStatusItem(ctx, startX, startY + itemHeight * 2, 'Stable', isStable, iconSize);
    drawStatusItem(ctx, startX, startY + itemHeight * 3, 'Proper Size', isProperSize, iconSize);
  };
  
  const drawStatusItem = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    label: string,
    status: boolean,
    iconSize: number
  ) => {
    // Draw circle icon
    const centerY = y + iconSize / 2;
    
    if (status) {
      // Check mark icon
      ctx.beginPath();
      ctx.arc(x + iconSize / 2, centerY, iconSize / 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#4ade8080'; // Semi-transparent green
      ctx.fill();
      
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + iconSize * 0.25, centerY);
      ctx.lineTo(x + iconSize * 0.45, centerY + iconSize * 0.25);
      ctx.lineTo(x + iconSize * 0.75, centerY - iconSize * 0.25);
      ctx.stroke();
    } else {
      // X mark icon
      ctx.beginPath();
      ctx.arc(x + iconSize / 2, centerY, iconSize / 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#ef444480'; // Semi-transparent red
      ctx.fill();
      
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + iconSize * 0.3, centerY - iconSize * 0.2);
      ctx.lineTo(x + iconSize * 0.7, centerY + iconSize * 0.2);
      ctx.moveTo(x + iconSize * 0.3, centerY + iconSize * 0.2);
      ctx.lineTo(x + iconSize * 0.7, centerY - iconSize * 0.2);
      ctx.stroke();
    }
    
    // Draw label
    ctx.fillStyle = status ? '#ffffff' : '#cccccc';
    ctx.font = '14px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, x + iconSize + 10, centerY + 5);
  };
  
  const handleComplete = () => {
    if (verificationStatus === 'success') {
      onVerificationComplete();
    }
  };

  const handleRetry = () => {
    // Reset all state
    stabilityBuffer.current = [];
    successCountRef.current = 0;
    multipleFacesCountRef.current = 0;
    setMultipleFacesDetected(false);
    setFaceCount(0);
    setModelsLoaded(false);
    setFaceDetected(false);
    setIsCentered(false);
    setIsStable(false);
    setIsProperSize(false);
    setVerificationProgress(0);
    
    // Clear any existing intervals
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }
    
    // Start over
    initModels();
  };
  
  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl shadow-md border border-gray-200">
      <div className="mb-5 flex items-center gap-3">
        <Camera className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Face Verification</h2>
      </div>
      
      <div className="relative w-full max-w-lg rounded-lg overflow-hidden bg-black mb-6 shadow-lg">
        {/* Show loading overlay during loading/failed states */}
        {(verificationStatus === 'loading' || verificationStatus === 'failed') && (
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center z-10">
            {verificationStatus === 'loading' ? (
              <>
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-blue-400 border-b-transparent border-l-transparent animate-spin animation-delay-150"></div>
                  <div className="absolute inset-4 rounded-full border-4 border-t-transparent border-r-transparent border-b-blue-300 border-l-transparent animate-spin animation-delay-300"></div>
                  <Camera className="absolute inset-0 m-auto h-8 w-8 text-blue-400" />
                </div>
                <p className="text-blue-300 text-lg font-medium text-center px-8">
                  {loadingProgress || 'Initializing face detection...'}
                </p>
                <p className="text-gray-400 text-sm mt-3 max-w-xs text-center">
                  This may take a few moments depending on your connection speed
                </p>
              </>
            ) : (
              <div className="text-center p-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="h-12 w-12 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-red-500 mb-3">Face Detection Failed</h3>
                <p className="text-gray-300 mb-6 max-w-xs">
                  We couldn&#39;t initialize the face detection system. This could be due to your browser, 
                  network connection, or system resources.
                </p>
                <Button 
                  onClick={handleRetry}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 transition-all"
                >
                  <RefreshCw size={16} className="animate-spin-once" />
                  Try Again
                </Button>
              </div>
            )}
          </div>
        )}
        
        <video 
          ref={videoRef}
          muted
          playsInline
          className="w-full h-auto transform scale-x-[-1]"
        />
        <canvas 
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full transform scale-x-[-1]"
        />
        
        {/* Status overlay */}
        {verificationStatus !== 'loading' && verificationStatus !== 'failed' && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent pt-12 pb-4 px-5">
            <div className="flex items-center gap-3 mb-2">
              {verificationStatus === 'multiple-faces' ? (
                <div className="bg-red-600 p-1.5 rounded-full">
                  <Users size={16} className="text-white" />
                </div>
              ) : verificationStatus === 'success' ? (
                <div className="bg-green-600 p-1.5 rounded-full">
                  <CheckCircle2 size={16} className="text-white" />
                </div>
              ) : (
                <div className="bg-blue-600 p-1.5 rounded-full">
                  <Camera size={16} className="text-white" />
                </div>
              )}
              
              <p className={`font-medium text-base ${verificationStatus === 'multiple-faces' ? 'text-red-300' : verificationStatus === 'success' ? 'text-green-300' : 'text-white'}`}>
                {message}
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              <StatusBadge
                icon={<User size={13} />}
                label={faceDetected ? "Face Detected" : "No Face"}
                status={faceDetected ? "success" : "error"}
              />
              
              {multipleFacesDetected && (
                <StatusBadge
                  icon={<Users size={13} />}
                  label={`Multiple (${faceCount})`}
                  status="error"
                />
              )}
              
              {!multipleFacesDetected && faceDetected && (
                <>
                  <StatusBadge
                    icon={<MoveHorizontal size={13} />}
                    label={isCentered ? "Centered" : "Not Centered"}
                    status={isCentered ? "success" : "pending"}
                  />
                  
                  <StatusBadge
                    icon={<ShieldAlert size={13} />}
                    label={isStable ? "Stable" : "Movement"}
                    status={isStable ? "success" : "pending"}
                  />
                  
                  <StatusBadge
                    icon={<Camera size={13} />}
                    label={isProperSize ? "Good Size" : "Adjust Size"}
                    status={isProperSize ? "success" : "pending"}
                  />
                </>
              )}
              
              {verificationStatus === 'success' && (
                <StatusBadge
                  icon={<CheckCircle2 size={13} />}
                  label="Verified"
                  status="success"
                />
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="w-full max-w-lg">
        {verificationStatus === 'pending' && (
          <div className="flex justify-center">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-blue-300/30 border-b-blue-300/30 border-l-blue-300/30 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
        )}
        
        {verificationStatus === 'processing' && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-5 rounded-lg shadow-sm">
            <h3 className="font-semibold text-blue-800 flex items-center gap-2 mb-3">
              <Camera className="h-5 w-5 text-blue-700" />
              <span>Face Verification in Progress</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
                <h4 className="font-medium text-blue-800 mb-2">Position Requirements</h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-start gap-2">
                    <div className="min-w-5 pt-0.5">•</div>
                    <span>Center your face in the frame</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="min-w-5 pt-0.5">•</div>
                    <span>Hold still for a few seconds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="min-w-5 pt-0.5">•</div>
                    <span>Ensure your face is properly sized</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
                <h4 className="font-medium text-blue-800 mb-2">Environment Tips</h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-start gap-2">
                    <div className="min-w-5 pt-0.5">•</div>
                    <span>Ensure good lighting on your face</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="min-w-5 pt-0.5">•</div>
                    <span>Remove glasses or face coverings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="min-w-5 pt-0.5">•</div>
                    <span>Use a neutral background</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Progress bar */}
            {verificationProgress > 0 && (
              <div className="mt-5">
                <div className="flex justify-between text-xs text-blue-800 mb-1">
                  <span>Verification Progress</span>
                  <span>{verificationProgress}%</span>
                </div>
                <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${verificationProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {verificationStatus === 'multiple-faces' && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 p-5 rounded-lg shadow-md">
            <h3 className="font-bold text-red-800 flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-red-700" />
              <span>Multiple Faces Detected</span>
            </h3>
            
            <p className="text-red-700 mb-4">
              We detected more than one person in the camera view. For security purposes, 
              only one person should be visible during the verification and exam.
            </p>
            
            <div className="bg-white/80 rounded-lg p-4 border border-red-200 mb-4">
              <h4 className="font-medium text-red-800 mb-2">Please ensure:</h4>
              <ul className="space-y-2.5 text-sm text-red-700">
                <li className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>You are the only person visible in the camera frame</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>There are no photos, posters, or screens with faces in the background</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>No mirrors are reflecting other people or images</span>
                </li>
              </ul>
            </div>
            
            <Button
              onClick={handleRetry}
              className="mt-2 w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm shadow-red-300"
            >
              <RefreshCw size={18} />
              Try Again
            </Button>
          </div>
        )}
        
        {verificationStatus === 'failed' && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 p-5 rounded-lg shadow-sm">
            <h3 className="font-semibold text-red-800 flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Verification Failed</span>
            </h3>
            
            <p className="text-red-700 mb-4">
              We couldn&#39;t properly verify your face. This could be due to:
            </p>
            
            <ul className="space-y-2 text-sm text-red-700 mb-5">
              <li className="flex items-start gap-2">
                <div className="min-w-5 pt-0.5">•</div>
                <span>Poor lighting conditions</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="min-w-5 pt-0.5">•</div>
                <span>Camera permission issues</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="min-w-5 pt-0.5">•</div>
                <span>Face not clearly visible</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="min-w-5 pt-0.5">•</div>
                <span>Browser compatibility issues</span>
              </li>
            </ul>
            
            <Button
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Try Again
            </Button>
          </div>
        )}
        
        {verificationStatus === 'success' && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-5 rounded-lg shadow-md">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </div>
            
            <h3 className="font-bold text-green-800 text-center text-lg mb-2">
              Verification Successful
            </h3>
            
            <p className="text-green-700 text-center mb-5">
              Your identity has been verified successfully. You can now proceed to the exam.
            </p>
            
            <Button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-lg text-lg font-medium shadow-lg shadow-green-200 transition-all transform hover:translate-y-[-2px]"
            >
              Continue to Exam
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Status badge component for the video overlay
const StatusBadge = ({ 
  icon, 
  label, 
  status 
}: { 
  icon: React.ReactNode; 
  label: string; 
  status: 'success' | 'error' | 'pending' 
}) => {
  let bgColor = 'bg-gray-100/70';
  let textColor = 'text-gray-700';
  
  if (status === 'success') {
    bgColor = 'bg-green-100/70';
    textColor = 'text-green-800';
  } else if (status === 'error') {
    bgColor = 'bg-red-100/70';
    textColor = 'text-red-800';
  } else if (status === 'pending') {
    bgColor = 'bg-yellow-100/70';
    textColor = 'text-yellow-800';
  }
  
  return (
    <div className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${bgColor} ${textColor}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
};

export default FaceVerification;
