import React from 'react';

interface CheckValidDeviceProps {
  isMobile?: boolean;
  isTablet?: boolean;
}

const CheckValidDevice: React.FC<CheckValidDeviceProps> = ({ isMobile, isTablet }) => {
  const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : '';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div 
        className="w-full md:w-4/5 lg:w-3/5 xl:w-2/5 max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-5 sm:p-8 text-center animate-fadeIn"
        style={{
          backgroundImage: 'linear-gradient(to right bottom, #ffffff, #fafafa)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div className="mb-5 sm:mb-6 flex justify-center">
          <div className="bg-red-100 p-3 sm:p-4 rounded-full">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-10 w-10 sm:h-12 sm:w-12 text-red-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">Device Not Supported</h1>
        
        <p className="text-gray-600 mb-5 sm:mb-6 text-sm sm:text-base">
          This exam is designed to be taken on a desktop or laptop computer. 
          {deviceType && (
            <span> Your current device <span className="font-semibold">({deviceType})</span> is not supported.</span>
          )}
        </p>

        <div className="bg-gray-100 p-4 rounded-lg mb-5 sm:mb-6 shadow-inner">
          <h2 className="font-medium text-gray-800 mb-2 text-sm sm:text-base">Please use:</h2>
          <ul className="text-left text-gray-600 space-y-2 text-sm sm:text-base">
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>A desktop or laptop computer</span>
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>A modern browser (Chrome, Firefox, Edge, or Safari)</span>
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>A webcam and microphone</span>
            </li>
            <li className='flex items-center'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>A stable internet connection</span>
            </li>
            <li className='flex items-center'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Screen sharing required</span>
            </li>
          </ul>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="text-xs sm:text-sm text-gray-500">
            For the best experience and to ensure proper proctoring, please switch to a desktop device or contact support if you need assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckValidDevice;