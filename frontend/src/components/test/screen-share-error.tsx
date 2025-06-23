interface ScreenShareErrorModalProps {
  setShowScreenShareErrorModal: (show: boolean) => void;
  setShowFirefoxScreenSharePrompt: (show: boolean) => void;
}

const ScreenShareErrorModal = ({
  setShowScreenShareErrorModal,
  setShowFirefoxScreenSharePrompt,
}: ScreenShareErrorModalProps) => (
  <div className="fixed inset-0 bg-white flex items-center justify-center z-50 p-4 transition-all duration-300">
    <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden transition-transform duration-300 scale-100">
      <div className="p-6 bg-red-600 text-white">
        <h2 className="text-2xl font-bold">Incorrect Screen Selection</h2>
      </div>
      <div className="p-6">
        <div className="flex items-center mb-6 text-red-600">
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
            <p className="font-semibold">Full screen sharing is required</p>
          </div>

          <p className="mb-4 text-gray-700">
            Please select <strong>&quot;Entire Screen&quot;</strong> when prompted to share your screen. 
            This is required for proper exam monitoring.
          </p>

          <div className="bg-gray-100 p-4 mb-6 rounded-lg border-l-4 border-amber-600">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> Sharing only a specific window or application is not allowed for this exam.
            </p>
          </div>

          <button
            onClick={() => {
              setShowScreenShareErrorModal(false);
              setShowFirefoxScreenSharePrompt(true);
            }}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
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
                d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z"
              />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );


export default ScreenShareErrorModal;