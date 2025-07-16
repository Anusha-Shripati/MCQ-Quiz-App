type RecordingStatus = 'idle' | 'loading' | 'recording' | 'preview' | 'error';
import { Camera, Loader2, RefreshCw, StopCircle, Video, ArrowRight } from 'lucide-react';
import { Button } from '../ui/form/button';

const VideoControls = ({
  status,
  onStart,
  onStop,
  onReset,
  onContinue,
  isLoading,
  showNextButton,
}: {
  status: RecordingStatus;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onContinue: () => void;
  isLoading: boolean;
  showNextButton: boolean;
}) => (
  <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
    {status === 'idle' && (
      <Button
        onClick={onStart}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700
                  text-white font-medium py-3.5 px-8 rounded-full shadow-lg hover:shadow-xl 
                  transform hover:-translate-y-0.5 transition-all duration-200 
                  flex items-center justify-center gap-2"
      >
        <Camera className="w-5 h-5" />
        <span className="font-semibold text-lg">Start Recording</span>
      </Button>
    )}

    {status === 'loading' && (
      <Button
        disabled
        className="bg-gray-400 text-white px-8 py-3.5 rounded-full font-medium flex items-center justify-center gap-2 cursor-not-allowed"
      >
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="font-semibold text-lg">Initializing...</span>
      </Button>
    )}

    {status === 'recording' && (
      <Button
        onClick={onStop}
        className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700
                  shadow-lg hover:shadow-xl text-white px-8 py-3.5 rounded-full font-medium 
                  transform hover:-translate-y-0.5 transition-all duration-200 
                  flex items-center justify-center gap-2"
      >
        <StopCircle className="w-5 h-5" />
        <span className="font-semibold text-lg">Stop Recording</span>
      </Button>
    )}

    {status === 'preview' && showNextButton && (
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <Button
          className="border border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:bg-gray-50
                    px-6 py-3.5 rounded-full font-medium transition-all duration-200 
                    flex items-center justify-center gap-2 flex-1"
          onClick={onReset}
          disabled={isLoading}
        >
          <RefreshCw className="w-5 h-5" />
          <span className="font-semibold text-lg">Record Again</span>
        </Button>

        <Button
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 
                    shadow-lg hover:shadow-xl text-white px-6 py-3.5 rounded-full font-medium 
                    transform hover:-translate-y-0.5 transition-all duration-200 
                    flex items-center justify-center gap-2 flex-1"
          onClick={onContinue}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Video className="w-5 h-5" />
              <span className="mr-1 font-semibold text-lg">Submit Introduction and Start Exam</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    )}
  </div>
);

export default VideoControls;
