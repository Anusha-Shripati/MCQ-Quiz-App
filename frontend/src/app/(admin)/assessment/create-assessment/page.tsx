"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AVAILABLE_CATEGORIES, steps } from "@/shared/constants/data";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { createAssessment } from "@/store/features/assessmentSlice";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import StepsStepperNumber from "./StepsStepperNumber";

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
  duration: number;
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
    ],
    duration: 15
  });

  // Add this options array for the duration select
  const durationOptions = Array.from(Array(37).keys()).map(i => ({
    value: 15 + i * 5,
    label: `${15 + i * 5} minutes`
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
      duration: formData.duration,
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

  // Add this handler for duration change
  const handleDurationChange = (selectedOption: { value: number; label: string } | null) => {
    if (selectedOption) {
      setFormData(prev => ({
        ...prev,
        duration: selectedOption.value
      }));
    }
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

          <StepsStepperNumber steps={steps} currentStep={step} />

        </div>
      </div>

      {step === 1 && (
        <Step1
          formData={formData}
          AVAILABLE_CATEGORIES={AVAILABLE_CATEGORIES}
          durationOptions={durationOptions}
          handleAssessmentNameChange={handleAssessmentNameChange}
          handleDurationChange={handleDurationChange}
          handleNextStep={handleNextStep}
          setFormData={setFormData}
        />
      )}
      {step === 2 && (
        <Step2
          targetQuestions={targetQuestions}
          setTargetQuestions={setTargetQuestions}
          formData={formData}
          handleDifficultySliderChange={handleDifficultySliderChange}
          handleQuestionCountChange={handleQuestionCountChange}
          calculateTotalSum={calculateTotalSum}
          handlePreviousStep={handlePreviousStep}
          handleNextStep={handleNextStep}
        />
      )}
      {step === 3 && (
        <Step3
          formData={formData}
          setStep={setStep}
          handleSubmit={handleSubmit}
          targetQuestions={targetQuestions}
          calculateDifficultyPercentage={calculateDifficultyPercentage}
          calculateTotalSum={calculateTotalSum}
          handlePreviousStep={handlePreviousStep}
        />

      )}
    </div>
  );
}
