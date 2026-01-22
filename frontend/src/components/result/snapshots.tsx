import React, { useCallback, useMemo, useState } from 'react'
import { SnapShot } from '@/types/exam.types'
import dayjs from 'dayjs'

import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import Image from 'next/image';
import ZoomableImage from './ZoomableImage';

interface SnapshotsProps {
    camera: SnapShot[],
    screenshots: SnapShot[]
}

interface MergedSnapshot {
    timestamp: number;
    cameraImage: string | null;
    screenshotImage: string | null;
}

function Snapshots(props: SnapshotsProps) {
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

        // Add all camera snapshots
        props.camera.forEach((cam) => {
            snapshotMap.set(cam.timestamp, {
                timestamp: cam.timestamp,
                cameraImage: cam.image,
                screenshotImage: null
            });
        });
        
        // Add all screenshots, merging with existing camera snapshots
        props.screenshots.forEach((screen) => {
            const existing = snapshotMap.get(screen.timestamp);
            if (existing) {
                existing.screenshotImage = screen.image;
            } else {
                snapshotMap.set(screen.timestamp, {
                    timestamp: screen.timestamp,
                    cameraImage: null,
                    screenshotImage: screen.image
                });
            }
        });

        // Convert to array and sort by timestamp (oldest first)
        return Array.from(snapshotMap.values()).sort((a, b) => a.timestamp - b.timestamp);
    }, [props.camera, props.screenshots]);

    return (
        <div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-gray-600 dark:text-gray-300">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Proctoring Snapshots
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Camera and screen captures taken at the same time during the exam
                </p>
                
                <div className='flex gap-8 flex-wrap justify-start'>
                    {mergedSnapshots.map((snapshot, idx) => {
                        return (
                          <div
                            className="flex flex-col cursor-pointer transition-transform hover:scale-[1.02]"
                            key={idx}
                            onClick={() => toggle(idx)}
                          >
                            <div className="bg-card flex gap-2 mb-2 bg-gray-200 rounded-md p-3">
                              {/* Camera Image */}
                              <div className="overflow-hidden rounded-lg border-2 border-blue-200 dark:border-blue-700">
                                {snapshot.cameraImage ? (
                                  <Image
                                    src={`${process.env.NEXT_PUBLIC_IMGAE_PREFIX}${snapshot.cameraImage}`}
                                    alt="Camera Snapshot"
                                    height={145}
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
                                  <div className="h-[135px] w-[180px] bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <span className="text-xs text-gray-500">No camera</span>
                                  </div>
                                )}
                                <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-semibold px-2 py-1 text-center">
                                  Camera
                                </div>
                              </div>

                              {/* Screenshot Image */}
                              <div className="overflow-hidden rounded-lg border-2 border-green-200 dark:border-green-700">
                                {snapshot.screenshotImage ? (
                                  <Image
                                    src={`${process.env.NEXT_PUBLIC_IMGAE_PREFIX}${snapshot.screenshotImage}`}
                                    alt="Screen Snapshot"
                                    height={135}
                                    width={180}
                                    priority
                                    unoptimized
                                    loading="eager"
                                    className="object-cover h-[135px] w-[180px] transition-all duration-300 hover:brightness-90"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = '/fallback.png';
                                    }}
                                  />
                                ) : (
                                  <div className="h-[135px] w-[180px] bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <span className="text-xs text-gray-500">No screen</span>
                                  </div>
                                )}
                                <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs font-semibold px-2 py-1 text-center">
                                  Screen
                                </div>
                              </div>
                            </div>

                            {/* Timestamp */}
                            <div className="w-full text-center">
                              <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold px-3 py-1 rounded-full">
                                {renderDateTime(snapshot.timestamp)}
                              </span>
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
                                    <div className="flex gap-6 justify-center items-start max-h-[90vh]">

                                        {/* Camera */}
                                        <div className="flex flex-col items-center">
                                            {snapshot.cameraImage ? (
                                                <ZoomableImage
                                                    src={`${process.env.NEXT_PUBLIC_IMGAE_PREFIX}${snapshot.cameraImage}`}
                                                    alt="Camera Snapshot"
                                                />
                                            ) : (
                                                <div className="w-[550px] h-[400px] bg-gray-700 flex items-center justify-center rounded-lg">
                                                    <span className="text-white">No camera snapshot</span>
                                                </div>
                                            )}
                                            <p className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                                                Camera
                                            </p>
                                        </div>

                                        {/* Screen */}
                                        <div className="flex flex-col items-center">
                                            {snapshot.screenshotImage ? (
                                                <ZoomableImage
                                                    src={`${process.env.NEXT_PUBLIC_IMGAE_PREFIX}${snapshot.screenshotImage}`}
                                                    alt="Screen Snapshot"
                                                />
                                            ) : (
                                                <div className="w-[550px] h-[400px] bg-gray-700 flex items-center justify-center rounded-lg">
                                                    <span className="text-white">No screen snapshot</span>
                                                </div>
                                            )}
                                            <p className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold">
                                                Screen
                                            </p>
                                        </div>
                                    </div>

                                    <p
                                        className="legend bg-black/70 text-white px-4 py-2 rounded-b-lg mt-4"
                                        style={{ width: "auto", margin: "10px auto 0", position: "relative" }}
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
    )
}

export default Snapshots
