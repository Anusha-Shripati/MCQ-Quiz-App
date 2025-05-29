import { TooltipContent } from '@/components/ui/tooltip';
import { CalendarEvent } from '@/types/common.types';
import Link from 'next/link';
import React from 'react'

function EventTooltip({ events, dateKey }: { events: CalendarEvent, dateKey: string }) {
    return (
        <TooltipContent className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white p-5 rounded-2xl shadow-2xl w-[420px] max-h-[520px] border border-gray-200 dark:border-gray-800 overflow-auto custom-scrollbar">
            <div className="w-full">
                {events[dateKey]?.length === 0 ? (
                    <div className="text-gray-400 dark:text-gray-500 italic text-center py-10 flex flex-col items-center justify-center">
                        <span className="text-3xl mb-2">📭</span>
                        <p className="mt-2 text-base">No interviews scheduled</p>
                    </div>
                ) : (
                    <>
                        <div className="font-bold text-lg mb-3 text-gray-800 dark:text-white flex items-center gap-2">
                            {new Date(dateKey).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </div>
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                                {events[dateKey].length} Interview{events[dateKey].length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
                            {events[dateKey].map((item, idx) => {
                                const baseColor = item.color || '#6b7280';
                                return (
                                    <div
                                        key={idx}
                                        className="flex flex-row items-stretch rounded-lg border-2 shadow-sm bg-gray-50 dark:bg-gray-800 transition-all duration-200 hover:shadow-lg"
                                        style={{
                                            borderColor: baseColor,
                                            marginBottom: 8,
                                            minHeight: 90,
                                        }}
                                    >
                                        <div
                                            className="w-2 rounded-l-lg"
                                            style={{
                                                background: baseColor,
                                                minHeight: '100%',
                                            }}
                                        />
                                        <div className="flex-1 px-6 py-4 flex flex-col justify-center">
                                            <div className="flex flex-row items-center justify-between mb-2">
                                                <span className="font-semibold text-base text-gray-900 dark:text-white truncate max-w-[60%]">
                                                    {item.meta?.assessment || `Event ${idx + 1}`}
                                                </span>
                                                <span
                                                    className="ml-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border"
                                                    style={{
                                                        background: baseColor + '15',
                                                        color: baseColor,
                                                        borderColor: baseColor,
                                                    }}
                                                >
                                                    {item.meta?.title}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">Name: </span>
                                                    <span className="text-gray-900 dark:text-gray-100">
                                                        {item.meta?.name || <span className="italic text-gray-400">N/A</span>}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">Experience: </span>
                                                    <span className="text-gray-900 dark:text-gray-100">
                                                        {`${item.meta?.experience} Y.` || <span className="italic text-gray-400">N/A</span>}
                                                    </span>
                                                </div>
                                                {item.meta?.percentage && <div>
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">Score: </span>
                                                    <span className="text-gray-900 dark:text-gray-100">
                                                        {item.meta.percentage} %
                                                    </span>
                                                </div>}
                                            </div>
                                            <div className='text-end w-full mt-1'>
                                                {item.meta?.resultId && <Link className='underline underline-offset-1' href={`/results/${item.meta?.resultId}`} target='_blank'>
                                                    View result
                                                </Link>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </TooltipContent>
    )
}

export default EventTooltip
