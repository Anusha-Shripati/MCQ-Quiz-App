import React from 'react';

interface MultipleScreensWarningProps {
  onRetry: () => void;
  isFirefox?: boolean;
}

const MultipleScreensWarning: React.FC<MultipleScreensWarningProps> = ({ 
  onRetry,
  isFirefox = false 
}) => {
  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 mt-10 border border-red-400">
      <div className="flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-12 h-12 text-red-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>
      
      <h2 className="text-xl font-bold text-center text-red-600 mb-4">Multiple Screens Detected</h2>
      
      <div className="text-gray-700 mb-6">
        <p className="mb-3">
          Our system has detected that you are using multiple screens or monitors. To ensure exam integrity, this exam can only be taken using a single screen.
        </p>
        <p className="mb-3">
          Please disconnect any additional monitors and use only your primary screen to proceed with the exam.
        </p>
        {isFirefox ? (
          <div className="bg-amber-50 p-3 rounded border border-amber-200 mb-4">
            <p className="font-semibold text-amber-800 mb-2">Firefox-specific instructions:</p>
            <ol className="list-decimal list-inside mb-2 text-amber-800">
              <li>Go to <strong>Settings</strong> {'>'} <strong>System</strong></li>
              <li>Under &quot;Display&quot;, ensure only one display is active</li>
              <li>Disconnect secondary displays</li>
              <li>You may need to restart Firefox after disconnecting displays</li>
            </ol>
          </div>
        ) : (
          <ol className="list-decimal list-inside mb-3">
            <li>Disconnect all additional monitors</li>
            <li>Close any screen mirroring applications</li>
            <li>Use only your primary screen</li>
            <li>Click the button below to retry</li>
          </ol>
        )}
      </div>
      
      <div className="flex justify-center">
        <button 
          onClick={onRetry} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Retry with Single Screen
        </button>
        
        {isFirefox && (
          <button
            onClick={() => window.location.reload()}
            className="ml-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-md transition-colors duration-300"
          >
            Refresh Page
          </button>
        )}
      </div>
    </div>
  );
};

export default MultipleScreensWarning;