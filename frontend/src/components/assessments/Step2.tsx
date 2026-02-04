import React, { useEffect, useRef, useState } from 'react';
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
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { AssessmentForm } from '@/types/assessment.types';
import toast from 'react-hot-toast';
import { questionTypeOptions } from '@/shared/constants/data';
import { Question } from '@/shared/types/app';
import useSWR from 'swr';
import { assessmentEndpoint } from '@/lib/endpoint';
import { api } from '@/lib/api';
import { distributeQuestions } from '@/utils/question-distribution';
import { AssessmentsDistributionSlider } from './AssessmentsDistributionSlider';

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
  const [expandedTypes, setExpandedTypes] = useState<Record<number, boolean>>({});
  const [distribution, setDistribution] = useState([30, 70]);
  const { data: technologyData } = useSWR(assessmentEndpoint.CHECK_QUESTIONS, () =>
    api.post(assessmentEndpoint.CHECK_QUESTIONS, {
      technologies: formData.technologies.map((tech) => tech.id),
    })
  );

  // Automatic distribution effect
  useEffect(() => {
    if (!technologyData || !formData.targetQuestions) return;

    const result = distributeQuestions({
      totalTarget: formData.targetQuestions,
      difficultyDist: {
        easy: distribution[0],
        medium: distribution[1] - distribution[0],
        hard: 100 - distribution[1],
      },
      technologies: formData.technologies,
      limits: technologyData,
    });

    const newTechnologies = formData.technologies.map((tech) => {
      const dist = result[tech.id];
      if (!dist) return tech;

      return {
        ...tech,
        easy: { ...tech.easy, ...dist.easy },
        medium: { ...tech.medium, ...dist.medium },
        hard: { ...tech.hard, ...dist.hard },
      };
    });

    // Only update if questions counts are different to avoid loops/renders
    // We check specific fields relevant to distribution
    const isDifferent = newTechnologies.some((newTech, i) => {
      const oldTech = formData.technologies[i];
      return (
        newTech.easy.total !== oldTech.easy.total ||
        newTech.medium.total !== oldTech.medium.total ||
        newTech.hard.total !== oldTech.hard.total ||
        // Deep check categories if needed, but total check is a good proxy mostly
        // Actually we should check category content because distribution might change just categories
        JSON.stringify(newTech.easy) !== JSON.stringify(oldTech.easy) ||
        JSON.stringify(newTech.medium) !== JSON.stringify(oldTech.medium) ||
        JSON.stringify(newTech.hard) !== JSON.stringify(oldTech.hard)
      );
    });

    if (isDifferent) {
      setValue('technologies', newTechnologies);
    }
  }, [
    distribution,
    formData.targetQuestions,
    technologyData,
    formData.technologies.map((t) => t.id).join(','),
  ]);

  const getMaxQuestions = (
    techId: string,
    difficulty: 'easy' | 'medium' | 'hard',
    type: Question['type']
  ) => {
    return (
      technologyData?.data?.results?.[techId]?.[difficulty]?.[type] ?? 0 // fallback if not loaded yet
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
      toast.error('Target questions must be equal to total questions');
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
    const maxAllowed = getMaxQuestions(techId, difficulty, type);

    if (parseInt(numValue || '0') > maxAllowed) {
      showError(`You can only allocate up to ${maxAllowed} questions for this difficulty.`);
      return;
    }

    // Calculate pending total excluding current change to verify limits
    const currentTotal = calculateTotalSum();
    const currentVal = parseInt((formData.technologies[index][difficulty][type] as string) || '0');
    const newVal = parseInt(numValue || '0');

    // We want to check: (currentTotal - oldVal + newVal) <= targetQuestions
    const projectedTotal = currentTotal - currentVal + newVal;

    if (projectedTotal > formData.targetQuestions) {
      showError(`Total questions cannot exceed ${formData.targetQuestions}.`);
      return;
    }

    const updatedTechnologies = [...formData.technologies]; // create shallow copy
    updatedTechnologies[index][difficulty][type] = numValue ? parseInt(numValue) : '';

    // Update total for this difficulty
    updatedTechnologies[index][difficulty].total = Object.entries(
      updatedTechnologies[index][difficulty]
    )
      .filter(([key]) => key !== 'total')
      .reduce((sum, [, val]) => sum + Number(val || 0), 0);

    setValue('technologies', updatedTechnologies);
  };

  const toggleExpandedTypes = (index: number) => {
    setExpandedTypes((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const getRowTotal = (techIndex: number, type: Question['type']) => {
    const tech = formData.technologies[techIndex];
    const easy = Number(tech.easy[type] || 0);
    const medium = Number(tech.medium[type] || 0);
    const hard = Number(tech.hard[type] || 0);
    return easy + medium + hard;
  };

  const getColumnTotal = (techIndex: number, difficulty: 'easy' | 'medium' | 'hard') => {
    return formData.technologies[techIndex][difficulty].total;
  };

  const getGrandTotal = (techIndex: number) => {
    const tech = formData.technologies[techIndex];
    return tech.easy.total + tech.medium.total + tech.hard.total;
  };

  return (
    <div className="space-y-6">
      <Card className="dark:bg-primary dark:border-border">
        <CardHeader>
          <div className="flex justify-between items-center mb-6">
            <div>
              <CardTitle className="font-bold dark:text-white">Question Distribution</CardTitle>
              <CardDescription className="dark:text-gray-300">
                Allocated:{' '}
                <span
                  className={
                    calculateTotalSum() === formData.targetQuestions
                      ? 'text-green-500 font-bold'
                      : 'text-blue-500 font-bold'
                  }
                >
                  {calculateTotalSum()}
                </span>{' '}
                / {formData.targetQuestions} target questions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium dark:text-gray-300">Target:</label>
              <Input
                type="number"
                {...register('targetQuestions', { valueAsNumber: true })}
                className="w-20 text-center dark:bg-secondary dark:border-gray-600 dark:text-white"
                min="0"
              />
            </div>
          </div>
          <div className="px-4 py-4 bg-gray-50 dark:bg-background/50 rounded-lg border dark:border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold dark:text-gray-200">Difficulty Distribution</h3>
              <span className="text-xs text-muted-foreground">
                Adjust sliders to auto-distribute questions
              </span>
            </div>
            <AssessmentsDistributionSlider value={distribution} onValueChange={setDistribution} />
          </div>
        </CardHeader>
      </Card>

      {formData.technologies.map((technology, techIndex) => {
        const isExpanded = expandedTypes[techIndex];
        // Filter options to only show specific categories
        // From here enable all question types.
        const allowedTypes = ['mcq', 'multiple_select', 'code_snippet', 'code_snippet_with_mcq'];
        const filteredOptions = questionTypeOptions.filter((opt) =>
          allowedTypes.includes(opt.value)
        );
        const visibleOptions = isExpanded ? filteredOptions : filteredOptions.slice(0, 4);
        return (
          <Card
            key={technology.id}
            className="dark:bg-primary dark:border-border overflow-hidden"
          >
            <CardHeader className="bg-gray-50 dark:bg-background/50 py-4">
              <CardTitle className="text-lg font-bold dark:text-white">{technology.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-primary/5 dark:bg-background/50 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-gray-500">Question Type</th>
                      <th className="px-6 py-4 font-semibold text-gray-500 text-center">Easy</th>
                      <th className="px-6 py-4 font-semibold text-gray-500 text-center">Medium</th>
                      <th className="px-6 py-4 font-semibold text-gray-500 text-center">Hard</th>
                      <th className="px-6 py-4 font-semibold text-gray-500 text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {visibleOptions.map((option) => (
                      <tr
                        key={option.value}
                        className="bg-white dark:bg-primary hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-6 py-4 font-medium text-gray-700 dark:text-white">
                          {option.label}
                        </td>
                        {(['easy', 'medium', 'hard'] as const).map((difficulty) => {
                          const maxAllowed = getMaxQuestions(
                            technology.id,
                            difficulty,
                            option.value
                          );
                          return (
                            <td key={difficulty} className="px-6 py-4 text-center">
                              <Input
                                type="number"
                                min="0"
                                placeholder="-"
                                value={technology[difficulty][option.value] || ''}
                                onChange={(e) =>
                                  handleQuestionCountChange(
                                    techIndex,
                                    difficulty,
                                    option.value,
                                    e.target.value
                                  )
                                }
                                className="w-full max-w-[100px] mx-auto text-center h-9 bg-white dark:bg-secondary dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <div className="text-sm text-gray-400 mt-1 font-bold">
                                Max: {maxAllowed}
                              </div>
                            </td>
                          );
                        })}
                        <td className="px-6 py-4 text-center font-medium text-gray-700 dark:text-gray-300">
                          {getRowTotal(techIndex, option.value)}
                        </td>
                      </tr>
                    ))}

                    {/* Toggle Row */}
                    {filteredOptions.length > 4 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-3 bg-white dark:bg-primary">
                          <button
                            onClick={() => toggleExpandedTypes(techIndex)}
                            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none transition-colors"
                          >
                            {isExpanded ? (
                              <>
                                Less types <ChevronUp className="ml-1 h-4 w-4" />
                              </>
                            ) : (
                              <>
                                More types <ChevronDown className="ml-1 h-4 w-4" />
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    )}

                    {/* Totals Row */}
                    <tr className="bg-white dark:bg-background/50 border-t">
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        Total
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-900 dark:text-gray-white">
                        {getColumnTotal(techIndex, 'easy')}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-900 dark:text-gray-white">
                        {getColumnTotal(techIndex, 'medium')}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-900 dark:text-gray-white">
                        {getColumnTotal(techIndex, 'hard')}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-900 dark:text-gray-white">
                        {getGrandTotal(techIndex)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <CardFooter className="flex flex-col sm:flex-row justify-end gap-4 border-t dark:border-border pt-6 px-0">
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
    </div>
  );
};

export default Step2;
