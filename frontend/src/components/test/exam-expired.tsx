import { AlertCircle, Clock } from 'lucide-react';

interface ExamExpiredProps {
  contactEmail?: string;
}

const ExamExpired: React.FC<ExamExpiredProps> = ({ 
  contactEmail = "support@example.com",
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div className="p-6 bg-red-600 flex items-center gap-3">
          <div className="rounded-full bg-white/20 p-2">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Exam Link Expired</h1>
            <p className="text-red-100">This exam is no longer available</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-start gap-3 bg-red-50 p-4 rounded-lg border border-red-100">
            <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-red-800">This exam link has expired</h2>
              <p className="text-red-700 text-sm mt-1">
                The access link for this exam is no longer valid. Each exam link has a specific validity period that has now passed.
              </p>
            </div>
          </div>
          
          <div className="space-y-4 text-gray-600">
            <p>Possible reasons for expiration:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The scheduled exam time has passed</li>
              <li>The exam has been canceled or rescheduled</li>
              <li>The maximum allowed attempts have been reached</li>
              <li>The exam access period has ended</li>
            </ul>
            
            <p className="pt-2">
              If you believe this is an error or need to reschedule your exam, please contact the exam administrator.
            </p>
          </div>
          
          <div className="pt-4 space-y-4">
            
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                Need help? Contact us at{' '}
                <a 
                  href={`mailto:${contactEmail}`}
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  {contactEmail}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamExpired;
