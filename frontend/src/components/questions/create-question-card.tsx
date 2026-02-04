import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { api } from '@/lib/api';
import { Question } from '@/shared/types/app';
import React, { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import useSWRMutation from 'swr/mutation';
import { FormField } from '../common/form-field';
import { questionEndpoint } from '@/lib/endpoint';
import { questionTypeOptions } from '@/shared/constants/data';
import { useQuestionPreferencesStore } from '@/store/questionPreferencesStore';

interface QuestionCardProps {
  question: Question;
  selectedQuestion: number;
  questions: Question[] | Required<Question>[];
  handleQuestionTypeChange: (value: Question['type'], index: number) => void;
  handleDeleteQuestion: (index: number) => void;
  setQuestions: React.Dispatch<React.SetStateAction<Question[] | Required<Question>[]>>;
  handleReset: (type: 'question' | 'answer' | 'all') => void;
  technologyId: string;
  onSave?: () => void;
  onCancel?: () => void;
  editQuestion?: boolean;
  validationError?: string; // Add validation error prop
}

interface CreateQuestionPayload {
  technology_id: string;
  question: string;
  correct_answer: string[];
  options: string[];
  time: string;
  difficulty_level: Question['difficulty_level'];
  type: Question['type'];
  meta: Record<string, unknown>;
}

async function createQuestion(url: string, { arg }: { arg: CreateQuestionPayload }) {
  const response = await api.post(url, arg);
  return response;
}
const updateQuestion = async (url: string, { arg }: { arg: CreateQuestionPayload }) => {
  const response = await api.put(url, arg);
  return response;
};

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedQuestion,
  questions,
  handleQuestionTypeChange,
  handleDeleteQuestion,
  setQuestions,
  handleReset,
  onCancel,
  editQuestion,
  validationError,
  onSave
}) => {
  const { setLastSelectedDifficulty } = useQuestionPreferencesStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const ensureFiveOptions = (options: string[] = []) => {
    while (options.length < 5) {
      options.push('');
    }
    return options.slice(0, 5);
  };


  const questionDifficultyOptions = useMemo(
    () =>
      [
        { value: 'easy', label: 'Easy' },
        { value: 'medium', label: 'Medium' },
        { value: 'hard', label: 'Hard' },
      ] as { value: Question['difficulty_level']; label: string }[],
    []
  );

  const { isMutating } = useSWRMutation(questionEndpoint.CREATE, createQuestion);
  const { isMutating: updating } = useSWRMutation(
    `${questionEndpoint.QUESTION_BY_ID}/${question?.id}`,
    updateQuestion
  );

  const handleCorrectOptionChange = (
    optionIndex: number,
    index: number,
    type: 'mcq' | 'multiple_select',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedQuestions = [...questions];
    if (type === 'mcq') {
      updatedQuestions[index].correct_answer = [optionIndex.toString()];
    } else {
      if (e.target.checked) {
        updatedQuestions[index].correct_answer.push(optionIndex.toString());
      } else {
        const op_index = updatedQuestions[index].correct_answer.indexOf(optionIndex.toString());
        updatedQuestions[index].correct_answer.splice(op_index, 1);
      }
    }
    setQuestions(updatedQuestions);
  };

  const handleCodeQuestions = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[selectedQuestion].meta) {
      updatedQuestions[selectedQuestion].meta.code = e.target.value;
    }
    setQuestions(updatedQuestions);
  };

  const handleQuestionURL = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[selectedQuestion].meta) {
      updatedQuestions[selectedQuestion].meta.video_url = e.target.value;
    }
    setQuestions(updatedQuestions);
  };

  const handleVideoToVideo = () => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[selectedQuestion].meta) {
      let videoToVideo = updatedQuestions[selectedQuestion].meta.videoToVideo;

      if (videoToVideo === undefined || videoToVideo === null || videoToVideo === false) {
        videoToVideo = true;
      } else {
        videoToVideo = false;
      }

      updatedQuestions[selectedQuestion].meta.videoToVideo = videoToVideo;
      setQuestions(updatedQuestions);
    }
  };

  // Add a state to track option errors
  const [optionErrors, setOptionErrors] = useState<{ [key: number]: string }>({});

  // Helper function to check for duplicate options
  const checkDuplicateOption = (options: string[], value: string, currentIndex: number) => {
    return options.findIndex((opt, idx) =>
      idx !== currentIndex && opt.trim() === value.trim() && value.trim() !== ''
    );
  };

  // Add validation function
  const validateQuestion = () => {
    const errors: { [key: number]: string } = {};
    let hasError = false;

    // Validate question text
    if (!question.question.trim()) {
      toast.error('Question text is required');
      hasError = true;
    }
  
    // Validate code snippet for code_snippet and code_snippet_with_mcq types
    if (question.type === 'code_snippet' || question.type === 'code_snippet_with_mcq') {

      if (!question.meta?.code || typeof question.meta.code !== 'string' || !question.meta.code.trim()) {
        toast.error('Code snippet is required');
        hasError = true;
      }
    }

    // Additional validation for code_snippet_with_mcq
    if (question.type === 'code_snippet_with_mcq') {
      // Check if at least 4 options are filled
      const filledOptions = question.options.filter(opt => opt.trim()).length;
      if (filledOptions < 4) {
        toast.error('At least 4 options are required');
        hasError = true;
      }

      // Check if correct answer is selected
      if (!question.correct_answer.length) {
        toast.error('Please select a correct answer');
        hasError = true;
      }

      // Check for duplicate options
      question.options.forEach((option, index) => {
        if (option.trim()) {
          const dupIndex = checkDuplicateOption(question.options, option, index);
          if (dupIndex !== -1) {
            errors[index] = `Duplicate of option ${dupIndex + 1}`;
            hasError = true;
          }
        }
      });
    }

    // Additional validation for code_snippet
    if (question.type === 'code_snippet') {
      // Check if at least 2 options are filled
      const filledOptions = question.options.filter(opt => opt.trim()).length;
      if (filledOptions < 2) {
        toast.error('At least 2 options are required');
        hasError = true;
      }

      // Check if at least one correct answer is selected
      if (!question.correct_answer.length) {
        toast.error('Please select at least one correct answer');
        hasError = true;
      }

      // Check for duplicate options
      question.options.forEach((option, index) => {
        if (option.trim()) {
          const dupIndex = checkDuplicateOption(question.options, option, index);
          if (dupIndex !== -1) {
            errors[index] = `Duplicate of option ${dupIndex + 1}`;
            hasError = true;
          }
        }
      });
    }

    setOptionErrors(errors);
    return !hasError;
  };
  return (
    <Card className={validationError ? 'border-2 border-red-500' : ''}>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex justify-between text-gray-900 dark:text-white">
          Question {selectedQuestion + 1}
          {editQuestion && (
            <div>
              <Button variant="destructive" className="hover:bg-orange-600" onClick={onCancel}>
                Close
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {validationError && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md border border-red-300">
            {validationError}
          </div>
        )}

        <div className="flex gap-4 mb-4">
          <FormField
            label="Type"
            type="select"
            parentClassName="w-full"
            className="bg-white dark:bg-primary border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-300"
            value={question.type}
            onChange={(value: Question['type']) =>
              handleQuestionTypeChange(value, selectedQuestion)
            }
            placeholder="Question Type"
            options={questionTypeOptions}
          />
          <FormField
            label="Difficulty Type"
            type="select"
            parentClassName="w-full"
            className="bg-white dark:bg-primary border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-300"
            value={question.difficulty_level}
            onChange={(value: Question['difficulty_level']) => {
              const updatedQuestions = [...questions];
              updatedQuestions[selectedQuestion].difficulty_level = value;
              setQuestions(updatedQuestions);
              setLastSelectedDifficulty(value);
            }}
            placeholder="Difficulty"
            options={questionDifficultyOptions}
          />
          {/* <FormField
            parentClassName="w-full"
            label="Time (In minutes)"
            type="number"
            className="bg-white dark:bg-primary min-w-[100px] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-300"
            placeholder="Enter time in minutes"
            value={question.time}
            onChange={(e) => {
              const updatedQuestions = [...questions];
              updatedQuestions[selectedQuestion].time =
                e.target.value > 0 && e.target.value < 100 ? e.target.value : 0;
              setQuestions(updatedQuestions);
            }}
          /> */}
        </div>

        {question.type === 'video' ? (
          <>
            <input
              type="checkbox"
              name="Video to Video"
              checked={(question.meta?.videoToVideo || false) as boolean}
              className="mr-2 mb-4"
              onChange={() => handleVideoToVideo()}
            />
            Video to Video
          </>
        ) : (
          ''
        )}

        <FormField
          label="Question"
          placeholder="Enter your question"
          value={question.question}
          onChange={(e) => {
            const updatedQuestions = [...questions];
            updatedQuestions[selectedQuestion].question = e.target.value;
            setQuestions(updatedQuestions);
          }}
          className={`mb-4 ${validationError && !question.question.trim() ? 'border-red-500' : ''}`}
        />

        {question.type === 'video' && question.meta?.videoToVideo ? (
          <>
            <label className="block text-sm font-medium mb-1">
              Video link <small>( Enter embedded link )</small>
            </label>
            <textarea
              placeholder="Enter video url"
              value={(question.meta?.video_url || '') as string}
              onChange={handleQuestionURL}
              className="w-full p-2 border rounded-md dark:bg-secondary dark:text-white"
            />
          </>
        ) : (
          ''
        )}

        {(question.type === 'mcq' || question.type === 'multiple_select') && (
          <div className="space-y-2">
            {ensureFiveOptions(question.options).map((option, i) => (
              <div key={i} className="flex items-center gap-2">
                {question.type === 'mcq' ? (
                  <input
                    type="radio"
                    name={`radio-${question.id}`}
                    checked={question.correct_answer.includes(i.toString())}
                    onChange={(e) => handleCorrectOptionChange(i, selectedQuestion, 'mcq', e)}
                    disabled={!option.trim()} // Disable radio if option is empty
                  />
                ) : (
                  <input
                    type="checkbox"
                    checked={question.correct_answer.includes(i.toString())}
                    onChange={(e) =>
                      handleCorrectOptionChange(i, selectedQuestion, 'multiple_select', e)
                    }
                    disabled={!option.trim()} // Disable checkbox if option is empty
                  />
                )}
                <div className="flex-1">
                  <Input
                    placeholder={`Option ${i + 1}`}
                    value={option}
                    onChange={(e) => {
                      const updatedQuestions = [...questions];
                      const newValue = e.target.value;
                      updatedQuestions[selectedQuestion].options[i] = newValue;

                      // Clear error when typing
                      if (optionErrors[i]) {
                        const newErrors = { ...optionErrors };
                        delete newErrors[i];
                        setOptionErrors(newErrors);
                      }

                      setQuestions(updatedQuestions);
                    }}
                    onBlur={(e) => {
                      // Check for duplicate options
                      const updatedQuestions = [...questions];
                      const newValue = e.target.value.trim();

                      if (newValue === '') return;

                      const dupIndex = checkDuplicateOption(
                        updatedQuestions[selectedQuestion].options,
                        newValue,
                        i
                      );

                      if (dupIndex !== -1) {
                        // Mark as duplicate
                        updatedQuestions[selectedQuestion].options[i] = '';
                        e.target.value = '';
                        setQuestions(updatedQuestions);

                        // Set error for this option
                        setOptionErrors((prev) => ({
                          ...prev,
                          [i]: `Duplicate of option ${dupIndex + 1}`,
                        }));

                        toast.error('Option already exists');
                        return;
                      }
                    }}
                    className={`
                      ${i >= 4 ? 'border-dashed border-gray-400' : ''} 
                      ${validationError && i < 4 && !option.trim() ? 'border-red-500 bg-red-50' : ''}
                      ${optionErrors[i] ? 'border-red-500 bg-red-50' : ''}
                    `}
                  />
                  {optionErrors[i] && (
                    <p className="text-xs text-red-500 mt-1">{optionErrors[i]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {question.type === 'text' && (
          <Input
            placeholder="Enter the correct answer"
            value={question.correct_answer}
            onChange={(e) => {
              const updatedQuestions = [...questions];
              updatedQuestions[selectedQuestion].correct_answer = [e.target.value];
              setQuestions(updatedQuestions);
            }}
          />
        )}

        {(question.type === 'code_snippet' ||
          question.type === 'code_editor' ||
          question.type === 'code_snippet_with_mcq') && (
          <textarea
            rows={8}
            placeholder={
              question.type === 'code_snippet_with_mcq' || question.type === 'code_snippet'
                ? `Example:
            function getAge() {
              'use strict';
              age = 21;
              console.log(age);
            }
            getAge();`
                : 'Enter your code snippet'
            }
            value={(question?.meta?.code || '') as string}
            onChange={handleCodeQuestions}
            className="w-full p-2 border rounded-md dark:bg-secondary dark:text-white"
          />
        )}

        {question.type === 'code_snippet' && (
          <div className="space-y-2 mt-4">
            <label className="block text-sm font-medium mb-2">
              Correct Answers (Select all that apply)
            </label>
            {ensureFiveOptions(question.options).map((option, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={question.correct_answer.includes(i.toString())}
                  onChange={(e) =>
                    handleCorrectOptionChange(i, selectedQuestion, 'multiple_select', e)
                  }
                  disabled={!option.trim()}
                />
                <div className="flex-1">
                  <Input
                    placeholder={`Option ${i + 1}`}
                    value={option}
                    onChange={(e) => {
                      const updatedQuestions = [...questions];
                      const newValue = e.target.value;
                      updatedQuestions[selectedQuestion].options[i] = newValue;

                      if (optionErrors[i]) {
                        const newErrors = { ...optionErrors };
                        delete newErrors[i];
                        setOptionErrors(newErrors);
                      }

                      setQuestions(updatedQuestions);
                    }}
                    onBlur={(e) => {
                      const updatedQuestions = [...questions];
                      const newValue = e.target.value.trim();

                      if (newValue === '') return;

                      const dupIndex = checkDuplicateOption(
                        updatedQuestions[selectedQuestion].options,
                        newValue,
                        i
                      );

                      if (dupIndex !== -1) {
                        updatedQuestions[selectedQuestion].options[i] = '';
                        e.target.value = '';
                        setQuestions(updatedQuestions);

                        setOptionErrors((prev) => ({
                          ...prev,
                          [i]: `Duplicate of option ${dupIndex + 1}`,
                        }));

                        toast.error('Option already exists');
                        return;
                      }
                    }}
                    className={`
                      ${i >= 4 ? 'border-dashed border-gray-400' : ''} 
                      ${validationError && i < 4 && !option.trim() ? 'border-red-500 bg-red-50' : ''}
                      ${optionErrors[i] ? 'border-red-500 bg-red-50' : ''}
                    `}
                  />
                  {optionErrors[i] && (
                    <p className="text-xs text-red-500 mt-1">{optionErrors[i]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {question.type === 'code_snippet_with_mcq' && (
          <div className="space-y-2">
            {ensureFiveOptions(question.options).map((option, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`radio-${question.id}`}
                  checked={question.correct_answer.includes(i.toString())}
                  onChange={(e) => handleCorrectOptionChange(i, selectedQuestion, 'mcq', e)}
                  disabled={!option.trim()} // Disable radio if option is empty
                />

                <div className="flex-1">
                  <Input
                    placeholder={`Option ${i + 1}`}
                    value={option}
                    onChange={(e) => {
                      const updatedQuestions = [...questions];
                      const newValue = e.target.value;
                      updatedQuestions[selectedQuestion].options[i] = newValue;

                      // Clear error when typing
                      if (optionErrors[i]) {
                        const newErrors = { ...optionErrors };
                        delete newErrors[i];
                        setOptionErrors(newErrors);
                      }

                      setQuestions(updatedQuestions);
                    }}
                    onBlur={(e) => {
                      // Check for duplicate options
                      const updatedQuestions = [...questions];
                      const newValue = e.target.value.trim();

                      if (newValue === '') return;

                      const dupIndex = checkDuplicateOption(
                        updatedQuestions[selectedQuestion].options,
                        newValue,
                        i
                      );

                      if (dupIndex !== -1) {
                        // Mark as duplicate
                        updatedQuestions[selectedQuestion].options[i] = '';
                        e.target.value = '';
                        setQuestions(updatedQuestions);

                        // Set error for this option
                        setOptionErrors((prev) => ({
                          ...prev,
                          [i]: `Duplicate of option ${dupIndex + 1}`,
                        }));

                        toast.error('Option already exists');
                        return;
                      }
                    }}
                    className={`
                      ${i >= 4 ? 'border-dashed border-gray-400' : ''} 
                      ${validationError && i < 4 && !option.trim() ? 'border-red-500 bg-red-50' : ''}
                      ${optionErrors[i] ? 'border-red-500 bg-red-50' : ''}
                    `}
                  />
                  {optionErrors[i] && (
                    <p className="text-xs text-red-500 mt-1">{optionErrors[i]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="mt-auto flex justify-between items-center">
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="hover:bg-orange-600">
              Delete Question
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the question.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteQuestion(selectedQuestion);
                  setIsDeleteModalOpen(false);
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {questions.length !== 0 && (
          <div className="mt-2 flex justify-end gap-4">
            {onSave && (
              <Button
                variant="default"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                onClick={() => {
                  if (!validateQuestion()) {
                    return;
                  }
                  onSave();
                }}
                disabled={isMutating || updating}
              >
                Save
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => handleReset('all')}
              disabled={isMutating || updating}
            >
              Reset All
            </Button>
            <Button
              variant="outline"
              onClick={() => handleReset('question')}
              disabled={isMutating || updating}
            >
              Reset question
            </Button>
            {question.type != 'video' && (
              <Button
                variant="outline"
                onClick={() => handleReset('answer')}
                disabled={isMutating || updating}
              >
                Reset answer
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default QuestionCard;
