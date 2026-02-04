import React, { useCallback, useMemo, useState } from 'react'
import { IntegrityEvidenceSnapshot, SnapShot, Violations } from '@/types/exam.types';
import dayjs from 'dayjs'

import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import Image from 'next/image';
import ZoomableImage from './ZoomableImage';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface SnapshotsProps {
  camera: SnapShot[];
  screenshots: SnapShot[];
  integrityEvidence?: {
    camera?: IntegrityEvidenceSnapshot[];
    screenshot?: IntegrityEvidenceSnapshot[];
  };
  violations?: Violations[];
}

interface MergedSnapshot {
    timestamp: number;
    cameraImage: string | null;
    screenshotImage: string | null;
    isIntegrityEvidence: boolean;
    eventType?: 'lookAway' | 'noFaceDetected' | 'multipleFaces';
    headPose?: {
        yaw: number;
        pitch: number;
        roll: number;
    };
    duration?: number;
    faceCount?: number;
}

function Snapshots(props: SnapshotsProps) {
    console.log('Rendering snapshots', props.integrityEvidence);
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0)

    const toggle = (imgIndex: number) => {
        setOpen((prv) => !prv)
        setIndex(imgIndex)
    }

    const renderDateTime = useCallback((time: number) => {
        return (time && dayjs(Number(time)).isValid()
            ? dayjs(
                String(time).length === 10
                    ? Number(time) * 1000
                    : Number(time)
            ).format('DD/MM/YYYY hh:mm:ss A')
            : 'Invalid date')
    }, [])

    // Merge camera and screenshot arrays by timestamp
    const mergedSnapshots = useMemo(() => {
        const snapshotMap = new Map<number, MergedSnapshot>();

        // Add all regular camera snapshots
        props.camera.forEach((cam) => {
            snapshotMap.set(cam.timestamp, {
                timestamp: cam.timestamp,
                cameraImage: cam.image,
                screenshotImage: null,
                isIntegrityEvidence: false
            });
        });
        
        // Add all regular screenshots, merging with existing camera snapshots
        props.screenshots.forEach((screen) => {
            const existing = snapshotMap.get(screen.timestamp);
            if (existing) {
                existing.screenshotImage = screen.image;
            } else {
                snapshotMap.set(screen.timestamp, {
                    timestamp: screen.timestamp,
                    cameraImage: null,
                    screenshotImage: screen.image,
                    isIntegrityEvidence: false
                });
            }
        });

        // Add integrity evidence camera snapshots (cheating detection)
        props.integrityEvidence?.camera?.forEach((cam) => {
            const timestamp = Number(cam.timestamp); // Ensure it's a number
            const existing = snapshotMap.get(timestamp);
            
            if (existing) {
                // If there's already an entry with this timestamp, update it
                existing.cameraImage = cam.image;
                existing.isIntegrityEvidence = true;
                existing.eventType = cam.eventType;
                existing.headPose = cam.headPose;
                existing.duration = cam.duration;
                existing.faceCount = cam.faceCount;
            } else {
                // Create new entry
                snapshotMap.set(timestamp, {
                    timestamp: timestamp,
                    cameraImage: cam.image,
                    screenshotImage: null,
                    isIntegrityEvidence: true,
                    eventType: cam.eventType,
                    headPose: cam.headPose,
                    duration: cam.duration,
                    faceCount: cam.faceCount
                });
            }
        });

        // Add integrity evidence screenshots (cheating detection)
        props.integrityEvidence?.screenshot?.forEach((screen) => {
            const timestamp = Number(screen.timestamp); // Ensure it's a number
            const existing = snapshotMap.get(timestamp);
            
            if (existing) {
                existing.screenshotImage = screen.image;
                existing.isIntegrityEvidence = true;
                existing.eventType = screen.eventType;
                existing.headPose = screen.headPose;
                existing.duration = screen.duration;
                existing.faceCount = screen.faceCount;
            } else {
                snapshotMap.set(timestamp, {
                    timestamp: timestamp,
                    cameraImage: null,
                    screenshotImage: screen.image,
                    isIntegrityEvidence: true,
                    eventType: screen.eventType,
                    headPose: screen.headPose,
                    duration: screen.duration,
                    faceCount: screen.faceCount
                });
            }
        });

        // Convert to array and sort by timestamp (oldest first)
        return Array.from(snapshotMap.values()).sort((a, b) => a.timestamp - b.timestamp);
    }, [props.camera, props.screenshots, props.integrityEvidence]);

    // Count integrity evidence
    const integrityEvidenceCount = useMemo(() => {
        return mergedSnapshots.filter(s => s.isIntegrityEvidence).length;
    }, [mergedSnapshots]);

    return (
      <div>
        <div className="bg-white dark:bg-primary p-6 rounded-xl shadow text-gray-600 dark:text-gray-300">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Proctoring Snapshots
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Camera and screen captures taken at the same time during the exam
          </p>

          {/* Integrity Evidence Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pr-3">
            {integrityEvidenceCount > 0 && (
              <div className="flex items-start gap-4 bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-700 rounded-xl p-5 shadow-sm">
                <div className="flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-7 h-7 text-red-600 dark:text-red-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>

                <div className="flex flex-col gap-1">
                  <h4 className="text-base font-semibold text-red-700 dark:text-red-300">
                    {integrityEvidenceCount} Potential Cheating{' '}
                    {integrityEvidenceCount === 1 ? 'Instance' : 'Instances'}
                  </h4>
                  <p className="text-sm text-red-600 dark:text-red-400 leading-relaxed">
                    Snapshots with red borders indicate potential cheating: looking away from screen, no face detected, or multiple faces detected.
                  </p>
                </div>
              </div>
            )}

            {props.violations && props.violations?.length > 0 && (
              <div className="flex items-start gap-4 bg-orange-50 dark:bg-orange-950 border border-orange-300 dark:border-orange-700 rounded-xl p-5 shadow-sm">
                <div className="flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-7 h-7 text-orange-600 dark:text-orange-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="text-base font-semibold text-orange-700 dark:text-orange-300">
                    {props?.violations?.length} Rule{' '}
                    {props?.violations?.length === 1 ? 'Violation' : 'Violations'}
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {props?.violations?.map((violation, index) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger>
                            <span
                              key={index}
                              className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                            >
                              {violation.type}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-semibold">
                              Timestamp: {dayjs(Number(violation.timestamp)).format('HH:mm:ss')}
                            </p>
                            <p className="font-semibold">Details: {violation.details}.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-8 flex-wrap justify-start">
            {mergedSnapshots.map((snapshot, idx) => {
              return (
                <div
                  className="flex flex-col cursor-pointer transition-transform hover:scale-[1.02]"
                  key={idx}
                  onClick={() => toggle(idx)}
                >
                  <div
                    className={`bg-card flex gap-2 mb-2 rounded-md p-3 ${
                      snapshot.isIntegrityEvidence
                        ? 'bg-red-50 dark:bg-red-950'
                        : 'bg-gray-200 dark:bg-secondary'
                    }`}
                  >
                    <div
                      className={`overflow-hidden rounded-lg border-2 ${
                        snapshot.isIntegrityEvidence
                          ? 'border-red-500 dark:border-red-600'
                          : 'border-blue-200 dark:border-blue-700'
                      }`}
                    >
                      {snapshot.cameraImage ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_IMGAE_PREFIX}${snapshot.cameraImage}`}
                          alt="Camera Snapshot"
                          height={140}
                          width={200}
                          priority
                          unoptimized
                          loading="eager"
                          className="object-cover h-[140px] w-[200px] transition-all duration-300 hover:brightness-90"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/fallback.png';
                          }}
                        />
                      ) : (
                        <div className="h-[140px] w-[200px] bg-gray-200 dark:bg-secondary flex items-center justify-center">
                          <span className="text-xs text-gray-500">No camera</span>
                        </div>
                      )}
                      <div
                        className={`text-xs font-semibold px-2 py-1 text-center ${
                          snapshot.isIntegrityEvidence
                            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
                            : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                        }`}
                      >
                        Camera
                      </div>
                    </div>

                    {/* Screenshot Image */}
                    <div
                      className={`overflow-hidden rounded-lg border-2 ${
                        snapshot.isIntegrityEvidence
                          ? 'border-red-500 dark:border-red-600'
                          : 'border-green-200 dark:border-green-700'
                      }`}
                    >
                      {snapshot.screenshotImage ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_IMGAE_PREFIX}${snapshot.screenshotImage}`}
                          alt="Screen Snapshot"
                          height={140}
                          width={200}
                          priority
                          unoptimized
                          loading="eager"
                          className="object-cover h-[140px] w-[200px] transition-all duration-300 hover:brightness-90"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/fallback.png';
                          }}
                        />
                      ) : (
                        <div className="h-[140px] w-[200px] bg-gray-200 dark:bg-secondary flex items-center justify-center">
                          <span className="text-xs text-gray-500">No screen</span>
                        </div>
                      )}
                      <div
                        className={`text-xs font-semibold px-2 py-1 text-center ${
                          snapshot.isIntegrityEvidence
                            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
                            : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                        }`}
                      >
                        Screen
                      </div>
                    </div>
                  </div>

                  {/* Timestamp and Details */}
                  <div className="w-full text-center space-y-1">
                    <span
                      className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                        snapshot.isIntegrityEvidence
                          ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
                          : 'bg-gray-100 dark:bg-secondary text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {renderDateTime(snapshot.timestamp)}
                    </span>

                    {/* Show head pose info for integrity evidence */}
                    {/* {snapshot.isIntegrityEvidence && snapshot.headPose && (
                                <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                                  Yaw: {snapshot.headPose.yaw.toFixed(1)}° | Pitch:{' '}
                                  {snapshot.headPose.pitch.toFixed(1)}° | Roll:{' '}
                                  {snapshot.headPose.roll.toFixed(1)}°
                                </div>
                              )} */}

                    {/* Show violation details */}
                    {snapshot.isIntegrityEvidence && (
                      <div className="text-xs text-red-600 dark:text-red-400 font-medium space-y-1">
                        {snapshot.eventType === 'multipleFaces' && snapshot.faceCount && (
                          <div>Multiple Faces: {snapshot.faceCount} detected</div>
                        )}
                        {snapshot.eventType === 'noFaceDetected' && (
                          <div>No Face Detected</div>
                        )}
                        {snapshot.eventType === 'lookAway' && (
                          <div>Looking Away</div>
                        )}
                        {snapshot.duration && (
                          <div>Duration: {(snapshot.duration / 1000).toFixed(1)}s</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {mergedSnapshots.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No snapshots available
            </div>
          )}
        </div>

        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
            <button
              className="absolute top-6 right-8 text-white text-3xl font-bold z-50 hover:text-red-400 transition"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="w-full px-2">
              <Carousel
                selectedItem={index}
                showThumbs={false}
                showStatus={false}
                infiniteLoop
                useKeyboardArrows
                className="rounded-xl overflow-hidden"
              >
                {mergedSnapshots.map((snapshot, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    {/* Integrity Evidence Warning */}
                    {snapshot.isIntegrityEvidence && (
                      <div className="mb-4 flex items-center gap-3 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                          />
                        </svg>
                        <div className="text-left">
                          <div className="font-bold text-lg">
                            {snapshot.eventType === 'multipleFaces' && 'MULTIPLE FACES DETECTED'}
                            {snapshot.eventType === 'noFaceDetected' && 'NO FACE DETECTED'}
                            {snapshot.eventType === 'lookAway' && 'LOOKING AWAY DETECTED'}
                          </div>
                          {snapshot.eventType === 'multipleFaces' && snapshot.faceCount && (
                            <div className="text-sm">
                              {snapshot.faceCount} faces detected in camera frame
                            </div>
                          )}
                          {snapshot.eventType === 'noFaceDetected' && (
                            <div className="text-sm">
                              Candidate face not visible in camera frame
                            </div>
                          )}
                          {snapshot.eventType === 'lookAway' && snapshot.headPose && (
                            <div className="text-sm">
                              Head Pose - Yaw: {snapshot.headPose.yaw.toFixed(1)}° | Pitch:{' '}
                              {snapshot.headPose.pitch.toFixed(1)}° | Roll:{' '}
                              {snapshot.headPose.roll.toFixed(1)}°
                            </div>
                          )}
                          {snapshot.duration && (
                            <div className="text-sm">
                              {snapshot.eventType === 'multipleFaces' && `Multiple faces detected for: ${(snapshot.duration / 1000).toFixed(1)} seconds`}
                              {snapshot.eventType === 'noFaceDetected' && `No face detected for: ${(snapshot.duration / 1000).toFixed(1)} seconds`}
                              {snapshot.eventType === 'lookAway' && `Looking away for: ${(snapshot.duration / 1000).toFixed(1)} seconds`}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-6 justify-center items-start max-h-[90vh]">
                      {/* Camera */}
                      <div className="flex flex-col items-center">
                        {snapshot.cameraImage ? (
                          <div
                            className={`rounded-lg overflow-hidden ${
                              snapshot.isIntegrityEvidence ? 'ring-4 ring-red-500' : ''
                            }`}
                          >
                            <ZoomableImage
                              src={`${process.env.NEXT_PUBLIC_IMGAE_PREFIX}${snapshot.cameraImage}`}
                              alt="Camera Snapshot"
                            />
                          </div>
                        ) : (
                          <div className="w-[550px] h-[400px] bg-gray-700 flex items-center justify-center rounded-lg">
                            <span className="text-white">No camera snapshot</span>
                          </div>
                        )}
                        <p
                          className={`mt-2 px-4 py-2 rounded-lg font-semibold ${
                            snapshot.isIntegrityEvidence
                              ? 'bg-red-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          Camera
                        </p>
                      </div>

                      {/* Screen */}
                      <div className="flex flex-col items-center">
                        {snapshot.screenshotImage ? (
                          <div
                            className={`rounded-lg overflow-hidden ${
                              snapshot.isIntegrityEvidence ? 'ring-4 ring-red-500' : ''
                            }`}
                          >
                            <ZoomableImage
                              src={`${process.env.NEXT_PUBLIC_IMGAE_PREFIX}${snapshot.screenshotImage}`}
                              alt="Screen Snapshot"
                            />
                          </div>
                        ) : (
                          <div className="w-[550px] h-[400px] bg-gray-700 flex items-center justify-center rounded-lg">
                            <span className="text-white">No screen snapshot</span>
                          </div>
                        )}
                        <p
                          className={`mt-2 px-4 py-2 rounded-lg font-semibold ${
                            snapshot.isIntegrityEvidence
                              ? 'bg-red-600 text-white'
                              : 'bg-green-600 text-white'
                          }`}
                        >
                          Screen
                        </p>
                      </div>
                    </div>

                    <p
                      className="legend bg-black/70 text-white px-4 py-2 rounded-b-lg mt-4"
                      style={{ width: 'auto', margin: '10px auto 0', position: 'relative' }}
                    >
                      <span>{renderDateTime(snapshot.timestamp)}</span>
                    </p>
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        )}
      </div>
    );
}

export default Snapshots
