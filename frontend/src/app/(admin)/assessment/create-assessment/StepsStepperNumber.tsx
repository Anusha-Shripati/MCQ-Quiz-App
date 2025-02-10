import { Check } from "lucide-react";

type Step = {
  number: number;
  label: string;
};

type StepsStepperNumberProps = {
  steps: Step[];
  currentStep: number;
};

const StepsStepperNumber = ({ steps, currentStep }: StepsStepperNumberProps) => {
  return (
    <div className="relative flex justify-between">
      {steps.map(({ number, label }) => (
        <div key={number} className="flex flex-col items-center">
          <div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center 
              border-2 transition-all duration-200 z-10 dark:bg-blue-700 dark:border-blue-600
              ${currentStep > number
                ? "bg-blue-600 border-blue-600 text-white"
                : currentStep === number
                ? "border-blue-600 bg-white text-blue-600"
                : "border-gray-200 bg-white text-gray-400"
              }
            `}
          >
            {currentStep > number ? (
              <Check className="w-5 h-5" />
            ) : (
              <span className="text-sm font-medium dark:text-white">{number}</span>
            )}
          </div>
          <span
            className={`
              mt-2 text-sm font-medium
              ${currentStep >= number ? "text-gray-900" : "text-gray-400"}
            `}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StepsStepperNumber;
