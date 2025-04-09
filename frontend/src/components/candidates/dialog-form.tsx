"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/form/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FormField } from "@/components/common/form-field";
import { DatePickerInput } from "@/components/common/date-picker-input";
import { DurationInput } from "../common/duration-input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, isAxiosError } from "@/lib/api";
import toast from "react-hot-toast";
import { mutate } from "swr";
import { useCandidateStore } from "@/store/candidateStore";

type ErrorType = string | undefined;
type CandidateFormData = {
  id?: string;
  name: string;
  email: string;
  technology: string;
  experience: string;
  assessment: string;
  phone: string;
  timeUnit: 'days' | 'hours';
  startDate: Date | undefined;
  endDate: Date | undefined;
  timeValue: number | '';
};
interface CandidateDialogProps {
  candidate?: Partial<CandidateFormData> | undefined | null,
  open: boolean | undefined,
  setOpen: (opem: boolean) => void
}
export default function DialogForm({ candidate, open, setOpen }: CandidateDialogProps) {

  const validation = z.object({
    email: z.string().email("Invalid email address."),
    name: z.string().nonempty('Name is required'),
    phone: z.string().nonempty('Phone is required'),
    technology: z.string({ message: 'Technology is required' }).nonempty('Technology is required'),
    assessment: z.string({ message: 'Assessment is required' }).nonempty('Assessment is required'),
    experience: z.string().nonempty('Experience is required'),
    timeValue: z.number({ message: "Duration is required" }).min(0, "Duration is required"),
    timeUnit: z.enum(["days", "week"], {
      errorMap: () => ({ message: "Duration must be 'day' or 'week'" }),
    }),
    startDate: z.date({ message: "Duration is required" }),
  });
  const formFields: CandidateFormData = {
    email: "", name: "", phone: "", technology: "", assessment: "", experience: "", timeValue: 0, timeUnit: "days", startDate: new Date(), endDate: new Date(),
  }

  const { register, formState: { errors }, handleSubmit, setValue, watch, reset } = useForm<CandidateFormData>({ resolver: zodResolver(validation), defaultValues: candidate || formFields as CandidateFormData })
  const formData = watch()
  const {assessmentOptions,technologyOptions} = useCandidateStore()

  const validateAndSubmit = async(values: CandidateFormData) => {
    try {
      let res;
      if (candidate) {
        res = await api.put(`/candidate/${candidate?.id}`, values);
      } else {
        res = await api.post("/candidate/create", values);
      }
      if (res.success) {
        toast.success(candidate ? 'Candidate updated successfully' : 'Candidate created successfully');
        mutate((key) => typeof key === 'string' && key.startsWith('/candidates/list'));
        reset(formFields)
      } else {
        toast.error(res.message);
      }
      setOpen(false);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response.data.message || "An unexpected error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
    }

  }

  useEffect(() => {
    if (formData.startDate && formData.timeUnit && Number(formData.timeValue) >= 0) {
      const newEndDate = new Date(formData.startDate);
      const numericValue = Number(formData.timeValue);

      if (formData.timeUnit === "days") {
        newEndDate.setDate(newEndDate.getDate() + numericValue);
      } else {
        newEndDate.setHours(newEndDate.getHours() + numericValue);
      }
      setValue('endDate', newEndDate);
    } else {
      setValue('endDate', undefined);
    }
  }, [formData.startDate, formData.timeUnit, formData.timeValue])



  useEffect(() => {
    if (open) {
      reset(candidate || formFields);
    }
  }, [open, candidate, reset]);


  return (
    <Dialog open={open} onOpenChange={(e) => { setOpen(e) }}>
      <DialogContent className="sm:max-w-[600px]">
        {/* Animation Wrapper */}
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {candidate ? 'Edit ' : 'Create '} Candidate & Test
            </DialogTitle>
          </DialogHeader>

          {/* Form Fields */}
          <div className="space-y-6">
            <FormField
              label="Name"
              id="name"
              value={formData.name}
              {...register('name')}
              error={errors.name?.message as ErrorType}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Email"
                id="email"
                type="email"
                value={formData.email}
                {...register('email')}
                error={errors.email?.message as ErrorType}
              />
              <FormField
                label="Phone"
                id="phone"
                type="tel"
                value={formData.phone}
                {...register('phone')}
                error={errors.phone?.message as ErrorType}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Technology"
                id="technology"
                type="select"
                options={technologyOptions}
                value={formData.technology}
                onChange={(value) => setValue('technology', value, { shouldValidate: true })}
                error={errors?.technology?.message as ErrorType}
              />
              <FormField
                label="Experience"
                id="experience"
                {...register('experience')}
                error={errors.experience?.message as ErrorType}
              />
            </div>

            <FormField
              label="Assessment"
              id="assessment"
              type="select"
              options={assessmentOptions}
              value={formData.assessment}
              onChange={(value) => setValue('assessment', value, { shouldValidate: true })}
              error={errors?.assessment?.message as ErrorType}
            />

            <div className="grid grid-cols-2 gap-4">
              <DatePickerInput
                label="Start Date"
                date={formData.startDate}
                setDate={(e) => setValue('startDate', e as Date, { shouldValidate: true })}
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
                reset(formFields)
                setOpen(false);
              }}
              className="hover:bg-gray-500 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleSubmit(validateAndSubmit)}
            >
              {candidate ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}