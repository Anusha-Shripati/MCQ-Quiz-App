import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
// import { ChevronLeft } from "lucide-react";
import Select from "react-select";
import { AVAILABLE_CATEGORIES } from "@/shared/constants/data";
import {
  // updateTechnologyQuestions, 
  removeTechnology,
  type Technology,
  updateAssessment,
} from "@/store/features/assessmentSlice";
import { toast } from "react-hot-toast";
import { Input } from "../ui/input";
interface Option {
  value: string;
  label: string;
}

const categoryOptions: Option[] = AVAILABLE_CATEGORIES.map(category => ({
  value: category,
  label: category
}));

interface AssessmentEditProps {
  assessment: {
    id: string;
    title: string;
    createdBy: string;
    createdDate: string;
    technologies: Technology[];
    totalQuestions: number;
    duration: number;
  };
  onSave: () => void;
  onCancel: () => void;
}

export default function AssessmentEdit({ assessment, onSave, onCancel }: AssessmentEditProps) {
  const dispatch = useDispatch();
  const [localAssessment, setLocalAssessment] = useState(assessment);
  const [localTechnologies, setLocalTechnologies] = useState(assessment.technologies);
  const [, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalAssessment(assessment);
    setLocalTechnologies(assessment.technologies);
  }, [assessment]);

  const handleQuestionChange = (
    techName: string,
    difficulty: keyof Technology["questions"],
    value: number
  ) => {
    if (isNaN(value) || value < 0) {
      toast.error("Please enter a valid number");
      return;
    }

    const updatedTechnologies = localTechnologies.map(tech => {
      if (tech.name !== techName) return tech;

      const newQuestions = { ...tech.questions, [difficulty]: value };

      // Calculate new total for this technology
      const newTotalForTech = Object.values(newQuestions).reduce((a, b) => a + b, 0);

      // Calculate total for other technologies
      const otherTechsTotal = localTechnologies.reduce((sum, t) => {
        if (t.name === techName) return sum;
        return sum + t.questions.easy + t.questions.medium + t.questions.hard;
      }, 0);

      // Check if new total would exceed the limit
      if (newTotalForTech + otherTechsTotal > localAssessment.totalQuestions) {
        toast.error(`Total questions cannot exceed ${localAssessment.totalQuestions}`);
        return tech;
      }

      return { ...tech, questions: newQuestions };
    });

    setLocalTechnologies(updatedTechnologies);
  };

  const handleDifficultySliderChange = (
    difficulty: keyof Technology["questions"],
    percentage: number
  ) => {
    const totalQuestionsTarget = localAssessment.totalQuestions;
    const newQuestionsForDifficulty = Math.floor((totalQuestionsTarget * percentage) / 100);
    const questionsPerTech = Math.floor(newQuestionsForDifficulty / localTechnologies.length);

    const otherDifficulties = ['easy', 'medium', 'hard'].filter(d => d !== difficulty);
    const otherDifficultiesTotal = localTechnologies.reduce((sum, tech) =>
      otherDifficulties.reduce((s, d) => s + tech.questions[d as keyof Technology['questions']], sum),
      0
    );

    if (newQuestionsForDifficulty + otherDifficultiesTotal > totalQuestionsTarget) {
      toast.error(`Total questions cannot exceed ${totalQuestionsTarget}`);
      return;
    }

    setLocalTechnologies(prev => prev.map(tech => ({
      ...tech,
      questions: { ...tech.questions, [difficulty]: questionsPerTech }
    })));
  };

  const handleTechnologyChange = (selectedOptions: readonly Option[]) => {
    const selectedTechs = selectedOptions.map(o => o.value);
    const updatedTechnologies = selectedTechs.map(techName => {
      const existingTech = localTechnologies.find(t => t.name === techName);
      if (existingTech) return existingTech;

      return {
        name: techName,
        percentage: Math.floor(100 / selectedTechs.length),
        questions: { easy: 0, medium: 0, hard: 0 }
      };
    });

    setLocalTechnologies(updatedTechnologies);
  };

  const handleRemoveTechnology = (techName: string) => {
    dispatch(removeTechnology({ assessmentId: localAssessment.id, techName }));
  };


  const handleTotalQuestionsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value);

    if (isNaN(newValue) || newValue < 0) {
      toast.error("Please enter a valid number");
      return;
    }

    // Calculate current total of all questions
    const currentTotal = localTechnologies.reduce((sum, tech) =>
      sum + tech.questions.easy + tech.questions.medium + tech.questions.hard,
      0
    );

    // Allow increasing the total questions, but validate when decreasing
    if (newValue < currentTotal) {
      toast.error(`Cannot set total questions below current sum (${currentTotal})`);
      return;
    }

    setLocalAssessment(prev => ({ ...prev, totalQuestions: newValue }));
  };

  const validateQuestionTotals = () => {
    const totalQuestions = localTechnologies.reduce(
      (sum, tech) => sum + tech.questions.easy + tech.questions.medium + tech.questions.hard,
      0
    );

    if (totalQuestions > localAssessment.totalQuestions) {
      toast.error(`Total questions (${totalQuestions}) exceed the limit (${localAssessment.totalQuestions})`);
      return false;
    }

    return true;
  };

  const handleSaveChanges = () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!validateQuestionTotals()) {
        setIsLoading(false);
        return;
      }

      dispatch(updateAssessment({
        ...localAssessment,
        technologies: localTechnologies,
        duration: localAssessment.duration
      }));

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  const totalQuestions = localTechnologies.reduce(
    (sum, tech) => sum + tech.questions.easy + tech.questions.medium + tech.questions.hard,
    0
  );

  return (
    <div className="min-h-screen dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Edit - {localAssessment.title}
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Created by {localAssessment.createdBy} on {localAssessment.createdDate}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={onCancel}
                  className="hover:bg-red-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="flex items-center gap-4 mb-4">
              <label
                htmlFor="total-questions"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[120px]"
              >
                Total Questions
              </label>
              <Input
                type="number"
                id="total-questions"
                value={localAssessment.totalQuestions}
                onChange={handleTotalQuestionsChange}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 
              hover:border-gray-400 transition-colors dark:bg-gray-800 dark:border-gray-600 
              dark:text-gray-100 dark:hover:border-gray-500 dark:focus:ring-blue-600"
                min="1"
              />
            </div>

            {/* Technologies Pills */}
            <div className="space-y-4">
              <Select
                isMulti
                options={categoryOptions}
                value={localTechnologies.map(tech => ({
                  value: tech.name,
                  label: tech.name
                }))}
                onChange={handleTechnologyChange}
                className="mb-4 dark:bg-gray-700 dark:text-white"
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
                  multiValueRemove: (base) => ({
                    ...base,
                    backgroundColor: 'transparent',
                    color: 'white', // Ensure contrast
                    fontWeight: 'bold',
                    borderRadius: '50%', // Rounded button
                    padding: '3px',
                    transition: '0.2s ease-in-out',
                    ':hover': {
                      backgroundColor: 'red',
                      color: 'white',
                    },
                  }),
                }}
              />

              <div className="flex flex-wrap gap-2">
                {localTechnologies.map((tech) => (
                  <div
                    key={tech.name}
                    className="flex items-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 
                               dark:hover:bg-gray-600 transition-colors rounded-full px-4 py-2"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {tech.name}
                    </span>
                    <Button
                      variant="ghost"
                      onClick={() => handleRemoveTechnology(tech.name)}
                      className="ml-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 
                                 dark:hover:text-gray-300"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions Grid */}
            <div className="mt-8">
              {/* Headers */}
              <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,1fr,1fr] gap-4 md:gap-6 mb-6">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Technology</div>
                {['easy', 'medium', 'hard'].map((difficulty) => {
                  const totalForDifficulty = localTechnologies.reduce(
                    (sum, tech) => sum + tech.questions[difficulty as keyof Technology['questions']],
                    0
                  );
                  const percentage = localAssessment.totalQuestions > 0
                    ? Math.round((totalForDifficulty / localAssessment.totalQuestions) * 100)
                    : 0;

                  const colors = {
                    easy: 'bg-green-500',
                    medium: 'bg-blue-500',
                    hard: 'bg-red-500'
                  };

                  return (
                    <div key={difficulty} className="text-center">
                      <div className="mb-2 capitalize">{difficulty}</div>
                      <div
                        className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const newPercentage = Math.round((x / rect.width) * 100);
                          handleDifficultySliderChange(
                            difficulty as keyof Technology['questions'],
                            newPercentage
                          );
                        }}
                      >
                        <div
                          className={`h-full ${colors[difficulty as keyof typeof colors]} rounded-full transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-grab"
                          style={{ left: `${percentage}%`, transform: `translate(-50%, -50%)` }}
                          onMouseDown={(e) => {
                            const slider = e.currentTarget.parentElement;
                            const handleMouseMove = (e: MouseEvent) => {
                              const rect = slider!.getBoundingClientRect();
                              const x = e.clientX - rect.left;
                              const newPercentage = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)));
                              handleDifficultySliderChange(
                                difficulty as keyof Technology['questions'],
                                newPercentage
                              );
                            };

                            const handleMouseUp = () => {
                              document.removeEventListener('mousemove', handleMouseMove);
                              document.removeEventListener('mouseup', handleMouseUp);
                            };

                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                          }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-500">{percentage}%</div>
                    </div>
                  );
                })}
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Total</div>
              </div>

              {/* Technology Rows */}
              <div className="space-y-4">
                {localTechnologies.map((tech) => (
                  <div
                    key={tech.name}
                    className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr] gap-6 items-center py-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="text-gray-900 dark:text-gray-300">
                      {tech.name}
                      <span className="ml-1 text-sm text-gray-500">({tech.percentage}%)</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max={localAssessment.totalQuestions}
                      value={tech.questions.easy}
                      onChange={(e) => handleQuestionChange(tech.name, 'easy', parseInt(e.target.value))}
                      className="w-20 px-3 py-2 text-center rounded-md border border-gray-300 
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                    <input
                      type="number"
                      value={tech.questions.medium}
                      onChange={(e) => handleQuestionChange(tech.name, 'medium', parseInt(e.target.value))}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 w-20 px-3 py-2 text-center rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="number"
                      value={tech.questions.hard}
                      onChange={(e) => handleQuestionChange(tech.name, 'hard', parseInt(e.target.value))}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 w-20 px-3 py-2 text-center rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="text-center font-medium text-gray-900 dark:text-gray-300">
                      {tech.questions.easy + tech.questions.medium + tech.questions.hard}
                    </div>
                  </div>
                ))}

                {/* Totals Row */}
                <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr] gap-6 items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="font-medium text-gray-900 dark:text-gray-300">Total</div>
                  <div className="text-center font-medium text-gray-900 dark:text-gray-300">
                    {localTechnologies.reduce((sum, tech) => sum + tech.questions.easy, 0)}
                  </div>
                  <div className="text-center font-medium text-gray-900 dark:text-gray-300">
                    {localTechnologies.reduce((sum, tech) => sum + tech.questions.medium, 0)}
                  </div>
                  <div className="text-center font-medium text-gray-900 dark:text-gray-300">
                    {localTechnologies.reduce((sum, tech) => sum + tech.questions.hard, 0)}
                  </div>
                  <div className="text-center font-medium text-blue-600">
                    {totalQuestions}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
