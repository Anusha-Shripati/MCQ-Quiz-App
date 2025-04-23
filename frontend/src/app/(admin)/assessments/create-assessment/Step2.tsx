import React, { useRef } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/form/input';
import { Button } from '@/components/ui/form/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { AssessmentForm } from '@/types/assessment.types';
import { Slider } from '@/components/ui/form/slider';
import toast from 'react-hot-toast';

type Step2Props = {
  formData: AssessmentForm;
  handlePreviousStep: () => void;
  handleNextStep: () => void;
  errors: FieldErrors<AssessmentForm>;
  calculateTotalSum: () => number;

  setValue: UseFormSetValue<AssessmentForm>;
  register: UseFormRegister<AssessmentForm>;
};

const Step2: React.FC<Step2Props> = ({
  formData,
  handlePreviousStep,
  handleNextStep,
  register,
  setValue,
  calculateTotalSum,
}) => {
  const colors = {
    easy: 'bg-green-500 dark:bg-green-600',
    medium: 'bg-blue-500 dark:bg-blue-600',
    hard: 'bg-red-500 dark:bg-red-600',
  };

  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showError = (message: string) => {
    if (errorTimeoutRef.current) return;

    toast.error(message);

    errorTimeoutRef.current = setTimeout(() => {
      errorTimeoutRef.current = null;
    }, 1000);
  };
  const gotoNext = () => {
    const total = calculateTotalSum();
    if (total != formData.targetQuestions) {
      toast.error('Target questions must be eqla to total question');
      return;
    }
    handleNextStep();
  };

  const handleDifficultySliderChange = (
    percentage: number[],
    difficulty: 'easy' | 'medium' | 'hard'
  ) => {
    // Calculate the total questions for the selected difficulty based on the percentage
    const totalForDifficulty = Math.floor((formData.targetQuestions * percentage[0]) / 100);

    // Calculate the current total questions for the other difficulties
    const totalForOtherDifficulties = formData.technologies.reduce((sum, tech) => {
      return (
        sum +
        (difficulty === 'easy' ? 0 : tech.easy) +
        (difficulty === 'medium' ? 0 : tech.medium) +
        (difficulty === 'hard' ? 0 : tech.hard)
      );
    }, 0);

    // Check if the new total exceeds the target questions
    if (totalForDifficulty + totalForOtherDifficulties > formData.targetQuestions) {
      showError(`Total questions cannot exceed ${formData.targetQuestions}`);
      return;
    }

    // Calculate questions per category based on the percentage
    const questionsPerCategory = Math.floor(totalForDifficulty / formData.technologies.length);

    // Update the form data
    const updated = formData.technologies.map((tech) => ({
      ...tech,
      [difficulty]: questionsPerCategory,
    }));
    setValue('technologies', updated);
  };

  const handleQuestionCountChange = (
    index: number,
    difficulty: 'easy' | 'medium' | 'hard',
    value: string
  ) => {
    const numValue = isNaN(parseInt(value)) ? 0 : parseInt(value);

    const totalSum = calculateTotalSum();
    const remainingQuestions =
      formData.targetQuestions - totalSum + formData.technologies[index][difficulty];

    if (numValue > remainingQuestions) {
      if (remainingQuestions) showError(`You can only allocate ${remainingQuestions} questions.`);
      else showError('Please enter total questions');

      return;
    }

    const updatedTechnologies = formData.technologies;
    updatedTechnologies[index][difficulty] = numValue;

    setValue('technologies', updatedTechnologies);
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="font-bold dark:text-white">Question Distribution</CardTitle>
        <CardDescription className="dark:text-gray-300">
          Set the number of questions for each difficulty level
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h3 className="text-lg font-medium dark:text-white">Total Questions</h3>
          <Input
            type="number"
            {...register('targetQuestions')}
            className="w-24 text-center dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            min="0"
          />
        </div>
        <div className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-center">
          <div className="dark:text-gray-300">Technology</div>
          {['easy', 'medium', 'hard'].map((difficulty) => {
            const totalForDifficulty = formData.technologies.reduce(
              (sum, tech) => sum + tech[difficulty as 'easy' | 'medium' | 'hard'],
              0
            );
            const percentage =
              formData.targetQuestions > 0
                ? Math.round((totalForDifficulty / formData.targetQuestions) * 100)
                : 0;

            return (
              <div key={difficulty} className="text-center">
                <Slider
                  className="relative flex items-center select-none touch-none w-[200px] h-5"
                  max={100}
                  step={1}
                  onValueChange={(e: number[]) =>
                    handleDifficultySliderChange(e, difficulty as keyof typeof colors)
                  }
                  value={[percentage > 100 ? 0 : percentage]}
                  color={colors[difficulty as keyof typeof colors]}
                />
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{percentage}%</div>
              </div>
            );
          })}
          <div className="text-center dark:text-gray-300">Total</div>
        </div>
        <div className="space-y-4">
          {formData.technologies.map((technology, index) => {
            return (
              <div key={index} className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium dark:text-white">{technology.name}</span>
                </div>
                {['easy', 'medium', 'hard'].map((difficulty) => (
                  <div key={difficulty} className="text-center">
                    <Input
                      type="number"
                      min="0"
                      value={technology[difficulty as 'easy' | 'medium' | 'hard']}
                      onChange={(e) =>
                        handleQuestionCountChange(
                          index,
                          difficulty as 'easy' | 'medium' | 'hard',
                          e.target.value
                        )
                      }
                      className="w-16 text-center mx-auto bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                ))}
                <div className="text-center font-medium dark:text-white">
                  {technology.easy + technology.medium + technology.hard}
                </div>
              </div>
            );
          })}
          <div className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-center">
            <div className="font-medium text-gray-900 dark:text-gray-300">Total</div>
            <div className="text-center font-medium text-gray-900 dark:text-gray-300">
              {formData.technologies.reduce((sum, tech) => sum + tech.easy, 0)}
            </div>
            <div className="text-center font-medium text-gray-900 dark:text-gray-300">
              {formData.technologies.reduce((sum, tech) => sum + tech.medium, 0)}
            </div>
            <div className="text-center font-medium text-gray-900 dark:text-gray-300">
              {formData.technologies.reduce((sum, tech) => sum + tech.hard, 0)}
            </div>
            <div className="text-center font-medium text-blue-600">{calculateTotalSum()}</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-end gap-4">
        <Button
          variant="outline"
          onClick={handlePreviousStep}
          className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button onClick={gotoNext} className="dark:bg-blue-600 dark:hover:bg-blue-700">
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Step2;
