import { AlertCircle, Calendar } from 'lucide-react';

interface ExamNotStartedProps {
  contactEmail?: string;
  startTime?: string;
}

const ExamNotStarted: React.FC<ExamNotStartedProps> = ({
  contactEmail = 'support@example.com',
  startTime = 'the scheduled date & time',
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Header */}
        <div className="p-6 bg-blue-600 flex items-center gap-3">
          <div className="rounded-full bg-white/20 p-2">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Exam Not Started</h1>
            <p className="text-blue-100">Please wait until the exam begins</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <AlertCircle className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-blue-800">This exam hasn’t started yet</h2>
              <p className="text-blue-700 text-sm mt-1">
                The exam will be available starting from{' '}
                <span className="font-medium">{startTime}</span>. You won’t be able to access the
                exam before this time.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-gray-600">
            <p>Possible reasons you’re seeing this message:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>You’ve logged in before the official start time</li>
              <li>The exam has been delayed by the administrator</li>
              <li>Your time zone may differ from the exam schedule</li>
            </ul>

            <p className="pt-2">
              Once the exam start time arrives, please refresh this page or re-open your exam link
              to begin.
            </p>
          </div>

          {/* Footer */}
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

export default ExamNotStarted;
