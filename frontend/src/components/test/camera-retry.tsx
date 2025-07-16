import React from 'react';

interface CameraRetryProps {
  onRetry: () => void;
  error: string | null;
}

const CameraRetry: React.FC<CameraRetryProps> = ({ onRetry, error }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-center mb-5">
          <div className="rounded-full bg-red-100 p-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-center mb-3">Camera Error</h2>
        
        <p className="text-gray-700 mb-4 text-center">
          {error || "We're having trouble accessing your camera."}
        </p>
        
        <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-5">
          <p className="text-sm text-amber-800 mb-2 font-semibold">Please try the following:</p>
          <ul className="text-sm text-amber-800 list-disc list-inside">
            <li>Make sure your camera is not being used by another application</li>
            <li>Check that camera permissions are enabled for this website</li>
            <li>Try closing and reopening your browser</li>
            <li>Try using a different browser if the issue persists</li>
          </ul>
        </div>
        
        <div className="flex justify-center">
          <button 
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md font-semibold transition-colors"
          >
            Retry Camera Access
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraRetry;