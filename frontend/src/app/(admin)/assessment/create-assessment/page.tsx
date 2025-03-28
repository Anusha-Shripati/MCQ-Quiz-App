"use client";
import { useState } from "react";
import { Button } from "@/components/ui/form/button";
import { ArrowLeft } from "lucide-react";
import { AVAILABLE_CATEGORIES, steps } from "@/shared/constants/data";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import StepsStepperNumber from "./StepsStepperNumber";
import { useAssessmentStore } from "@/store/assessmentStore";
import { useForm } from "react-hook-form";
import { AssessmentForm } from "@/types/assessment.types";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";


export default function CreateAssessment() {
  const { createAssessment } = useAssessmentStore();
  const router = useRouter();
  const [step, setStep] = useState(1);


  const technologySchema = z.object({
    name: z.string().min(1, "Technology name is required"),
  });
  const validation = z.object({
    name: z.string().nonempty("Name is required."),
    duration: z.number().min(1, "Duration is required"),
    categories:z.array(technologySchema).min(1,'At least one category is required')
  });

  const { register, watch, setValue, formState: { errors }, trigger } = useForm<AssessmentForm>({
    resolver: zodResolver(validation), defaultValues: {
      name: "",
      categories: [],
      duration: 15,
      targetQuestions:0
    }
  })
  const formData = watch()
  // Add this options array for the duration select
  const durationOptions = Array.from(Array(37).keys()).map((i) => ({
    value: 15 + i * 5,
    label: `${15 + i * 5} minutes`,
  }));


  const handleNextStep = async () => {
    const valudate = await trigger()
    if (step === 2) {

      const isValid = formData.categories.every((cat) =>
        Object.values(cat.questions).some((count) => count > 0)
      );
      if (!isValid) {
        toast.error("Each category must have at least one question");
        return;
      }
    }
    if(valudate){
      setStep((prev) => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    setStep((prev) => prev - 1);
  };

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


  const handleSubmit = () => {

    // Create the assessment
    const newAssessment = {
      title: formData.name,
      createdBy: "Current User", // Replace with actual user data
      totalQuestions: formData.targetQuestions,
      duration: formData.duration,
      technologies: formData.categories.map((cat) => ({
        name: cat.name,
        percentage: Math.round((100 / formData.categories.length) * 10) / 10,
        questions: cat.questions,
      })),
    };
    console.log(newAssessment);
    
    try {
      createAssessment(newAssessment);
      toast.success("Assessment created successfully");
      router.push("/assessment");
    } catch (error) {
      toast.error("Failed to create assessment");
      console.error(error);
    }
  };

  // // Add this new function to handle slider changes
  

  // Add this handler for duration change


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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
            >
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
              width: `${((step - 1) / 2) * 100}%`,
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
          handleNextStep={handleNextStep}
          register={register}
          setValue={setValue}
          errors={errors}
        />
      )}
      {step === 2 && (
        <Step2
          formData={formData}
          handlePreviousStep={handlePreviousStep}
          handleNextStep={handleNextStep}
          register={register}
          setValue={setValue}
          errors={errors}
          calculateTotalSum={calculateTotalSum}

        />
      )}
      {step === 3 && (
        <Step3
          formData={formData}
          setStep={setStep}
          handleSubmit={handleSubmit}
          calculateTotalSum={calculateTotalSum}
          handlePreviousStep={handlePreviousStep}
        />
      )}
    </div>
  );
}
