"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/form/button";
import { ArrowLeft } from "lucide-react";
import {  steps } from "@/shared/constants/data";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import StepsStepperNumber from "./StepsStepperNumber";
import { useForm } from "react-hook-form";
import { AssessmentForm } from "@/types/assessment.types";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, isAxiosError } from "@/lib/api";
import useSWR, { mutate } from "swr";


export default function CreateAssessment() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [technologyOptions, setTechnologyOptions] = useState([]);

  const {data} = useSWR('/technology/list', api.get);

  useEffect(() => {
    if (data) {
      const options = data.data.list.map((tech:{ id: string; name: string }) => ({
        value: tech.id,
        label: tech.name,
      }));
      setTechnologyOptions(options);
    }
  }, [data]);

  const technologySchema = z.object({
    name: z.string().min(1, "Technology name is required"),
  });
  const validation = z.object({
    name: z.string().nonempty("Name is required."),
    duration: z.number().min(1, "Duration is required"),
    technologies:z.array(technologySchema).min(1,'At least one category is required')
  });

  const { register, watch, setValue, formState: { errors }, trigger } = useForm<AssessmentForm>({
    resolver: zodResolver(validation), defaultValues: {
      name: "",
      technologies: [],
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

      const isValid = formData.technologies.every((cat) => cat.easy || cat.medium || cat.hard);
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
    return formData.technologies.reduce((sum, tech) => {
      return (
        sum +
        tech.easy +
        tech.medium +
        tech.hard
      );
    }, 0);
  };


  const handleSubmit = async() => {

    // Create the assessment
    const newAssessment = {
      name: formData.name,
      duration: formData.duration,
      technologies: formData.technologies.map(tech => ({
        technology_id: tech.id,
        easy: tech.easy,
        medium: tech.medium,
        hard: tech.hard,
      })),
    };
    
    try {

      const res = await api.post("/assessment/create", newAssessment);
      if(res.success){
        toast.success("Assessment created successfully");
        router.push("/assessments");
        mutate((key) => typeof key === 'string' && key.startsWith('/assessment/list'));
      }else{
        toast.error(res.messae);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response.data.message || "An unexpected error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
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
          technologyOptions={technologyOptions}
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
