"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/form/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { FormField } from "@/components/common/form-field";
import { DatePickerInput } from "@/components/common/date-picker-input";
import { technologyOptions, assessmentOptions } from "@/shared/constants/data";
import { DurationInput } from "../common/duration-input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type ErrorType = string | undefined;
type CandidateFormData = {
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
    duration: string;
};
export default function CreateCandidateDialog() {
    const [openCreateCandidate, setOpenCreateCandidate] = useState(false);

    const validation = z.object({
        email: z.string().email("Invalid email address."),
        name: z.string().nonempty('Name is required'),
        phone: z.string().nonempty('Phone is required'),
        technology: z.string({ message: 'Technology is required' }).nonempty('Technology is required'),
        assessment: z.string({ message: 'Assessment is required' }).nonempty('Assessment is required'),
        experience: z.string().nonempty('Experience is required'),
        timeValue: z.number({ message: "Duration is required" }).min(1, "Duration is required"),
        timeUnit: z.enum(["day","week"], {
            errorMap: () => ({ message: "Duration must be 'day' or 'week'" }),
        }),
        startDate: z.date({ message: "Duration is required" }),
    });
    const defaultValues = {
        email: "", name: "", phone: "", technology: "", assessment: "", experience: "", timeValue: 0, timeUnit: "days", startDate: undefined, endDate: undefined,duration: "",
    }
    const { register, formState: { errors }, handleSubmit, setValue, watch, reset } = useForm<CandidateFormData>({ resolver: zodResolver(validation), defaultValues: defaultValues as CandidateFormData})
    const formData = watch()
    const validateAndSubmit = (values: CandidateFormData) => {
        reset()
        setOpenCreateCandidate(false);
    }


    useEffect(() => {
        if (formData.startDate && formData.timeUnit && formData.timeValue) {
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
    return (
        <Dialog open={openCreateCandidate} onOpenChange={(e) => {
            setOpenCreateCandidate(e);
        }}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-200 ease-in-out hover:animate-bounce">
                    Create Candidate
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px]">
                {/* Animation Wrapper */}
                <div className="animate-in fade-in zoom-in-95 duration-300">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Create Candidate & Test
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
                                error={errors?.timeValue?.message as ErrorType}

                            />
                        </div>
                    </div>

                    {/* Dialog Footer (Create and Cancel Buttons) */}
                    <DialogFooter className="mt-6">
                        <Button
                            variant="destructive"
                            onClick={() => {
                                reset()
                                setOpenCreateCandidate(false);
                            }}
                            className="hover:bg-gray-500 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            onClick={handleSubmit(validateAndSubmit)}
                        >
                            Create
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}