import React from 'react';

interface SafariWindowShareErrorProps {
  setShowSafariWindowShareError: (show: boolean) => void;
  setShowSafariScreenSharePrompt: (show: boolean) => void;
  cleanupScreenStream: () => void;
}

const SafariWindowShareError = ({
  setShowSafariWindowShareError,
  setShowSafariScreenSharePrompt,
  cleanupScreenStream,
}: SafariWindowShareErrorProps) => {
  const handleRetry = () => {
    // Ensure we properly clean up any existing screen stream before retrying
    cleanupScreenStream();
    
    // Hide the error and show the screen share prompt again
    setShowSafariWindowShareError(false);
    
    // Slight delay to ensure the DOM updates before showing the prompt
    setTimeout(() => {
      setShowSafariScreenSharePrompt(true);
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden transition-transform duration-300 scale-100">
        <div className="p-6 bg-amber-600 text-white">
          <h2 className="text-2xl font-bold">Safari: Window Sharing Detected</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center mb-6 text-amber-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
            <p className="font-semibold">We detected you&#39;re sharing a window instead of your screen</p>
          </div>

          <p className="mb-4 text-gray-600">
            In Safari, please make sure to select <strong>Screen</strong> in the sharing options dropdown, 
            not <strong>Window</strong> or <strong>Tab</strong>.
          </p>

          <div className="bg-gray-100 p-4 mb-6 rounded-lg border-l-4 border-amber-600">
            <p className="text-sm text-gray-700">
              <strong>Important:</strong> Safari requires full screen sharing for this exam. 
              When you retry, look for an option labeled &quot;Screen&quot; in the dropdown menu.
            </p>
          </div>

          <button
            onClick={handleRetry}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafariWindowShareError; 