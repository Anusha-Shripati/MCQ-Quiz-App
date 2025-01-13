
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { AVAILABLE_CATEGORIES } from "@/shared/constants/data";


interface Category {
  name: string;
  questions: {
    easy: number;
    medium: number;
    hard: number;
  };
}

interface AssessmentForm {
  name: string;
  categories: Category[];
}


export default function CreateAssessment() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<AssessmentForm>({
    name: "",
    categories: [
      {
        name: "MongoDB",
        questions: { easy: 0, medium: 0, hard: 0 }
      }
    ]
  });
  const [error, setError] = useState<string>("");

  // Helper Functions
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

  const handleQuestionCountChange = (
    index: number,
    difficulty: "easy" | "medium" | "hard",
    value: string
  ) => {
    const numValue = parseInt(value) || 0;

    // Ensure the total across all categories stays at 40
    const totalSum = calculateTotalSum();
    const remainingQuestions = 40 - totalSum + formData.categories[index].questions[difficulty];

    if (numValue > remainingQuestions) {
      alert(`You can only allocate ${remainingQuestions} more questions.`);
      return;
    }

    setFormData(prev => {
      const updatedCategories = [...prev.categories];
      updatedCategories[index].questions[difficulty] = numValue;
      return { ...prev, categories: updatedCategories };
    });
  };


  // Calculate total questions
  // const totalQuestions = formData.categories.reduce((total, category) => {
  //   const { easy, medium, hard } = category.questions;
  //   return total + easy + medium + hard;
  // }, 0);

  const handleAssessmentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      name: e.target.value
    }));
    setError("");
  };

  const handleCategoryChange = (value: string, index: number) => {
    if (formData.categories.some((cat, i) => cat.name === value && i !== index)) {
      setError("This category has already been selected");
      return;
    }

    setFormData(prev => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === index ? { ...cat, name: value } : cat
      )
    }));
    setError("");
  };

  const handleAddCategory = () => {
    if (formData.categories.length >= AVAILABLE_CATEGORIES.length) {
      setError("All available categories have been added");
      return;
    }

    setFormData(prev => ({
      ...prev,
      categories: [
        ...prev.categories,
        { name: "", questions: { easy: 0, medium: 0, hard: 0 } }
      ]
    }));
  };

  const handleRemoveCategory = (index: number) => {
    if (formData.categories.length === 1) {
      setError("At least one category is required");
      return;
    }

    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
    setError("");
  };

  const handleNextStep = () => {
    if (!formData.name.trim()) {
      setError("Assessment name is required");
      return;
    }
    setStep(2);
    setError("");
  };

  const handlePreviousStep = () => {
    setStep(1);
    setError("");
  };

  const handleSubmit = () => {
    const isValid = formData.categories.every(cat =>
      Object.values(cat.questions).some(count => count > 0)
    );

    if (!isValid) {
      setError("Each category must have at least one question");
      return;
    }

    console.log("Submitting:", formData);
  };

  return (
    <div className="mx-auto py-8 px-6">
    {/* Header with improved visual hierarchy */}
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-6">
        {step > 1 ? (
          <Button variant="ghost" size="icon" onClick={handlePreviousStep}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-2xl font-semibold">Create Assessment</h1>
      </div>
      
      {/* Improved progress indicator */}
      <div className="relative flex justify-center items-center mb-8">
        <div className="absolute left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700" />
        <div className="relative flex justify-between w-full max-w-xs">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
              ${step === 1 ? 'border-primary bg-gray-500 text-white' : 'bg-white dark:bg-primary'}`}>
              1
            </div>
            <span className="mt-2 text-sm">Basic Info</span>
          </div>
          <div className="flex flex-col items-center ">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
              ${step === 2 ? 'border-primary bg-gray-500 text-white' : ' bg-white dark:bg-primary'}`}>
              2
            </div>
            <span className="mt-2 text-sm">Questions</span>
          </div>
        </div>
      </div>
    </div>
  
    {/* Error handling with better visibility */}
    {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </div>
        </Alert>
      )}
  
    {/* Step 1: Basic Information */}
    {step === 1 && (
      <Card>
        <CardHeader>
          <CardTitle>Assessment Details</CardTitle>
          <CardDescription>Enter the basic information about your assessment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="assessmentName">Assessment Name</Label>
            <Input
              id="assessmentName"
              placeholder="Enter a descriptive name"
              value={formData.name}
              onChange={handleAssessmentNameChange}
              className="dark:bg-gray-600"
            />
          </div>
  
          <div className="space-y-3">
            <Label>Categories</Label>
            <div className="space-y-3">
              {formData.categories.map((category, index) => (
                <div key={index} className="flex items-center gap-2 ">
                  <Select
                    value={category.name}
                    onValueChange={(value) => handleCategoryChange(value, index)}
                  >
                    <SelectTrigger className="flex-1 dark:bg-gray-600">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    onClick={() => handleRemoveCategory(index)}
                    className="p-1 text-2xl text-gray-500 bg-gray-100 rounded-full hover:text-red-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:text-red-500"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            {formData.categories.length < AVAILABLE_CATEGORIES.length && (
              <Button 
                variant="outline" 
                onClick={handleAddCategory}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleNextStep}>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    )}
  
    {/* Step 2: Question Distribution */}
    {step === 2 && (
      <Card>
        <CardHeader>
          <CardTitle>Question Distribution</CardTitle>
          <CardDescription>Specify the number of questions for each difficulty level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border dark:border-gray-700">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Easy</TableHead>
                  <TableHead className="text-center">Medium</TableHead>
                  <TableHead className="text-center">Hard</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.categories.map((category, index) => {
                  const total = category.questions.easy + 
                              category.questions.medium + 
                              category.questions.hard;
                  const percentage = ((total / 40) * 100).toFixed(1);
                  
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      {['easy', 'medium', 'hard'].map(difficulty => (
                        <TableCell key={difficulty} className="text-center">
                          <Input
                            type="number"
                            min="0"
                            value={category?.questions[difficulty]}
                            onChange={(e) => handleQuestionCountChange(index, difficulty, e.target.value)}
                            className="w-20 text-center mx-auto dark:bg-gray-500"
                          />
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-semibold">{total}</TableCell>
                      <TableCell className="text-center">{percentage}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
  
          <div className="mt-6 flex justify-between items-center p-4 bg-muted rounded-lg dark:bg-gray-800">
            <div className="text-sm">
              Target Questions: <span className="font-semibold">40</span>
            </div>
            <div className="text-sm">
              Selected Questions: <span className="font-semibold">{calculateTotalSum()}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePreviousStep}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleSubmit}>
            Save Assessment
          </Button>
        </CardFooter>
      </Card>
    )}
  </div>
  );
}
