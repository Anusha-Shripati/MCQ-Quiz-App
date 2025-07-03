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
import toast from 'react-hot-toast';
import { questionTypeOptions } from '@/shared/constants/data';
import { Question } from '@/shared/types/app';
import useSWR from 'swr';
import { assessmentEndpoint } from '@/lib/endpoint';
import { api } from '@/lib/api';

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
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: technologyData } = useSWR(assessmentEndpoint.CHECK_QUESTIONS, ()=>api.post(assessmentEndpoint.CHECK_QUESTIONS, {technologies: formData.technologies.map((tech)=>tech.id)}));

  const getMaxQuestions = (techId: string, difficulty: 'easy' | 'medium' | 'hard',type:Question['type']) => {

    return (
      technologyData?.data?.results?.[techId]?.[difficulty]?.[type] ??
      0 // fallback if not loaded yet
    );
  };

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


  const handleQuestionCountChange = (
    index: number,
    difficulty: 'easy' | 'medium' | 'hard',
    type: Question['type'],
    value: string
  ) => {
    const numValue = value as string;
    const techId = formData.technologies[index].id;
    const maxAllowed = getMaxQuestions(techId, difficulty,type);

    if (parseInt(numValue || '0') > maxAllowed) {
      showError(`You can only allocate up to ${maxAllowed} questions for this difficulty.`);
      return;
    }

    const totalSum = calculateTotalSum();
    const remainingQuestions =
      formData.targetQuestions - totalSum + parseInt(formData.technologies[index][difficulty][type] as string  || "0" );

    if (parseInt(numValue|| '0') > remainingQuestions) {
      if (remainingQuestions) showError(`You can only allocate ${remainingQuestions} questions.`);
      else showError('Please enter total questions');

      return;
    }

    const updatedTechnologies = formData.technologies;
    updatedTechnologies[index][difficulty][type] = numValue ? parseInt(numValue):"";
    updatedTechnologies[index][difficulty].total = Object.entries(updatedTechnologies[index][difficulty])
      .filter(([key]) => key !== 'total')
      .reduce((sum, [, value]) => sum + Number(value || 0), 0);

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
        <div className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr] gap-4 items-center">
          <h3 className="text-lg font-medium dark:text-white">Total Questions</h3>
          <div className="text-center font-medium text-gray-700 bg-green-100 rounded-full px-2 py-1">
            Easy
          </div>
          <div className="text-center font-medium text-gray-700 bg-blue-100 rounded-full px-2 py-1">
            Medium
          </div>
          <div className="text-center font-medium text-gray-700 bg-red-100 rounded-full px-2 py-1">
            Hard
          </div>
          <div className='flex justify-center'>
            <Input
              type="number"
              {...register('targetQuestions')}
              className="w-24 text-center dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              min="0"
            />
          </div>
        </div>
        <div className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr] gap-4 items-center">
          <div className="dark:text-gray-300">Technology</div>
          {['easy', 'medium', 'hard'].map((difficulty) => {
            const totalForDifficulty = formData.technologies.reduce(
              (sum, tech) => sum + tech[difficulty as 'easy' | 'medium' | 'hard'].total,
              0
            );
            const percentage =
              formData.targetQuestions > 0
                ? Math.round((totalForDifficulty / formData.targetQuestions) * 100)
                : 0;

            return (
              <div key={difficulty} className="text-center">
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{percentage}%</div>
              </div>
            );
          })}
          <div className="text-center dark:text-gray-300">Total</div>
        </div>
        <div className="space-y-4">
          {formData.technologies.map((technology, index) => {
            return (
              <div key={index} className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr] gap-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium dark:text-white">{technology.name}</span>
                </div>
                {['easy', 'medium', 'hard'].map((difficulty) => (
                  <div key={difficulty} className="text-center">
                    <Input
                      type="number"
                      min="0"
                      value={technology[difficulty as 'easy' | 'medium' | 'hard'].total}
                      disabled
                      className="w-24 text-center mx-auto bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <div className='w-full flex flex-col gap-2 mt-3'>
                      {questionTypeOptions.map((item) => {
                        const maxAllowed = getMaxQuestions(technology.id, difficulty as 'easy' | 'medium' | 'hard',item.value);
                        return <div className='flex justify-between w-full' key={item.value}>
                          <label>{item.label} <span className="text-xs text-gray-400">({maxAllowed})</span></label>
                          <Input
                            type="number"
                            min="0"
                            value={technology[difficulty as 'easy' | 'medium' | 'hard'][item.value]}
                            onChange={(e) =>
                              handleQuestionCountChange(
                                index,
                                difficulty as 'easy' | 'medium' | 'hard',
                                item.value,
                                e.target.value
                              )
                            }
                            className="w-28 m-0 text-center bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      })}
                    </div>
                  </div>
                ))}
                <div className="text-center font-medium dark:text-white">
                  {technology.easy.total + technology.medium.total + technology.hard.total}
                </div>
              </div>
            );
          })}
          <div className="grid grid-cols-[1fr,1fr,1fr,1fr,,1fr] gap-4 items-center">
            <div className="font-medium text-gray-900 dark:text-gray-300">Total</div>
            <div className="text-end pr-8 font-medium text-gray-900 dark:text-gray-300">
              {formData.technologies.reduce((sum, tech) => sum + tech.easy.total, 0)}
            </div>
            <div className="text-end pr-8 font-medium text-gray-900 dark:text-gray-300">
              {formData.technologies.reduce((sum, tech) => sum + tech.medium.total, 0)}
            </div>
            <div className="text-end pr-8 font-medium text-gray-900 dark:text-gray-300">
              {formData.technologies.reduce((sum, tech) => sum + tech.hard.total, 0)}
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
