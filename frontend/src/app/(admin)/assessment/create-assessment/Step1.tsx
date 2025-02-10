import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from 'react-select';
import { ArrowRight } from 'lucide-react';

interface Category {
  name: string;
  questions: {
    easy: number;
    medium: number;
    hard: number;
  };
}

interface FormData {
  name: string;
  categories: Category[];
  duration: number;
}

interface Step1Props {
  formData: FormData;
  AVAILABLE_CATEGORIES: string[];
  durationOptions: { value: number; label: string }[];
  handleAssessmentNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDurationChange: (selectedOption: { value: number; label: string } | null) => void;
  handleNextStep: () => void;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const Step1: React.FC<Step1Props> = ({
  formData,
  AVAILABLE_CATEGORIES,
  durationOptions,
  handleAssessmentNameChange,
  handleDurationChange,
  handleNextStep,
  setFormData
}) => {
  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="font-bold text-gray-900 dark:text-white">Assessment Details</CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400">
          Enter the basic information about your assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="assessmentName" className="font-bold text-gray-900 dark:text-white">
            Assessment Name
          </Label>
          <Input
            id="assessmentName"
            placeholder="Enter a descriptive name"
            value={formData.name}
            onChange={handleAssessmentNameChange}
            className="bg-white text-gray-900 border-gray-200 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500
                     dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          />
        </div>

        <div className="space-y-3">
          <Label className="font-bold text-gray-900 dark:text-white">Select Technology</Label>
          <Select
            isMulti
            value={formData.categories
              .filter(cat => cat.name)
              .map(cat => ({ value: cat.name, label: cat.name }))}
            onChange={(newValue) => {
              const selectedCategories = newValue?.map((option) => ({
                name: option.value,
                questions: { easy: 0, medium: 0, hard: 0 }
              })) || [];
              
              setFormData(prev => ({
                ...prev,
                categories: selectedCategories.length ? selectedCategories : [{
                  name: "",
                  questions: { easy: 0, medium: 0, hard: 0 }
                }]
              }));
            }}
            options={AVAILABLE_CATEGORIES.map(category => ({
              value: category,
              label: category
            }))}
            className="mb-4"
            classNamePrefix="react-select"
            placeholder="Search Technology"
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: 'var(--bg-color, white)',
                borderColor: 'var(--border-color, #e5e7eb)',
                color: 'var(--text-color, #111827)',
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: 'var(--bg-color, white)',
              }),
              input: (base) => ({
                ...base,
                color: 'var(--text-color, #111827)',
              }),
              singleValue: (base) => ({
                ...base,
                color: 'var(--text-color, #111827)',
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? 'var(--highlight-color, #f3f4f6)' : 'var(--bg-color, white)',
                color: 'var(--text-color, #111827)',
                '&:hover': {
                  backgroundColor: 'var(--highlight-color, #f3f4f6)',
                },
              }),
              multiValue: (base) => ({
                ...base,
                backgroundColor: 'var(--highlight-color, #f3f4f6)',
              }),
              multiValueLabel: (base) => ({
                ...base,
                color: 'var(--text-color, #111827)',
              }),
              multiValueRemove: (base) => ({
                ...base,
                color: 'var(--text-color, #111827)',
                ':hover': {
                  backgroundColor: '#ef4444',
                  color: 'white',
                },
              }),
              placeholder: (base) => ({
                ...base,
                color: 'var(--placeholder-color, #6b7280)',
              }),
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="testDuration" className="font-bold text-gray-900 dark:text-white">
            Test Duration (in minutes)
          </Label>
          <Select
            id="testDuration"
            options={durationOptions}
            value={durationOptions.find(option => option.value === formData.duration)}
            onChange={handleDurationChange}
            className="mb-4"
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: 'var(--bg-color, white)',
                borderColor: 'var(--border-color, #e5e7eb)',
                color: 'var(--text-color, #111827)',
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: 'var(--bg-color, white)',
              }),
              input: (base) => ({
                ...base,
                color: 'var(--text-color, #111827)',
              }),
              singleValue: (base) => ({
                ...base,
                color: 'var(--text-color, #111827)',
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? 'var(--highlight-color, #f3f4f6)' : 'var(--bg-color, white)',
                color: 'var(--text-color, #111827)',
                '&:hover': {
                  backgroundColor: 'var(--highlight-color, #f3f4f6)',
                },
              }),
            }}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleNextStep} className="bg-blue-600 hover:bg-blue-700 text-white">
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Step1;