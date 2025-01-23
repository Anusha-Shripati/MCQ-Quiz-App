"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";

interface CreateCandidateDialogProps {
    open: boolean; // Controls whether the dialog is open
    onOpenChange: (open: boolean) => void; // Callback to update the open state
}

export default function CreateCandidateDialog({ open, onOpenChange }: CreateCandidateDialogProps) {
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* Dialog Trigger (Button to open the dialog) */}
            <DialogTrigger asChild>
                <Button  className="bg-blue-600 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-200 ease-in-out hover:animate-bounce">
                    Create Candidate
                </Button>
            </DialogTrigger>

            {/* Dialog Content with Professional Animation */}
            <DialogContent className="sm:max-w-[600px]">
                {/* Animation Wrapper */}
                <div className="animate-in fade-in zoom-in-95 duration-300">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Create Candidates & Test
                        </DialogTitle>
                    </DialogHeader>

                    {/* Form Fields */}
                    <div className="space-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Name
                            </label>
                            <Input placeholder="Enter candidate's name" />
                        </div>

                        {/* Email and Phone */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email
                                </label>
                                <Input placeholder="Enter email address" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Phone
                                </label>
                                <Input placeholder="Enter phone number" />
                            </div>
                        </div>

                        {/* Job Profile (Technology) and Exp. */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Job Profile (Technology)
                                </label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select technology" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mern">MERN</SelectItem>
                                        <SelectItem value="mean">MEAN</SelectItem>
                                        <SelectItem value="react">React</SelectItem>
                                        <SelectItem value="angular">Angular</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Experience
                                </label>
                                <Input placeholder="Enter years of experience" />
                            </div>
                        </div>

                        {/* Select Assessment */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Select Assessment
                            </label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose an assessment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="frontend">Frontend Assessment</SelectItem>
                                    <SelectItem value="backend">Backend Assessment</SelectItem>
                                    <SelectItem value="fullstack">Fullstack Assessment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Start Date and End Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Start Date
                                </label>
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                    className="rounded-md border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    End Date
                                </label>
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    className="rounded-md border"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dialog Footer (Create and Cancel Buttons) */}
                    <DialogFooter className="mt-6">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() => {
                                console.log("Candidate created!");
                                onOpenChange(false);
                            }}
                        >
                            Create
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}