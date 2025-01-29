"use client";
import { useState } from "react";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AVAILABLE_CATEGORIES } from "@/shared/constants/data";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { createAssessment } from "@/store/features/assessmentSlice";

interface Category {
  name: string;
  questions: {
    easy: number;
    medium: number;
    hard: number;
  };
}

interface AssessmentForm {
  name: string;
  categories: Category[];
}

// Option type for react-select
interface Option {
  value: string;
  label: string;
}

export default function CreateAssessment() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [targetQuestions, setTargetQuestions] = useState(0);
  const [formData, setFormData] = useState<AssessmentForm>({
    name: "",
    categories: [
      {
        name: "",
        questions: { easy: 0, medium: 0, hard: 0 }
      }
    ]
  });

  // Convert AVAILABLE_CATEGORIES to react-select options
  const categoryOptions: Option[] = AVAILABLE_CATEGORIES.map(category => ({
    value: category,
    label: category
  }));

  const calculateTotalSum = () => {
    return formData.categories.reduce((sum, category) => {
      return (
        sum +
        category.questions.easy +
        category.questions.medium +
        category.questions.hard
      );
    }, 0);
  };

  const handleQuestionCountChange = (
    index: number,
    difficulty: "easy" | "medium" | "hard",
    value: string
  ) => {
    const numValue = parseInt(value);

    const totalSum = calculateTotalSum();
    const remainingQuestions = targetQuestions - totalSum + formData.categories[index].questions[difficulty];

    if (numValue > remainingQuestions) {
      toast.error(`You can only allocate ${remainingQuestions} questions.`);
      return;
    }

    setFormData(prev => {
      const updatedCategories = [...prev.categories];
      updatedCategories[index].questions[difficulty] = numValue;
      return { ...prev, categories: updatedCategories };
    });
  };

  const handleAssessmentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      name: e.target.value
    }));
  };

  const handleCategoryChange = (selectedOptions: readonly Option[], index: number) => {
    // Remove current category
    const otherCategories = formData.categories.filter((_, i) => i !== index);

    // Check for duplicates in selected options
    const selectedValues = selectedOptions.map(option => option.value);
    const isDuplicate = selectedValues.some(value =>
      otherCategories.some(cat => cat.name === value)
    );

    if (isDuplicate) {
      toast.error("One or more categories have already been selected");
      return;
    }

    // Create new category entries for each selected option
    const newCategories = selectedValues.map(value => ({
      name: value,
      questions: { easy: 0, medium: 0, hard: 0 }
    }));

    // Update formData with new categories
    setFormData(prev => {
      const updatedCategories = [
        ...prev.categories.slice(0, index),
        ...newCategories,
        ...prev.categories.slice(index + 1)
      ];
      return { ...prev, categories: updatedCategories };
    });
  };

  const handleAddCategory = () => {
    const allSelectedCategories = formData.categories.map(cat => cat.name);
    if (allSelectedCategories.length >= AVAILABLE_CATEGORIES.length) {
      toast.error("All available categories have been added");
      return;
    }

    setFormData(prev => ({
      ...prev,
      categories: [
        ...prev.categories,
        { name: "", questions: { easy: 0, medium: 0, hard: 0 } }
      ]
    }));
  };

  const handleRemoveCategory = (index: number) => {
    if (formData.categories.length === 1) {
      toast.error("At least one category is required");
      return;
    }

    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };

  const handleNextStep = () => {
    if (step === 1 && !formData.name.trim()) {
      toast.error("Assessment name is required");
      return;
    }
    if (step === 1 && (formData.categories.length <= 1 && formData.categories[0].name === "")) {
      toast.error("At least add one category.");
      return;
    }
    if (step === 2) {
      const isValid = formData.categories.every(cat =>
        Object.values(cat.questions).some(count => count > 0)
      );
      if (!isValid) {
        toast.error("Each category must have at least one question");
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handlePreviousStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    // Validate the form data
    if (!formData.name.trim()) {
      toast.error("Assessment name is required");
      return;
    }

    if (formData.categories.length === 0) {
      toast.error("At least one category is required");
      return;
    }

    if (calculateTotalSum() !== targetQuestions) {
      toast.error("Total questions must match target questions");
      return;
    }

    // Create the assessment
    const newAssessment = {
      title: formData.name,
      createdBy: "Current User", // Replace with actual user data
      totalQuestions: targetQuestions,
      technologies: formData.categories.map(cat => ({
        name: cat.name,
        percentage: Math.round((100 / formData.categories.length) * 10) / 10,
        questions: cat.questions
      }))
    };

    try {
      dispatch(createAssessment(newAssessment));
      toast.success("Assessment created successfully");
      router.push("/assessment");
    } catch (error) {
      toast.error("Failed to create assessment");
      console.error(error);
    }
  };

  // Get available options for each category row
  const getAvailableOptions = (index: number) => {
    const selectedCategories = formData.categories
      .filter((_, i) => i !== index)
      .map(cat => cat.name);

    return categoryOptions.filter(option => !selectedCategories.includes(option.value));
  };

  // Dark mode styles for react-select
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: state.theme === 'dark' ? '#374151' : 'white', // Background color
      borderColor: state.theme === 'dark' ? '#4B5563' : '#D1D5DB', // Border color
      color: state.theme === 'dark' ? 'white' : 'black', // Text color
      boxShadow: state.isFocused ? (state.theme === 'dark' ? '0 0 0 2px #1E40AF' : '0 0 0 2px #3B82F6') : 'none', // Focus shadow
      '&:hover': {
        borderColor: state.theme === 'dark' ? '#6B7280' : '#9CA3AF', // Hover border color
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#1F2937', // Dropdown menu background
      color: 'white', // Dropdown menu text color
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#374151' : '#1F2937', // Option background
      color: 'white', // Option text color
      '&:active': {
        backgroundColor: '#4B5563', // Active option background
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#3B82F6', // Selected tag background
      color: 'white', // Selected tag text color
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'white', // Selected tag label color
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'white', // Selected tag remove icon color
      '&:hover': {
        backgroundColor: '#EF4444', // Hover background for remove icon
        color: 'white', // Hover color for remove icon
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9CA3AF', // Placeholder text color

    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'white', // Selected value text color
    }),
  };

  const calculateDifficultyPercentage = (difficulty: 'easy' | 'medium' | 'hard') => {
    const totalForDifficulty = formData.categories.reduce(
      (sum, cat) => sum + cat.questions[difficulty], 0
    );
    return targetQuestions > 0
      ? Math.round((totalForDifficulty / targetQuestions) * 100)
      : 0;
  };

  // Add this new function to handle slider changes
  const handleDifficultySliderChange = (difficulty: 'easy' | 'medium' | 'hard', percentage: number) => {
    // Calculate the total questions for the selected difficulty based on the percentage
    const totalForDifficulty = Math.floor((targetQuestions * percentage) / 100);

    // Calculate the current total questions for the other difficulties
    const totalForOtherDifficulties = formData.categories.reduce((sum, cat) => {
      return sum + (difficulty === 'easy' ? 0 : cat.questions.easy) +
        (difficulty === 'medium' ? 0 : cat.questions.medium) +
        (difficulty === 'hard' ? 0 : cat.questions.hard);
    }, 0);

    // Check if the new total exceeds the target questions
    if (totalForDifficulty + totalForOtherDifficulties > targetQuestions) {
      toast.error(`Total questions cannot exceed ${targetQuestions}`);
      return;
    }

    // Calculate questions per category based on the percentage
    const questionsPerCategory = Math.floor(totalForDifficulty / formData.categories.length);

    // Update the form data
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.map(category => ({
        ...category,
        questions: {
          ...category.questions,
          [difficulty]: questionsPerCategory
        }
      }))
    }));
  };

  return (
    <div className="mx-auto py-8 px-6">
      {/* Step indicators and header - same as original */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-8">
          {step > 1 ? (
            <Button variant="ghost" size="icon" onClick={handlePreviousStep}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-2xl font-semibold">Create Assessment</h1>
        </div>

        <div className="relative max-w-2xl mx-auto">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-[2px] bg-gray-200" />
          <div
            className="absolute top-5 left-0 h-[2px] bg-blue-600 transition-all duration-300"
            style={{
              width: `${((step - 1) / 2) * 100}%`
            }}
          />

          {/* Steps */}
          <div className="relative flex justify-between">
            {[
              { number: 1, label: "Basic Info" },
              { number: 2, label: "Questions" },
              { number: 3, label: "Summary" }
            ].map(({ number, label }) => (
              <div key={number} className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center 
                    border-2 transition-all duration-200 z-10
                    ${step > number
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : step === number
                        ? 'border-blue-600 bg-white text-blue-600'
                        : 'border-gray-200 bg-white text-gray-400'
                    }
                  `}
                >
                  {step > number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{number}</span>
                  )}
                </div>
                <span className={`
                  mt-2 text-sm font-medium
                  ${step >= number ? 'text-gray-900' : 'text-gray-400'}
                `}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-bold">Assessment Details</CardTitle>
            <CardDescription>Enter the basic information about your assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="assessmentName" className="font-bold">Assessment Name</Label>
              <Input
                id="assessmentName"
                placeholder="Enter a descriptive name"
                value={formData.name}
                onChange={handleAssessmentNameChange}
                className="dark:bg-gray-600"
              />
            </div>

            <div className="space-y-3">
              <Label className="font-bold">Select Technology</Label>
              <Select
                isMulti
                value={formData.categories
                  .filter(cat => cat.name)
                  .map(cat => ({ value: cat.name, label: cat.name }))}
                onChange={(newValue) => {
                  const selectedCategories = newValue.map(option => ({
                    name: option.value,
                    questions: { easy: 0, medium: 0, hard: 0 }
                  }));
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
                className="mb-4 dark:bg-gray-700 dark:text-white"
                classNamePrefix="react-select"
                placeholder="Search Technology"
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: 'var(--bg-color)', // Use a variable for background color
                    borderColor: 'var(--border-color)', // Use a variable for border color
                    color: 'var(--text-color)', // Use a variable for text color
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? 'var(--highlight-color)' : 'var(--bg-color)', // Background color on focus
                    color: 'var(--text-color)', // Text color
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: 'var(--highlight-color)', // Background for selected items
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: 'var(--text-color)', // Text color for selected items
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: 'var(--text-color)', // Text color for remove button
                    ':hover': {
                      backgroundColor: 'red', // Change this to your desired hover color
                      color: 'white', // Change this to your desired hover text color
                    },
                  }),
                }}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleNextStep}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-bold">Question Distribution</CardTitle>
            <CardDescription>Set the number of questions for each difficulty level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Total Questions Input */}
            <div className="flex items-center justify-start gap-2">
              <h3 className="text-lg font-medium">Total Questions</h3>
              <Input
                type="number"
                value={targetQuestions}
                onChange={(e) => setTargetQuestions(parseInt(e.target.value))}
                className="w-24 text-center"
              />
            </div>

            {/* Difficulty Level Headers */}
            <div className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-center">
              <div>Category</div>
              {['easy', 'medium', 'hard'].map((difficulty) => {
                const totalForDifficulty = formData.categories.reduce(
                  (sum, cat) => sum + cat.questions[difficulty], 0
                );
                const percentage = targetQuestions > 0
                  ? Math.round((totalForDifficulty / targetQuestions) * 100)
                  : 0;

                // Define colors for each difficulty
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
                        handleDifficultySliderChange(difficulty as 'easy' | 'medium' | 'hard', newPercentage);
                      }}
                    >
                      <div
                        className={`h-full ${colors[difficulty]} rounded-full transition-all duration-300`}
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
                            handleDifficultySliderChange(difficulty as 'easy' | 'medium' | 'hard', newPercentage);
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
              <div className="text-center">Total</div>
            </div>

            {/* Technology Rows */}
            <div className="space-y-4">
              {formData.categories.map((category, index) => {
                const total = category.questions.easy +
                  category.questions.medium +
                  category.questions.hard;

                return (
                  <div key={index} className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{category.name}</span>
                      {/* <span className="text-sm text-gray-500">({(100 / formData.categories.length).toFixed(0)}%)</span> */}
                    </div>
                    <div className="text-center">
                      <Input
                        type="number"
                        min="0"
                        value={category.questions.easy}
                        onChange={(e) => handleQuestionCountChange(index, 'easy', e.target.value)}
                        className="w-16 text-center mx-auto bg-gray-50"
                      />
                    </div>
                    <div className="text-center">
                      <Input
                        type="number"
                        min="0"
                        value={category.questions.medium}
                        onChange={(e) => handleQuestionCountChange(index, 'medium', e.target.value)}
                        className="w-16 text-center mx-auto bg-gray-50"
                      />
                    </div>
                    <div className="text-center">
                      <Input
                        type="number"
                        min="0"
                        value={category.questions.hard}
                        onChange={(e) => handleQuestionCountChange(index, 'hard', e.target.value)}
                        className="w-16 text-center mx-auto bg-gray-50"
                      />
                    </div>
                    <div className="text-center font-medium">{total}</div>
                  </div>
                );
              })}

              {/* Totals Row */}
              <div className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-center pt-4 border-t">
                <div className="font-medium">Total</div>
                <div className="text-center font-medium">
                  {formData.categories.reduce((sum, cat) => sum + cat.questions.easy, 0)}
                </div>
                <div className="text-center font-medium">
                  {formData.categories.reduce((sum, cat) => sum + cat.questions.medium, 0)}
                </div>
                <div className="text-center font-medium">
                  {formData.categories.reduce((sum, cat) => sum + cat.questions.hard, 0)}
                </div>
                <div className="text-center font-medium text-blue-600">
                  {calculateTotalSum()}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Button variant="outline" onClick={handlePreviousStep}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button onClick={handleNextStep}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
      {step === 3 && (
        <Card className="max-h-[80vh] overflow-y-auto">
          <CardHeader className="p-4">
            <CardTitle className="font-bold text-lg">Assessment Summary</CardTitle>
            <CardDescription className="text-sm">Review and confirm your assessment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            {/* Basic Info Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">Basic Information</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Edit
                </Button>
              </div>
              <div className="grid gap-2">
                <div>
                  <Label className="text-xs text-gray-500">Assessment Name</Label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{formData.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Selected Categories</Label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {formData.categories.map((category) => (
                      <div
                        key={category.name}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                      >
                        {category.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Questions Distribution Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">Questions Distribution</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(2)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Edit
                </Button>
              </div>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <Table className="text-sm">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[30%] p-2">Category</TableHead>
                      <TableHead className="text-center p-2">
                        <div className="px-2 py-1 bg-green-100 text-green-700 rounded-full inline-block text-xs">
                          Easy ({calculateDifficultyPercentage('easy')}%)
                        </div>
                      </TableHead>
                      <TableHead className="text-center p-2">
                        <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full inline-block text-xs">
                          Medium ({calculateDifficultyPercentage('medium')}%)
                        </div>
                      </TableHead>
                      <TableHead className="text-center p-2">
                        <div className="px-2 py-1 bg-red-100 text-red-700 rounded-full inline-block text-xs">
                          Hard ({calculateDifficultyPercentage('hard')}%)
                        </div>
                      </TableHead>
                      <TableHead className="text-center p-2">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.categories.map((category, index) => {
                      const total = category.questions.easy +
                        category.questions.medium +
                        category.questions.hard;

                      return (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell className="font-medium p-2">{category.name}</TableCell>
                          <TableCell className="text-center p-2">{category.questions.easy}</TableCell>
                          <TableCell className="text-center p-2">{category.questions.medium}</TableCell>
                          <TableCell className="text-center p-2">{category.questions.hard}</TableCell>
                          <TableCell className="text-center p-2 font-semibold">{total}</TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="bg-gray-50 font-medium">
                      <TableCell className="p-2">Total</TableCell>
                      <TableCell className="text-center p-2">
                        {formData.categories.reduce((sum, cat) => sum + cat.questions.easy, 0)}
                      </TableCell>
                      <TableCell className="text-center p-2">
                        {formData.categories.reduce((sum, cat) => sum + cat.questions.medium, 0)}
                      </TableCell>
                      <TableCell className="text-center p-2">
                        {formData.categories.reduce((sum, cat) => sum + cat.questions.hard, 0)}
                      </TableCell>
                      <TableCell className="text-center p-2 text-blue-600">
                        {calculateTotalSum()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Target vs Selected Questions */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Target Questions</p>
                <p className="text-sm font-semibold text-gray-900">{targetQuestions}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-xs text-gray-500">Selected Questions</p>
                <p className="text-sm font-semibold text-blue-600">{calculateTotalSum()}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 p-4">
            <Button variant="outline" onClick={handlePreviousStep} className="text-sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              Create Assessment
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
