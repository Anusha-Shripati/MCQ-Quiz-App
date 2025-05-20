import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { useExamStore } from '@/store/examStore';
import { EXAM_STEP } from '@/types/exam.types';
import { Camera, FileText, Info, Mail, User, UserCircle } from 'lucide-react';
import { memo } from 'react';

// Subcomponents
const InstructionCard = () => (
  <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
    <CardHeader className="space-y-1">
      <div className="flex items-center gap-2 text-blue-600">
        <Info className="h-5 w-5" />
        <CardTitle className="text-xl font-semibold">Proctored Mode Instructions</CardTitle>
      </div>
      <p className="text-sm text-gray-500">Please read carefully before proceeding</p>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-gray-700 mb-4">
          This test will run in <strong>full-screen mode</strong>. Follow these instructions
          carefully:
        </p>
        <ul className="space-y-3">
          {[
            {
              icon: <FileText className="h-4 w-4" />,
              text: 'Do not switch tabs or windows during the test',
            },
            {
              icon: <Camera className="h-4 w-4" />,
              text: 'Enable camera and microphone access when prompted',
            },
            {
              icon: <UserCircle className="h-4 w-4" />,
              text: 'Stay visible in the camera throughout the test',
            },
            {
              icon: <Info className="h-4 w-4" />,
              text: 'Maintain a quiet, well-lit environment',
            },
          ].map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-gray-600">
              <div className="mt-1 text-blue-600">{item.icon}</div>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </CardContent>
  </Card>
);

const FormInput = ({
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
  <div className="relative">
    <div className="absolute left-3 top-11 text-gray-400">{icon}</div>
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <Input
        type={type}
        value={value ?? ''}
        className="text-gray-700 pl-10 bg-gray-50/50 border-gray-200"
        disabled={true}
      />
    </div>
  </div>
);

const BasicInfoForm: React.FC = memo(() => {
  const { candidate, setCurrentStep } = useExamStore();

  const handleBasicInfoSubmit = () => {
    setCurrentStep(EXAM_STEP.VIDEO_RECORDING);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InstructionCard />

        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 text-purple-600">
              <User className="h-5 w-5" />
              <CardTitle className="text-xl font-semibold">Candidate Information</CardTitle>
            </div>
            <p className="text-sm text-gray-500">Please verify your details before proceeding</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <FormInput
                label="Full Name"
                icon={<User className="h-4 w-4" />}
                value={candidate?.name as string}
              />
              <FormInput
                label="Email Address"
                icon={<Mail className="h-4 w-4" />}
                value={candidate?.email as string}
                type="email"
              />
              <FormInput
                label="Years of Experience"
                icon={<UserCircle className="h-4 w-4" />}
                value={candidate?.experience as string}
                type="number"
              />
              <FormInput
                label="Technology"
                icon={<FileText className="h-4 w-4" />}
                value={
                  candidate?.assessment?.technologies
                    ?.map((item:{technology:{name:string}}) => item?.technology?.name)
                    .join(',') as string
                }
              />

              <div className="pt-4">
                <Button
                  onClick={handleBasicInfoSubmit}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg
										shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Proceed to Video Recording
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

BasicInfoForm.displayName = 'BasicInfoForm';

export { BasicInfoForm };
