import { useState, useEffect } from "react";
// import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface UseCreateCandidateFormProps {
  onOpenChange: (open: boolean) => void;
}

export const useCreateCandidateForm = ({ onOpenChange }: UseCreateCandidateFormProps) => {
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

  const [startDate, setStartDate] = useState<Date>();
  const [timeUnit, setTimeUnit] = useState<'days' | 'hours'>('days');
  const [timeValue, setTimeValue] = useState<number | ''>('');
  const [endDate, setEndDate] = useState<Date>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = { ...errors };
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

  const validateAndSubmit = () => {
    if (!validateForm()) {
      toast.error('Please fix form errors');
      return;
    }

    if (!endDate) {
      toast.error('Invalid test duration configuration');
      return;
    }

    toast.success('Candidate created successfully!');
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      technology: '',
      experience: '',
      assessment: ''
    });
    setStartDate(undefined);
    setTimeUnit('days');
    setTimeValue('');
    setEndDate(undefined);
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
    
    // Clear any active focus
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
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

  return {
    formData,
    errors,
    startDate,
    timeUnit,
    timeValue,
    endDate,
    isCalendarOpen,
    handleInputChange,
    setStartDate,
    setTimeUnit,
    setTimeValue,
    setIsCalendarOpen,
    validateAndSubmit,
    resetForm
  };
}; 