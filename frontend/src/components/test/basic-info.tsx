import { useExamStore } from '@/store/examStore';
import { EXAM_STEP } from '@/types/exam.types';
import { Camera, FileText, Info, Mail, User, UserCircle } from 'lucide-react';
import { memo } from 'react';
import { Button } from '../ui/form/button';
import dayjs from 'dayjs';

const InstructionCard = () => {
  const { exam } = useExamStore();

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 pb-1">
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2 text-blue-700">
        <Info className="h-5 w-5 self-center" />
        <h2 className="text-xl font-bold align-middle leading-tight">Guidelines & Terms</h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">Please read carefully before proceeding</p>
        <p className="text-sm text-red-600 mt-1">
          Exam will expire on <b>{dayjs(exam?.end_time).format('DD/MM/YYYY hh:mm A')}</b>
        </p>
      </div>

      <div className="p-6">
        <div
          className="h-[450px] overflow-y-auto pr-2 text-gray-700 space-y-5"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#94a3b8 #e2e8f0' }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              width: 4px;
            }
            div::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 10px;
            }
            div::-webkit-scrollbar-thumb {
              background: #94a3b8;
              border-radius: 10px;
            }
            div::-webkit-scrollbar-thumb:hover {
              background: #64748b;
            }
          `}</style>

          <section>
            <h3 className="font-semibold text-blue-800 mb-3 text-lg">Key Requirements</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  1
                </span>
                <span>
                  Use a Laptop or Desktop Only - Mobile phones and tablets are not permitted.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  2
                </span>
                <span>
                  Switching tabs or windows is not allowed during the interview. If caught switching
                  tabs, your interview will be terminated.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  3
                </span>
                <span>Your device must have a functional webcam and microphone.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  4
                </span>
                <span>Ensure a reliable and uninterrupted internet connection.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  5
                </span>
                <span>Use a wired connection or strong Wi-Fi to avoid disconnections.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  6
                </span>
                <span>
                  Use the latest version of Google Chrome, Mozilla Firefox, or Safari. (Do not use
                  outdated browsers version.)
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  7
                </span>
                <span>
                  Choose a quiet, well-lit room with no background noise or interruptions.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  8
                </span>
                <span>Sit against a neutral background (avoid clutter or distractions).</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  9
                </span>
                <span>Ensure your face is clearly visible at all times.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  10
                </span>
                <span>
                  Do Not Switch Tabs or Windows. Navigating away from the interview tab will be
                  detected.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  11
                </span>
                <span>
                  More than 5 violations will lead to automatic termination and disqualification.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  12
                </span>
                <span>
                  Notes, phones, chat tools, websites, or assistance from others are strictly
                  prohibited.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  13
                </span>
                <span>
                  Any attempt to cheat, plagiarize, or seek help will result in disqualification.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  14
                </span>
                <span>
                  Webcam & Audio Must Be Enabled Throughout - Turning off the camera or microphone
                  during the session is not allowed.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  15
                </span>
                <span>Face and voice must be clearly visible and audible at all times.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  16
                </span>
                <span>
                  Maintain Eye Contact - Look into the camera as if speaking directly to the
                  interviewer.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  17
                </span>
                <span>
                  Avoid looking away, reading from other sources, or engaging in side activities.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  18
                </span>
                <span>You cannot retake the interview.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  19
                </span>
                <span>Please be fully prepared before starting.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  20
                </span>
                <span>This interview recorded and reviewed by our proctoring team.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  21
                </span>
                <span>
                  If any form of dishonest behavior is detected, your application will be
                  immediately disqualified.
                </span>
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <h3 className="font-bold text-red-700 mb-2">Disqualification Criteria</h3>
              <ul className="space-y-2 ml-2 text-red-800">
                <li className="flex items-center gap-2">
                  <span>•</span>
                  <span>Exceeding 5 tab switches or browser violations</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span>
                  <span>Turning off webcam or microphone</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span>
                  <span>Receiving unauthorized help</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span>
                  <span>Use of any restricted device or tool</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span>
                  <span>Any suspicious behavior or intent to deceive</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="mt-8">
            <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
              <p className="font-bold text-indigo-700 mb-3">
                By proceeding with this interview, you agree to all the rules and guidelines stated
                above.
              </p>
              <ul className="space-y-2 text-indigo-900">
                <li className="flex items-center gap-2">
                  <span>•</span>
                  <span>Your responses will be stored for evaluation and quality assurance.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span>
                  <span>
                    You give consent to use the recording for verification and audit purposes.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>
                    Any form of misconduct, cheating, impersonation, or violation will result in
                    cancellation of your application and possible blacklisting from future
                    opportunities.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          <div className="text-center pt-6 pb-2">
            <p className="font-semibold text-blue-700">
              Please review these guidelines carefully and ensure full compliance to avoid
              disqualification.
            </p>
            <p className="mt-2 text-blue-600 font-semibold">
              Start your interview only when you are ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormField = ({
  label,
  icon,
  value,
  type = 'text',
}: {
  label: string;
  icon: React.ReactNode;
  value: string | number | null;
  type?: string;
}) => (
  <div className="group">
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors">
        {icon}
      </div>
      <input
        type={type}
        value={value ?? ''}
        readOnly
        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 pl-10 text-gray-700 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  transition-all duration-200 cursor-not-allowed"
      />
    </div>
  </div>
);

const BasicInfoForm: React.FC = memo(() => {
  const { candidate, setCurrentStep } = useExamStore();
  const handleBasicInfoSubmit = () => {
    setCurrentStep(EXAM_STEP.VIDEO_RECORDING);
  };

  const mapExperienceToRange = (num?: number | string) => {
    if (num == null || num === '') return '';
    const number = Number(num);

    if (isNaN(number) || number < 0) return '';

    const MAX_YEARS = 20;

    for (let i = 0; i < MAX_YEARS; i++) {
      if (number < i + 1) return `${i}-${i + 1}`;
    }

    return `${MAX_YEARS - 1}-${MAX_YEARS}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <InstructionCard />
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 h-full">
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-2 text-indigo-700">
                <User className="h-5 w-5 self-center" />
                <h2 className="text-xl font-bold align-middle leading-tight">
                  Candidate Information
                </h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Please verify your details before proceeding
              </p>
            </div>

            <div className="p-6 space-y-5">
              <FormField
                label="Full Name"
                icon={<User className="h-4 w-4" />}
                value={candidate?.name as string}
              />

              <FormField
                label="Email Address"
                icon={<Mail className="h-4 w-4" />}
                value={candidate?.email as string}
                type="email"
              />

              <FormField
                label="Years of Experience"
                icon={<UserCircle className="h-4 w-4" />}
                value={
                  candidate?.experience !== undefined && candidate?.experience !== null
                    ? `${mapExperienceToRange(candidate.experience)} Years`
                    : ''
                }
              />

              <FormField
                label="Technology"
                icon={<FileText className="h-4 w-4" />}
                value={
                  candidate?.assessment?.technologies
                    ?.map((item: { technology: { name: string } }) => item?.technology?.name)
                    .join(', ') as string
                }
              />
              <Button
                onClick={handleBasicInfoSubmit}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700
                            text-white font-semibold py-3.5 px-6 rounded-lg shadow-lg hover:shadow-xl 
                            transform hover:-translate-y-0.5 transition-all duration-200 
                            flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                <span>Proceed to Video Recording</span>
              </Button>

              <p className="text-center text-xs text-gray-500 mt-4">
                By clicking &quot;Proceed&quot;, you confirm your details are correct and accept our
                terms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

BasicInfoForm.displayName = 'BasicInfoForm';

export { BasicInfoForm };
