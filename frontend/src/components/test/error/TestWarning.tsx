import React from 'react';

function TestWarning({ title, text }: { title: string; text: any }) {
    return (
        <div className="flex justify-center items-center w-full min-h-[240px]">
            <div
                id="screen-share-warning"
                className="relative max-w-2xl mx-auto mt-16 rounded-3xl border-l-[16px] border-red-500 bg-white/95 backdrop-blur-lg shadow-2xl px-14 py-12 flex items-start gap-8"
            >
                {/* Decorative background accent */}
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-red-100 rounded-full blur-2xl opacity-60 pointer-events-none" />
                {/* Icon */}
                <div className="flex-shrink-0">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 text-red-500 drop-shadow-lg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-.01-6a9 9 0 11-6.363 2.637A9 9 0 0112 3z" />
                    </svg>
                </div>
                {/* Content */}
                <div>
                    <h3 className="text-3xl font-bold mb-2 tracking-wide text-red-700 drop-shadow">Attention Required</h3>
                    <p className="text-xl leading-relaxed">
                        <span className="font-semibold text-red-700">{title}</span>
                        <span className="text-red-500">.</span>
                        <br />
                        <span className="font-normal text-gray-700">{text}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default TestWarning;