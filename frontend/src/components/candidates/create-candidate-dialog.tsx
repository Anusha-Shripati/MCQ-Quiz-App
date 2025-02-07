"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { useCreateCandidateForm } from "@/hooks/use-create-candidate-form";
import { FormField } from "@/components/common/form-field";
import { DatePickerInput } from "@/components/common/date-picker-input";
import { technologyOptions, assessmentOptions } from "@/shared/constants/data";
import { DurationInput } from "../common/duration-input";
// import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface CreateCandidateDialogProps {
    open: boolean; // Controls whether the dialog is open
    onOpenChange: (open: boolean) => void; // Callback to update the open state
}

export default function CreateCandidateDialog({ open, onOpenChange }: CreateCandidateDialogProps) {
    const {
        formData,
        errors,
        startDate,
        timeUnit,
        timeValue,
        isCalendarOpen,
        handleInputChange,
        setStartDate,
        setTimeUnit,
        setTimeValue,
        setIsCalendarOpen,
        validateAndSubmit,
        resetForm
    } = useCreateCandidateForm({ onOpenChange });

    return (
        <Dialog open={open} onOpenChange={(e) => {
            if (!e) resetForm();
            onOpenChange(e);
        }}>
            {/* Dialog Trigger (Button to open the dialog) */}
            <DialogTrigger asChild>
                <Button className="bg-blue-600 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-200 ease-in-out hover:animate-bounce">
                    Create Candidate
                </Button>
            </DialogTrigger>

            {/* Dialog Content with Professional Animation */}
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
                            error={errors.name}
                            onChange={(value) => handleInputChange('name', value)}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                label="Email"
                                id="email"
                                type="email"
                                value={formData.email}
                                error={errors.email}
                                onChange={(value) => handleInputChange('email', value)}
                            />
                            <FormField
                                label="Phone"
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                error={errors.phone}
                                onChange={(value) => handleInputChange('phone', value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                label="Technology"
                                id="technology"
                                type="select"
                                options={technologyOptions}
                                value={formData.technology}
                                error={errors.technology}
                                onChange={(value) => handleInputChange('technology', value)}
                            />
                            <FormField
                                label="Experience"
                                id="experience"
                                value={formData.experience}
                                error={errors.experience}
                                onChange={(value) => handleInputChange('experience', value)}
                            />
                        </div>

                        <FormField
                            label="Assessment"
                            id="assessment"
                            type="select"
                            options={assessmentOptions}
                            value={formData.assessment}
                            error={errors.assessment}
                            onChange={(value) => handleInputChange('assessment', value)}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <DatePickerInput
                                label="Start Date"
                                date={startDate}
                                setDate={setStartDate}
                                isOpen={isCalendarOpen}
                                setIsOpen={setIsCalendarOpen}
                                error={errors.startDate}
                            />
                            <DurationInput
                                label="Ends in"
                                timeUnit={timeUnit}
                                timeValue={timeValue}
                                setTimeUnit={setTimeUnit}
                                setTimeValue={setTimeValue}
                                error={errors.duration}
                            />
                        </div>
                    </div>

                    {/* Dialog Footer (Create and Cancel Buttons) */}
                    <DialogFooter className="mt-6">
                        <Button
                            variant="destructive"
                            onClick={() => {
                                resetForm();
                                onOpenChange(false);
                            }}
                            className="hover:bg-gray-500 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            onClick={validateAndSubmit}
                        >
                            Create
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}