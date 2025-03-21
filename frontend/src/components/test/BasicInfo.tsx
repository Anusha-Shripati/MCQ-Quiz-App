import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FormData {
  userName: string;
  email: string;
  experienceYear: number | null;
  jobProfile: string;
}

type Errors = Record<keyof FormData, string>;

interface BasicInfoFormProps {
  handleBasicInfoSubmit: (data: FormData) => void;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ handleBasicInfoSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    userName: '',
    email: '',
    experienceYear: null,
    jobProfile: ''
  });

  const [errors, setErrors] = useState<Errors>({
    userName: '',
    email: '',
    experienceYear: '',
    jobProfile: ''
  });

  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    userName: false,
    email: false,
    experienceYear: false,
    jobProfile: false
  });

  const validateField = (name: keyof FormData, value: string | number | null): string => {
    let error = '';

    switch (name) {
      case 'userName':
        if (typeof value === 'string' && !value.trim()) error = 'Username is required';
        else if (typeof value === 'string' && value.length < 2) error = 'Username must be at least 2 characters';
        break;

      case 'email':
        if (typeof value === 'string' && !value.trim()) error = 'Email is required';
        else if (typeof value === 'string' && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) error = 'Invalid email address';
        break;

      case 'experienceYear':
        if (typeof value !== 'number' || isNaN(value) || value <= 0) error = 'Please enter a valid number for experience';
        break;

      case 'jobProfile':
        if (typeof value === 'string' && !value.trim()) error = 'Job profile is required';
        else if (typeof value === 'string' && value.length < 2) error = 'Job profile must be at least 2 characters';
        break;

      default:
        break;
    }

    return error;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    const updatedValue = type === 'number' ? Number(value) || null : value;

    setFormData(prev => ({ ...prev, [name]: updatedValue }));

    if (touched[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name as keyof FormData, updatedValue)
      }));
    }
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    const updatedValue = type === 'number' ? Number(value) || null : value;

    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name as keyof FormData, updatedValue) }));
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = { userName: '', email: '', experienceYear: '', jobProfile: '' };
    let isValid = true;

    (Object.keys(formData) as Array<keyof FormData>).forEach(key => {
      const error = validateField(key, formData[key]);
      newErrors[key] = error;
      if (error) isValid = false;
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    setTouched({ userName: true, email: true, experienceYear: true, jobProfile: true });

    if (validateForm()) {
      handleBasicInfoSubmit(formData);
    }
  };

  const renderInput = (name: keyof FormData, label: string, placeholder: string, type = 'text') => (
    <div className="space-y-2">
      <label className="text-sm text-gray-600">
        {label} <span className="text-red-500">*</span>
      </label>
      <Input
        name={name}
        type={type}
        value={formData[name] ?? ''}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full ${errors[name] && touched[name] ? 'border-red-500' : ''}`}
      />
      {errors[name] && touched[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Proctored Mode Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-700">This test will run in <strong>full-screen mode</strong>. Follow these instructions:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Do not switch tabs or windows.</li>
              <li>Enable camera and microphone if required.</li>
              <li>Close unnecessary applications.</li>
              <li>Stay in a quiet, well-lit environment.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {renderInput('userName', 'User Name', 'Alex Thompson')}
              {renderInput('experienceYear', 'Experience Year', '2.5 years', 'number')}
              {renderInput('email', 'Email', 'alexthompson@example.com', 'email')}
              {renderInput('jobProfile', 'Job Profile', 'Web Developer')}
              <Button type="submit" className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md">Go to Next Step</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BasicInfoForm;
