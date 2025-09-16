import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/form/button';
import Select from 'react-select';
import { toast } from 'react-hot-toast';
import { Technology, Assessment } from '@/store/assessmentStore';
// import { Slider } from '../ui/form/slider';
import dayjs from 'dayjs';
import useSWR, { mutate } from 'swr';
import { api, isAxiosError } from '@/lib/api';
import { FormField } from '../common/form-field';
import { Label } from '../ui/form/label';
import useSWRMutation from 'swr/mutation';
import { assessmentEndpoint, technologyEndpoint } from '@/lib/endpoint';
import { z } from 'zod';
import { Input } from '../ui/form/input';
import { questionTypeOptions } from '@/shared/constants/data';
import { Question } from '@/shared/types/app';

interface Option {
  value: string;
  label: string;
}

interface AssessmentEditProps {
  assessment: Assessment;
  onSave: () => void;
  onCancel: () => void;
}

type Difficulty = 'easy' | 'medium' | 'hard';

async function update(
  url: string,
  { arg }: { arg: { name: string; duration: number | string; technologies: Partial<Technology>[] } }
) {
  const response = await api.put(url, arg);
  return response;
}

const technologySchema = z.object({
  technology_id: z.string().optional(),
  easy: z.object({}),
  medium: z.object({}),
  hard: z.object({}),
});

const validation = z.object({
  name: z.string().nonempty('Name is required.'),
  duration: z.number().min(1, 'Duration is required.'),
  technologies: z.array(technologySchema).min(1, 'At least one technology is required.'),
  pass_criteria: z
    .number({
      invalid_type_error: 'Passing score is required.',
    })
    .min(1, 'Passing score must be at least 1.')
    .max(90, 'Passing score must not exceed 90.'),
});

export default function AssessmentEdit({ assessment, onSave, onCancel }: AssessmentEditProps) {
  const [localAssessment, setLocalAssessment] = useState<Assessment & { totalQuestions: number }>(
    assessment
  );
  const [localTechnologies, setLocalTechnologies] = useState<
    (Technology & { percentage?: number })[]
  >([]);
  const [technologyOptions, setTechnologyOptions] = useState<Option[]>([]);

  const { data: technologyData } = useSWR(technologyEndpoint.LIST, api.get);

  const { trigger, isMutating } = useSWRMutation(
    `${assessmentEndpoint.ASSESSMENT_BY_ID}/${assessment.id}`,
    update
  );

  const technologyIds = localTechnologies.map((t) => t.technology?.id).filter(Boolean);

  const { data: questionData } = useSWR(
    technologyIds.length > 0
      ? [assessmentEndpoint.CHECK_QUESTIONS, technologyIds]
      : null,
    ([url, ids]) =>
      api.post(url, {
        technologies: ids,
      })
  );

  const getMaxQuestions = (
    techId: string,
    difficulty: 'easy' | 'medium' | 'hard',
    type: Question['type']
  ) => {
    return questionData?.data?.results?.[techId]?.[difficulty]?.[type] ?? 0;
  };

  useEffect(() => {
    if (technologyData) {
      setTechnologyOptions(
        technologyData?.data?.list.map((tech: { id: string; name: string }) => ({
          value: tech.id,
          label: tech.name,
        }))
      );
    }
  }, [technologyData]);

  useEffect(() => {
    const totalQuestions = assessment.technologies.reduce(
      (sum, tech) => sum + tech.easy.total + tech.medium.total + tech.hard.total,
      0
    );
    setLocalAssessment({ ...assessment, totalQuestions });
    const updatedTechnologies = assessment.technologies.map((tech) => ({
      ...tech,
      percentage: Math.floor(
        ((tech.easy.total + tech.medium.total + tech.hard.total) / totalQuestions) * 100
      ),
    }));
    setLocalTechnologies(updatedTechnologies);
  }, [assessment]);

  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const showError = (message: string) => {
    if (errorTimeoutRef.current) return;

    toast.error(message);

    errorTimeoutRef.current = setTimeout(() => {
      errorTimeoutRef.current = null;
    }, 1000);
  };

  const handleQuestionChange = (
    techId: string,
    difficulty: Difficulty,
    type: Question['type'],
    value: string
  ) => {
    const numValue = value as string;
    const maxAllowedQuestions = getMaxQuestions(techId, difficulty, type);

    if (parseInt(numValue || '0') > maxAllowedQuestions) {
      showError(`You can only allocate up to ${maxAllowedQuestions} questions for this difficulty.`);
      return;
    }

    const updatedTechnologies = localTechnologies.map((tech) => {
      if (tech?.technology.id !== techId) return tech;

      // Update difficulty section
      const updatedDiff = { ...tech[difficulty], [type]: Number(value) || 0 };
      const newDiffTotal = Object.entries(updatedDiff)
        .filter(([key]) => key !== 'total')
        .reduce((sum, [, val]) => sum + Number(val || 0), 0);

      updatedDiff.total = newDiffTotal;

      const newTech = { ...tech, [difficulty]: updatedDiff };

      const newTotalForTech = newTech.easy.total + newTech.medium.total + newTech.hard.total;

      const overallTotal = localTechnologies.reduce((sum, t) => {
        if (t.technology.id === techId) {
          return sum + newTotalForTech;
        }
        return sum + t.easy.total + t.medium.total + t.hard.total;
      }, 0);

      const prevOverallTotal = localTechnologies.reduce(
        (sum, t) => sum + t.easy.total + t.medium.total + t.hard.total,
        0
      );
      if (
        overallTotal > (localAssessment?.totalQuestions || 0) &&
        overallTotal > prevOverallTotal
      ) {
        showError(`Total questions cannot exceed ${localAssessment?.totalQuestions}`);
        return tech;
      }

      return { ...newTech };
    });

    setLocalTechnologies(updatedTechnologies);
  };

  const emptyAssessmentQuestionType = {
    mcq: 0,
    multiple_select: 0,
    text: 0,
    video: 0,
    code_snippet: 0,
    code_editor: 0,
    code_snippet_with_mcq: 0,
    total: 0,
  };

  const handleTechnologyChange = (selectedOptions: readonly Option[]) => {
    // Create mapping of existing techs by ID for quick lookup
    const existingTechMap = Object.fromEntries(
      localTechnologies.map((tech) => [tech.technology?.id, tech])
    );

    // Map selected options to technologies, preserving existing data when available
    const updatedTechnologies = selectedOptions.map((option) => {
      const existingTech = existingTechMap[option.value];
      if (existingTech) return existingTech;

      return {
        technology: { id: option.value, name: option.label },
        percentage: Math.floor(100 / selectedOptions.length),
        easy: { ...emptyAssessmentQuestionType },
        medium: { ...emptyAssessmentQuestionType },
        hard: { ...emptyAssessmentQuestionType },
      };
    });

    setLocalTechnologies(updatedTechnologies);
  };

  const handleRemoveTechnology = (id: string) => {
    setLocalTechnologies((prev) => prev.filter((tech) => tech.technology?.id !== id));
  };

  const handleTotalQuestionsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value ?? '0') || 0;
    setLocalAssessment((prev) => ({ ...prev, totalQuestions: newValue }));
  };

  const validateQuestionTotals = () => {
    const totalQuestions = localTechnologies.reduce(
      (sum, tech) => sum + tech.easy.total + tech.medium.total + tech.hard.total,
      0
    );

    if (totalQuestions > (localAssessment?.totalQuestions || 0)) {
      toast.error(
        `Total questions (${totalQuestions}) exceed the limit (${localAssessment?.totalQuestions || 0})`
      );
      return false;
    }
    if (totalQuestions != (localAssessment?.totalQuestions || 0)) {
      toast.error(
        `Total questions (${totalQuestions}) is not equal to (${localAssessment?.totalQuestions || 0})`
      );
      return false;
    }

    return true;
  };

  const handleSaveChanges = async () => {
    try {
      if (!validateQuestionTotals()) {
        toast.error('Failed to save changes');
        return;
      }

      const payload = {
        name: localAssessment.name,
        duration: localAssessment.duration,
        pass_criteria: localAssessment.pass_criteria,
        technologies: localTechnologies.map((tech) => ({
          technology_id: tech.technology?.id,
          easy: tech.easy,
          medium: tech.medium,
          hard: tech.hard,
        })),
      };

      try {
        // Validate the payload using Zod
        validation.parse(payload);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          // Extract and show the first error message
          const errorMessage = validationError.errors[0]?.message || 'Validation failed';
          toast.error(errorMessage);
          return;
        }
      }

      const res = await trigger(payload);
      if (res.success) {
        toast.success('Assessment updated successfully');
        mutate((key) => typeof key === 'string' && key.startsWith('/assessment/list'));
      } else {
        toast.error(res.message);
      }

      onSave();
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response.data.message || 'An unexpected error occurred');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const totalQuestions = localTechnologies.reduce(
    (sum, tech) => sum + tech.easy.total + tech.medium.total + tech.hard.total,
    0
  );

  const durationOptions = Array.from(Array(37).keys()).map((i) => ({
    value: 15 + i * 5,
    label: `${15 + i * 5} minutes`,
  }));
  const handleDurationChange = (selectedOption: string) => {
    setLocalAssessment((prev) => ({ ...prev, duration: parseInt(selectedOption) || 0 }));
  };
  return (
    <div className="min-h-screen dark:bg-gray-800">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[600px]">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Edit - {localAssessment.name}
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Created by {localAssessment.created_by_user?.name} on{' '}
                  {localAssessment.created_at
                    ? dayjs(localAssessment.created_at).format('DD MMM YYYY h:m A')
                    : 'N/A'}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={onCancel}
                  disabled={isMutating}
                  className="hover:bg-red-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  disabled={isMutating}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="flex items-start w-100 gap-4 mb-4">
              <div className="space-y-2 w-1/2">
                <Label htmlFor="name" className="font-bold text-gray-900 dark:text-white">
                  Name
                </Label>
                <FormField
                  id="name"
                  options={durationOptions}
                  value={localAssessment.name}
                  onChange={(e) => setLocalAssessment({ ...localAssessment, name: e.target.value })}
                  className="mb-4"
                  name="name"
                  maxLength={234}
                />
              </div>
              <div className="space-y-2 w-1/2">
                <Label htmlFor="testDuration" className="font-bold text-gray-900 dark:text-white">
                  Test Duration (in minutes)
                </Label>
                <FormField
                  id="testDuration"
                  options={durationOptions}
                  value={localAssessment.duration}
                  onChange={(e) => handleDurationChange(e)}
                  className="mb-4"
                  name="duration"
                  type="select"
                />
              </div>
              <div className="space-y-2 w-1/2">
                <Label
                  htmlFor="total-questions"
                  className="font-bold text-gray-900 dark:text-white"
                >
                  Total Questions
                </Label>
                <FormField
                  type="number"
                  id="total-questions"
                  value={localAssessment.totalQuestions ?? 0}
                  onChange={handleTotalQuestionsChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 
                        hover:border-gray-400 transition-colors dark:bg-gray-800 dark:border-gray-600 
                        dark:text-gray-100 dark:hover:border-gray-500 dark:focus:ring-blue-600"
                  min="1"
                />
              </div>
              <div className="space-y-2 w-1/2">
                <Label htmlFor="passCriteria" className="font-bold text-gray-900 dark:text-white">
                  Pass Criteria (%)
                </Label>
                <FormField
                  type="number"
                  id="passCriteria"
                  value={localAssessment.pass_criteria ?? 0}
                  onChange={(e) =>
                    setLocalAssessment({
                      ...localAssessment,
                      pass_criteria: parseInt(e.target.value),
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500
                        hover:border-gray-400 transition-colors dark:bg-gray-800 dark:border-gray-600
                        dark:text-gray-100 dark:hover:border-gray-500 dark:focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Technologies Pills */}
            <div className="space-y-4">
              <Select
                isMulti
                options={technologyOptions}
                value={localTechnologies.map((tech) => ({
                  value: tech?.technology.id,
                  label: tech?.technology.name,
                }))}
                onChange={handleTechnologyChange}
                className="mb-4 dark:bg-gray-700"
                classNamePrefix="react-select"
                placeholder="Select technologies..."
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: 'var(--bg-color)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-color)',
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? 'var(--highlight-color)' : 'var(--bg-color)',
                    color: 'var(--text-color)',
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: 'var(--highlight-color)',
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: 'var(--text-color)',
                  }),
                  multiValueRemove: (base, state) => {
                    const isDark =
                      typeof window !== 'undefined' &&
                      document.documentElement.classList.contains('dark');
                    return {
                      ...base,
                      backgroundColor: state.isFocused
                        ? isDark
                          ? '#374151'
                          : '#e5e7eb'
                        : isDark
                          ? '#4b5563'
                          : '#f3f4f6',
                      color: state.isFocused
                        ? isDark
                          ? '#fff'
                          : '#111827'
                        : isDark
                          ? '#fff'
                          : '#374151',
                      borderRadius: '50%',
                      padding: '3px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'background 0.2s, color 0.2s',
                      width: '20px',
                      height: '18px',
                      minWidth: '20px',
                      minHeight: '18px',
                      marginRight: '4px',
                      marginTop: '4px',
                    };
                  },
                  clearIndicator: (base) => ({
                    ...base,
                    cursor: 'pointer',
                  }),
                }}
              />

              <div className="flex flex-wrap gap-2">
                {localTechnologies.map((tech) => (
                  <div
                    key={tech.technology?.id}
                    className="flex items-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 
                               dark:hover:bg-gray-600 transition-colors rounded-full px-4 py-2"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {tech.technology?.name}
                    </span>
                    <Button
                      variant="ghost"
                      onClick={() => handleRemoveTechnology(tech.technology?.id)}
                      className="
                        ml-2 p-0 w-6 h-6 flex items-center justify-center rounded-full
                        bg-gray-200 text-gray-700
                        hover:bg-red-100 hover:text-red-600
                        dark:bg-gray-700 dark:text-gray-200
                        dark:hover:bg-red-900 dark:hover:text-red-200
                        border border-transparent
                        transition-colors
                      "
                      aria-label="Remove technology"
                    >
                      <span className="text-lg font-bold leading-none">×</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions Grid */}
            <div className="mt-8">
              {/* Headers */}
              <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,1fr,1fr] gap-4 md:gap-6 mb-6">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Technology
                </div>
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((difficulty) => {
                  const totalForDifficulty = localTechnologies.reduce(
                    (sum, tech) => sum + tech[difficulty as Difficulty].total,
                    0
                  );
                  const percentage =
                    localAssessment.totalQuestions > 0
                      ? Math.round((totalForDifficulty / localAssessment.totalQuestions) * 100)
                      : 0;

                  return (
                    <div key={difficulty} className="text-center">
                      <div className="mb-2 capitalize">{difficulty}</div>
                      {/* <div
                        className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
                        onClick={(e) => sliderClick(e, difficulty)}
                      >
                        <div
                          className={`h-full ${colors[difficulty as keyof typeof colors]} rounded-full transition-all duration-300`}
                          style={{ width: `${percentage >100 ? 0 : percentage }%` }}
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-grab"
                          style={{ left: `${percentage >100 ? 0 : percentage}%`, transform: `translate(-50%, -50%)` }}
                          onMouseDown={(e) => slideChange(e, difficulty)}
                        />
                      </div> */}
                      <div className="mt-1 text-xs text-gray-500">
                        {percentage > 100 ? 0 : percentage}%
                      </div>
                    </div>
                  );
                })}
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                  Total
                </div>
              </div>

              {/* Technology Rows */}
              <div className="space-y-4">
                {localTechnologies.map((tech, index) => (
                  <div
                    key={tech?.technology?.id}
                    className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr] gap-6 items-center py-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="text-gray-900 dark:text-gray-300">
                      {tech?.technology?.name}
                      <span className="ml-1 text-sm text-gray-500">({tech.percentage}%)</span>
                    </div>

                    {['easy', 'medium', 'hard'].map((difficulty) => (
                      <div key={difficulty} className="text-center">
                        <Input
                          type="number"
                          min="0"
                          value={tech[difficulty as 'easy' | 'medium' | 'hard'].total}
                          disabled
                          className="w-24 text-center mx-auto bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <div className="w-full flex flex-col gap-2 mt-3">
                          {questionTypeOptions.map((item) => {
                            const maxAllowed = getMaxQuestions(
                              tech.technology?.id || '',
                              difficulty as 'easy' | 'medium' | 'hard',
                              item.value
                            );

                            return (
                              <div className="flex justify-between w-full" key={item.value}>
                                <div className="flex items-center w-full gap-3" key={item.value}>
                                  <label
                                    htmlFor={`tech-${index}-${difficulty}-${item.value}`}
                                    className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1"
                                  >
                                    {item.label}
                                    <span
                                      className="ml-1 text-xs font-bold text-gray-400 cursor-pointer relative group-hover:text-blue-500"
                                      tabIndex={0}
                                    >
                                      ({maxAllowed})
                                    </span>
                                  </label>

                                  <Input
                                    id={`tech-${index}-${difficulty}-${item.value}`}
                                    type="number"
                                    min="0"
                                    value={
                                      tech[difficulty as 'easy' | 'medium' | 'hard'][item.value]
                                    }
                                    onChange={(e) =>
                                      handleQuestionChange(
                                        tech.technology?.id as string,
                                        difficulty as 'easy' | 'medium' | 'hard',
                                        item.value,
                                        e.target.value
                                      )
                                    }
                                    className="w-16 sm:w-20 text-center bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white border border-gray-300 focus:ring-2 focus:ring-blue-400"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <div className="text-center font-bold dark:text-white flex flex-col items-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-base">
                        {tech.easy.total + tech.medium.total + tech.hard.total}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">Total</span>
                    </div>
                  </div>
                ))}

                {/* Totals Row */}
                <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr] gap-6 items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="font-medium text-gray-900 dark:text-gray-300">Total</div>
                  <div className="text-center font-medium text-gray-900 dark:text-gray-300">
                    {localTechnologies.reduce((sum, tech) => sum + tech.easy.total, 0)}
                  </div>
                  <div className="text-center font-medium text-gray-900 dark:text-gray-300">
                    {localTechnologies.reduce((sum, tech) => sum + tech.medium.total, 0)}
                  </div>
                  <div className="text-center font-medium text-gray-900 dark:text-gray-300">
                    {localTechnologies.reduce((sum, tech) => sum + tech.hard.total, 0)}
                  </div>
                  <div className="text-center font-medium text-blue-600">{totalQuestions}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
