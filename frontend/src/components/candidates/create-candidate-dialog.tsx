"use client";

import React, { useEffect, useState } from "react";
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
import toast from "react-hot-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { CalculatorIcon, CalendarHeartIcon, CalendarIcon, CalendarRangeIcon } from "lucide-react";
// import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface CreateCandidateDialogProps {
    open: boolean; // Controls whether the dialog is open
    onOpenChange: (open: boolean) => void; // Callback to update the open state
}

export default function CreateCandidateDialog({ open, onOpenChange }: CreateCandidateDialogProps) {
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [timeUnit, setTimeUnit] = useState<'days' | 'hours'>('days');
    const [timeValue, setTimeValue] = useState<number | ''>('');
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Add these state variables at the top of your component
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        technology: '',
        experience: '',
        assessment: ''
    });

    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phone: '',
        technology: '',
        experience: '',
        assessment: '',
        startDate: '',
        duration: ''
    });

    // Add this handler function
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (errors[field as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };



    const validateForm = () => {
        const newErrors = {
            name: '',
            email: '',
            phone: '',
            technology: '',
            experience: '',
            assessment: '',
            startDate: '',
            duration: ''
        };

        const phoneRegex = /^\+?[0-9\s\-()]{6,}$/;

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Invalid email';
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number format';
        }
        if (!formData.technology) newErrors.technology = 'Technology is required';
        if (!formData.experience) newErrors.experience = 'Experience is required';
        if (!formData.assessment) newErrors.assessment = 'Assessment is required';
        if (!startDate) newErrors.startDate = 'Start date is required';
        if (!timeUnit || !timeValue) newErrors.duration = 'Invalid duration';

        setErrors(newErrors);
        return Object.values(newErrors).every(error => !error);
    };

    useEffect(() => {
        if (startDate && timeUnit && timeValue) {
            const newEndDate = new Date(startDate);
            const numericValue = Number(timeValue);

            if (timeUnit === 'days') {
                newEndDate.setDate(newEndDate.getDate() + numericValue);
            } else {
                newEndDate.setHours(newEndDate.getHours() + numericValue);
            }

            setEndDate(newEndDate);
        } else {
            setEndDate(undefined);
        }
    }, [startDate, timeUnit, timeValue]);

    function formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}-${month}-${year}`; // Format as YYYY-MM-DD
    }

    return (
        <Dialog open={open} onOpenChange={(e) => {
            setErrors({
                name: '',
                email: '',
                phone: '',
                technology: '',
                experience: '',
                assessment: '',
                startDate: '',
                duration: ''
            });
            onOpenChange(e);
        }
        }>
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
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Name
                            </label>
                            <Input placeholder="Enter candidate's name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        {/* Email and Phone */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email
                                </label>
                                <Input
                                    placeholder="Enter email address"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Phone
                                </label>
                                <Input placeholder="Enter phone number" value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)} />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                            </div>
                        </div>

                        {/* Job Profile (Technology) and Exp. */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Job Profile (Technology)
                                </label>
                                <Select
                                    value={formData.technology}
                                    onValueChange={(value) => handleInputChange('technology', value)}
                                >
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
                                {errors.technology && <p className="text-red-500 text-sm mt-1">{errors.technology}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Experience
                                </label>
                                <Input
                                    placeholder="Enter years of experience"
                                    value={formData.experience}
                                    onChange={(e) => handleInputChange('experience', e.target.value)}
                                />
                                {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
                            </div>
                        </div>

                        {/* Select Assessment */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Select Assessment
                            </label>
                            <Select value={formData.assessment}
                                onValueChange={(value) => handleInputChange('assessment', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose an assessment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="frontend">Frontend Assessment</SelectItem>
                                    <SelectItem value="backend">Backend Assessment</SelectItem>
                                    <SelectItem value="fullstack">Fullstack Assessment</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.assessment && <p className="text-red-500 text-sm mt-1">{errors.assessment}</p>}
                        </div>


                        {/* Start Date and End Date Configuration */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Start Date Calendar */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Start Date
                                </label>
                                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                    <PopoverTrigger asChild>
                                        <div className="relative w-full">

                                            <Input
                                                type="text"
                                                placeholder="Select a date"
                                                value={startDate ? formatDate(startDate) : ''}
                                                readOnly
                                                onClick={() => setIsCalendarOpen(true)}
                                                className="cursor-pointer pl-10" // Add padding to the left for the icon
                                            />
                                            {/* Icon positioned absolutely inside the input field */}
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <CalendarIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                        </div>

                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 z-50" align="start">
                                        {/* Wrap Calendar in a div and add onClick handler here */}
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <Calendar
                                                mode="single"
                                                selected={startDate}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        setStartDate(date);
                                                        setIsCalendarOpen(false); // Close the popover after selection
                                                    }
                                                }}
                                                className="rounded-md border bg-white"
                                                initialFocus
                                            />
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                            </div>

                            {/* End Date Configuration */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Ends in
                                </label>
                                {/* Conditionally show input field */}
                                {/* {timeUnit && ( */}
                                <div className="flex items-center gap-4">
                                    {/* Input Field */}
                                    <Input
                                        type="number"
                                        placeholder={`Enter ${timeUnit}`}
                                        value={timeValue}
                                        onChange={(e) => setTimeValue(e.target.valueAsNumber || '')}
                                        min="1"
                                        className="flex-1 border border-gray-300 rounded-lg p-2"
                                    />

                                    {/* Select Dropdown */}
                                    <Select
                                        value={timeUnit}
                                        onValueChange={(value) => setTimeUnit(value as 'days' | 'hours')}
                                    >
                                        <SelectTrigger className="flex-1 border border-gray-300 rounded-lg p-2">
                                            <SelectValue placeholder="Choose duration type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* Uncomment hours if needed */}
                                            {/* <SelectItem value="hours">Hours</SelectItem> */}
                                            <SelectItem value="days">Days</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Dialog Footer (Create and Cancel Buttons) */}
                    <DialogFooter className="mt-6">
                        <Button
                            variant="destructive"
                            onClick={() => {
                                onOpenChange(false);
                                setErrors({
                                    name: '',
                                    email: '',
                                    phone: '',
                                    technology: '',
                                    experience: '',
                                    assessment: '',
                                    startDate: '',
                                    duration: ''
                                })
                            }}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            // Update your Create button onClick handler:
                            onClick={() => {
                                if (!validateForm()) {
                                    toast.error('Please fix form errors');
                                    return;
                                }

                                if (!endDate) {
                                    toast.error('Invalid test duration configuration');
                                    return;
                                }

                                const candidateData = {
                                    ...formData,
                                    startDate,
                                    endDate,
                                    duration: `${timeValue} ${timeUnit}`
                                };

                                toast.success('Candidate created successfully!');

                                // Reset form
                                setFormData({
                                    name: '',
                                    email: '',
                                    phone: '',
                                    technology: '',
                                    experience: '',
                                    assessment: ''
                                });
                                setStartDate(undefined);
                                setTimeUnit(null);
                                setTimeValue('');
                                setEndDate(undefined);
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