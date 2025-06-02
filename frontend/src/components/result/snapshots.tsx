import React, { useCallback, useState } from 'react'
import { Content, List, Tabs, Trigger } from '../ui/form/tabs'
import { SnapShot } from '@/types/exam.types'
import dayjs from 'dayjs'

import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import Image from 'next/image';

interface SnapshotsProps {
    camera: SnapShot[],
    screenshots: SnapShot[]
}
function Snapshots(props: SnapshotsProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState('screenshots')
    const snapshots = ['camera', 'screenshots']
    const [index, setIndex] = useState(0)

    const toggle = (item: string, imgIndex: number) => {
        setOpen((prv) => !prv)
        setSelected(item)
        setIndex(imgIndex)
    }
    const renderDateTime = useCallback((time: number) => {
        return (time && dayjs(Number(time)).isValid()
            ? dayjs(
                String(time).length === 10
                    ? Number(time) * 1000
                    : Number(time)
            ).format('DD/MM/YYYY hh:mm A')
            : 'Invalid date')
    }, [])
    return (
        <div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-gray-600 dark:text-gray-300">
                <Tabs className="mt-8" defaultValue="screenshots">
                    <List className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                        <Trigger
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400"
                            value="screenshots"
                        >
                            Screenshots
                        </Trigger>
                        <Trigger
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400"
                            value="camera"
                        >
                            Camera snapshots
                        </Trigger>
                    </List>
                    {snapshots.map((item: keyof SnapshotsProps | string, index: number) => {
                        return <Content value={item} key={index}>
                            <div className='flex gap-2 flex-wrap justify-start'>
                                {props[item as keyof SnapshotsProps].map((img: SnapShot, index) => {
                                    return <div className="flex flex-col cursor-pointer transition-transform"  key={index} onClick={() => toggle(item, index)}>
                                        <div className="overflow-hidden rounded-lg mb-2">
                                            <Image
                                                src={img.image}
                                                alt="Snapshot"
                                                height={180}
                                                width={270}
                                                className="object-cover transition-all duration-300 hover:brightness-90"
                                            />
                                        </div>
                                        <div className="w-full text-center">
                                            <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-semibold px-3 py-1 rounded-full mb-1">
                                                {renderDateTime(img.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                })}
                            </div>
                        </Content>
                    })}
                </Tabs>
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
                            {props[selected as keyof SnapshotsProps].map((img, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    <Image
                                        src={img.image}
                                        alt="Snapshot"
                                        className="max-h-[70vh] object-contain rounded-lg shadow-lg"
                                    />
                                    <p className="legend bg-black/70 text-white px-4 py-2 rounded-b-lg " style={{ width: '20%',margin:'0px',left:'auto' }}>
                                        <span>{renderDateTime(img.timestamp)} </span>
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
