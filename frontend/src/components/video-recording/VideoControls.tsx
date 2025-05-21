type RecordingStatus = 'idle' | 'loading' | 'recording' | 'preview' | 'error';
import { Camera, Loader2, RefreshCw, StopCircle, Video } from 'lucide-react';
import { Button } from '../ui/form/button';

 const VideoControls = ({
    status,
    onStart,
    onStop,
    onReset,
    onContinue,
    isLoading
  }: {
    status: RecordingStatus;
    onStart: () => void;
    onStop: () => void;
    onReset: () => void;
    onContinue: () => void;
    isLoading:boolean
  }) => (
    <div className="flex justify-center space-x-4 mt-6">
      {status === 'idle' && (
        <Button
          onClick={onStart}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl text-white px-6 py-3 rounded-full font-medium transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
        >
          <Camera className="w-5 h-5 mr-2" />
          Start Recording
        </Button>
      )}
  
      {status === 'loading' && (
        <Button
          disabled
          className="bg-gray-400 text-white px-6 py-3 rounded-full font-medium flex items-center cursor-not-allowed"
        >
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Initializing...
        </Button>
      )}
  
      {status === 'recording' && (
        <Button
          onClick={onStop}
          className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg hover:shadow-xl text-white px-6 py-3 rounded-full font-medium transform hover:-translate-y-0.5 transition-all duration-200 flex items-center pulse-animation"
        >
          <StopCircle className="w-5 h-5 mr-2" />
          Stop Recording
        </Button>
      )}
  
      {status === 'preview' && (
        <div className="flex gap-4">
          <Button
            className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-medium transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
            onClick={onReset}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Record Again
          </Button>
          <Button
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl text-white px-6 py-3 rounded-full font-medium transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
            onClick={onContinue}
          >
            {isLoading && <div className="flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>}
            {!isLoading && <>
            <Video className="w-5 h-5 mr-2" />
            Continue
            </>}
          </Button>
        </div>
      )}
    </div>
  );

export default VideoControls;