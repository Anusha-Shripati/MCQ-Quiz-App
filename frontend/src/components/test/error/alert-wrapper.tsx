import { TriangleAlert } from "lucide-react";

const AlertWrapper = ({ showAlert, alertMessage,onClose }: { showAlert: boolean; alertMessage: string,onClose:()=>void }) => {
    if (!showAlert) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="animate-in slide-in-from-bottom-4 duration-300 bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <TriangleAlert  className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Warning</h3>
                <p className="text-sm text-gray-500">Please review the following message</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">{alertMessage}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => onClose()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default AlertWrapper;