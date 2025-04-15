"use client";

import { DatePickerInput } from "@/components/common/date-picker-input";
import { FormField } from "@/components/common/form-field";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/form/button";
import { api, isAxiosError } from "@/lib/api";
import { useCandidateStore } from "@/store/candidateStore";
import { CandidateFormData } from "@/types/candidate.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { mutate } from "swr";
import { z } from "zod";
import { DurationInput } from "../common/duration-input";
import useSWRMutation from "swr/mutation";

type ErrorType = string | undefined;
interface CandidateDialogProps {
  candidate?: Partial<CandidateFormData> | undefined | null;
  open: boolean | undefined;
  setOpen: (opem: boolean) => void;
}



async function create(url: string, { arg }: { arg: Partial<CandidateFormData> }) {
  const response = await api.post(url, arg);
  return response;
}
async function update(url: string, { arg }: { arg: Partial<CandidateFormData> }) {
  const response = await api.put(url, arg);
  return response;
};

export default function DialogForm({
  candidate,
  open,
  setOpen,
}: CandidateDialogProps) {
  const validation = z.object({
    email: z.string().email("Invalid email address."),
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
    phone: z.string()
      .min(10, "Phone number must be at least 10 digits")
      .max(10, "Phone number must be less than 15 digits")
      .regex(/^[0-9+\-() ]*$/, "Phone number can only contain numbers, +, -, (, ) and spaces"),
    technology: z
      .string({ message: "Technology is required" })
      .nonempty("Technology is required"),
    assessment: z
      .string({ message: "Assessment is required" })
      .nonempty("Assessment is required"),
    experience: z.string()
      .min(1, "Experience is required")
      .max(2, "Experience must be less than 100 years")
      .regex(/^[0-9]*$/, "Experience must be a number"),
    timeValue: z
      .number({ message: "Duration is required" })
      .min(0, "Duration must be greater than 0")
      .max(365, "Duration must be less than 365 days"),
    timeUnit: z.enum(["days", "week"], {
      errorMap: () => ({ message: "Duration must be 'day' or 'week'" }),
    }),
    startDate: z.date({ message: "Start date is required" }),
    endDate: z.date({ message: "End date is required" }),
  });
  const formFields: CandidateFormData = {
    email: '',
    name: '',
    phone: '',
    technology: '',
    assessment: '',
    experience: '',
    timeValue: 0,
    timeUnit: 'days',
    startDate: new Date(),
    endDate: new Date(),
  };

  const { register, formState: { errors }, handleSubmit, setValue, watch, reset } = useForm<CandidateFormData>({ resolver: zodResolver(validation), defaultValues: formFields as CandidateFormData })
  const formData = watch()
  const { assessmentOptions, technologyOptions } = useCandidateStore()



  const { trigger, isMutating } = useSWRMutation(`/candidate/create`, create);
  const { trigger: updateTrigger, isMutating: updating } = useSWRMutation(`/candidate/${candidate?.id}`, update);


  const validateAndSubmit = async (values: CandidateFormData) => {
    try {
      let res;
      const createCandidate = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        experience: values.experience,
        assessment_id: values.assessment,
        start_date: values.startDate,
        end_date: values.endDate,
      };

      if (candidate) {
        res = await updateTrigger(createCandidate);
      } else {
        res = await trigger(createCandidate);
      }
      if (res.success) {
        toast.success(
          candidate
            ? "Candidate updated successfully"
            : "Candidate created successfully"
        );
        mutate(
          (key) => typeof key === "string" && key.startsWith("/candidate/list")
        );
        reset(formFields);
      } else {
        toast.error(res.message);
      }
      setOpen(false);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(
          error.response.data.message || "An unexpected error occurred"
        );
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  useEffect(() => {
    if (formData.startDate && formData.timeUnit && Number(formData.timeValue) >= 0) {
      const newEndDate = new Date(formData.startDate);
      const numericValue = Number(formData.timeValue);

      if (formData.timeUnit === "days") {
        newEndDate.setDate(newEndDate.getDate() + numericValue);
      } else {
        newEndDate.setHours(newEndDate.getHours() + numericValue);
      }
      setValue("endDate", newEndDate);
    } else {
      setValue("endDate", undefined);
    }
  }, [formData.startDate, formData.timeUnit, formData.timeValue]);

  useEffect(() => {
    if (open) {
      reset(candidate || formFields);
    }
  }, [open, candidate, reset]);
  const handleAssessmentChange = (value: string) => {
    setValue("assessment", value, { shouldValidate: true })
    const assessment = assessmentOptions.find((item)=>item.value == value)
    if(assessment && assessment.technologies ){
      setValue('technology',assessment.technologies?.map(item=>item.name).join(', '))
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(e) => {
        setOpen(e);
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        {/* Animation Wrapper */}
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {candidate ? "Edit " : "Create "} Candidate & Test
            </DialogTitle>
          </DialogHeader>

          {/* Form Fields */}
          <div className="space-y-6">
            <FormField
              label="Name"
              id="name"
              value={formData.name}
              maxLength={50}
              {...register("name")}
              error={errors.name?.message as ErrorType}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Email"
                id="email"
                type="email"
                value={formData.email}
                maxLength={100}
                {...register("email")}
                error={errors.email?.message as ErrorType}
              />
              <FormField
                label="Phone"
                id="phone"
                type="tel"
                value={formData.phone}
                maxLength={10}
                pattern="[0-9+\-() ]*"
                inputMode="numeric"
                {...register("phone")}
                error={errors.phone?.message as ErrorType}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Assessment"
                id="assessment"
                type="select"
                options={assessmentOptions}
                value={formData.assessment}
                onChange={handleAssessmentChange}
                error={errors?.assessment?.message as ErrorType}
                disabled={assessmentOptions.length === 0}
              />
              <FormField
                label="Experience"
                id="experience"
                type="number"
                min="0"
                max="99"
                maxLength={2}
                inputMode="numeric"
                {...register("experience")}
                error={errors.experience?.message as ErrorType}
              />
            </div>
            <FormField
              label="Technology"
              id="technology"
              options={technologyOptions}
              value={formData.technology}
              onChange={(value) =>
                setValue("technology", value, { shouldValidate: true })
              }
              disabled={true}
            />


            <div className="grid grid-cols-2 gap-4">
              <DatePickerInput
                label="Start Date"
                date={formData.startDate}
                setDate={(e) =>
                  setValue("startDate", e as Date, { shouldValidate: true })
                }
                error={errors.startDate?.message as ErrorType}
              />
              <DurationInput
                label="Ends in"
                timeUnit={formData.timeUnit}
                timeValue={formData.timeValue}
                setTimeUnit={(e) => setValue('timeUnit', e, { shouldValidate: true })}
                setTimeValue={(e) => setValue('timeValue', e, { shouldValidate: true })}
                error={errors?.timeValue?.message as ErrorType || errors?.timeUnit?.message as ErrorType}
              />
            </div>
          </div>

          {/* Dialog Footer (Create and Cancel Buttons) */}
          <DialogFooter className="mt-6">
            <Button
              variant="destructive"
              onClick={() => {
                reset(formFields);
                setOpen(false);
              }}
              disabled={isMutating || updating}
              className="hover:bg-gray-500 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleSubmit(validateAndSubmit)}
              disabled={isMutating || updating}
            >
              {candidate ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
