import { Button } from '@/components/ui/form/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/form/label';
import Select, { MultiValue } from 'react-select';
import { ArrowRight } from 'lucide-react';
import { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { AssessmentForm } from '@/types/assessment.types';
import { FormField } from '@/components/common/form-field';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';


interface OptionType {
  value: string;
  label: string;
}

interface Step1Props {
  technologyOptions: OptionType[];
  durationOptions: { value: number; label: string | number }[];
  handleNextStep: () => void;
  register: UseFormRegister<AssessmentForm>;
  setValue: UseFormSetValue<AssessmentForm>;
  formData: AssessmentForm;
  errors: FieldErrors<AssessmentForm>;
}

const Step1: React.FC<Step1Props> = ({
  formData,
  technologyOptions,
  durationOptions,
  handleNextStep,
  setValue,
  register,
  errors,
}) => {
  const handelChangeTechnology = (newValue: MultiValue<OptionType>) => {
    const selectedTechnology =
      newValue?.map((option) => ({
        id: option.value,
        name: option.label,
        easy: {
            multiple_select:0,
            mcq:0,
            text:0,
            code_snippet:0,
            code_editor:0,
            video:0,
            total:0
        },
        medium: {

          multiple_select:0,
          mcq:0,
          text:0,
          code_snippet:0,
          code_editor:0,
          video:0,
          total:0
        },
        hard: {

          multiple_select:0,
          mcq:0,
          text:0,
          code_snippet:0,
          code_editor:0,
          video:0,
          total:0
        },
      })) || [];
    setValue('technologies', selectedTechnology.length ? selectedTechnology : []);
  };

  const router = useRouter()
  const handleDurationChange = (selectedOption: string) => {
    setValue('duration', parseInt(selectedOption) ?? 0);
  };

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="font-bold text-gray-900 dark:text-white">
          Assessment Details
        </CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400">
          Enter the basic information about your assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <FormField
            label="Assessment"
            id="assessmentName"
            placeholder="Enter a descriptive name"
            {...register('name')}
            maxLength={234}
            className="bg-white text-gray-900 border-gray-200 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500
                     dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            error={errors.name?.message}
          />
        </div>

        <div className="space-y-3">
          <div className='flex items-end gap-2  '>
            <div className="flex-grow">
              <Label className="font-bold text-gray-900 dark:text-white">Select Technology</Label>
              <Select
                isMulti
                value={formData.technologies
                  .filter((tech) => tech.id)
                  .map((tech) => ({ value: tech.id, label: tech.name }))}
                onChange={handelChangeTechnology}
                options={technologyOptions}
                name="technology"
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
                    backgroundColor: state.isFocused
                      ? 'var(--highlight-color, #f3f4f6)'
                      : 'var(--bg-color, white)',
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
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild><Button variant='outline' onClick={() => router.push('/questions/create-question/new')}>+</Button></TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white p-2 rounded shadow-lg">Create a new technology</TooltipContent>
            </Tooltip>
          </div>
          {errors.technologies && (
            <p className="text-red-500 text-sm">{errors.technologies?.message}</p>
          )}

        </div>
        <div className="space-y-2">
          <Label htmlFor="testDuration" className="font-bold text-gray-900 dark:text-white">
            Test Duration (in minutes)
          </Label>
          <FormField
            id="testDuration"
            options={durationOptions}
            value={formData.duration}
            onChange={handleDurationChange}
            className="mb-4 h-11"
            name="duration"
            type="select"
            error={errors.duration?.message}
          />
        </div>
        <div className="space-y-2">
          <FormField
            label="Passing Score"
            id="pass_criteria"
            type="number"
            value={formData.pass_criteria}
            placeholder="Enter passing score"
            error={errors.pass_criteria?.message}
            {...register('pass_criteria', { valueAsNumber: true })}
            className="bg-white text-gray-900 border-gray-200 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500
                     dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
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
