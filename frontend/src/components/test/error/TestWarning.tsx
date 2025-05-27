import React from 'react';

interface TestWarningProps {
    title: string;
    text: React.ReactNode;
    onClose?: () => void;
}

function TestWarning({ title, text, onClose }: TestWarningProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-2">
            <div className="w-full max-w-md rounded-xl shadow-2xl bg-white overflow-hidden animate-slide-down border border-red-200">
                {/* Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-red-600 to-red-400 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-white drop-shadow"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-.01-6a9 9 0 11-6.363 2.637A9 9 0 0112 3z" />
                        </svg>
                        <span className="text-white text-xl font-semibold drop-shadow">{title}</span>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            aria-label="Dismiss warning"
                            className="text-white hover:text-red-100 text-2xl font-bold focus:outline-none transition"
                        >
                            &times;
                        </button>
                    )}
                </div>
                {/* Content */}
                <div className="px-6 py-6">
                    <h3 className="text-lg font-bold text-red-700 mb-2">Attention Required</h3>
                    <div className="text-gray-700 text-base leading-relaxed">{text}</div>
                </div>
            </div>
            {/* Animation keyframes */}
            <style>
                {`
                @keyframes slide-down {
                    from { opacity: 0; transform: translateY(-30px);}
                    to { opacity: 1; transform: translateY(0);}
                }
                .animate-slide-down {
                    animation: slide-down 0.4s cubic-bezier(0.4,0,0.2,1);
                }
                `}
            </style>
        </div>
    );
}

export default TestWarning;