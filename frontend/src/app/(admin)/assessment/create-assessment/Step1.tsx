import { Button } from "@/components/ui/form/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import Select, { MultiValue, SingleValue } from 'react-select';
import { ArrowRight } from 'lucide-react';
import { UseFormRegister, UseFormSetValue } from "react-hook-form";
import { AssessmentForm } from "@/types/assessment.types";
import { FormField } from "@/components/common/form-field";


interface OptionType {
  value: string;
  label: string;
}

interface Step1Props {
  AVAILABLE_CATEGORIES: string[];
  durationOptions: { value: number; label: string | number }[];
  handleNextStep: () => void;
  register: UseFormRegister<AssessmentForm>
  setValue: UseFormSetValue<AssessmentForm>
  formData: AssessmentForm
  errors: any
}

const Step1: React.FC<Step1Props> = ({
  formData,
  AVAILABLE_CATEGORIES,
  durationOptions,
  handleNextStep,
  setValue,
  register,
  errors
}) => {
  const handelChangeTechnology = (newValue: MultiValue<OptionType>) => {
    const selectedCategories = newValue?.map((option) => ({
      value: option.value,
      label: option.label,
      name: option.value,
      questions: { easy: 0, medium: 0, hard: 0 }
    })) || [];
    setValue('categories', selectedCategories.length ? selectedCategories : [])
  }
  const handleDurationChange = (selectedOption: string) => {
    setValue('duration', parseInt(selectedOption) ?? 0);
  };

  return (<Card className="bg-white dark:bg-gray-800">
    <CardHeader>
      <CardTitle className="font-bold text-gray-900 dark:text-white">Assessment Details</CardTitle>
      <CardDescription className="text-gray-500 dark:text-gray-400">
        Enter the basic information about your assessment
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-2">
        <FormField
          label='Assessment'
          id="assessmentName"
          placeholder="Enter a descriptive name"
          {...register('name')}
          className="bg-white text-gray-900 border-gray-200 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500
                     dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name?.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label className="font-bold text-gray-900 dark:text-white">Select Technology</Label>
        <Select
          isMulti
          value={formData.categories
            .filter(cat => cat.name)
            .map(cat => ({ value: cat.name, label: cat.name }))}
          onChange={handelChangeTechnology}
          options={AVAILABLE_CATEGORIES.map(category => ({
            value: category,
            label: category
          }))}
          name='categories'
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
        {errors.categories && (
          <p className="text-red-500 text-sm">{errors.categories?.message}</p>
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
          className="mb-4"
          name='duration'
          type="select"
          error={errors.duration?.message}
        />
      </div>
    </CardContent>
    <CardFooter className="flex justify-end">
      <Button onClick={handleNextStep} className="bg-blue-600 hover:bg-blue-700 text-white">
        Continue
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </CardFooter>
  </Card>)
};

export default Step1;