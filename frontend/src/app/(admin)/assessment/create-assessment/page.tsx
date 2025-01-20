
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AVAILABLE_CATEGORIES } from "@/shared/constants/data";
import toast from "react-hot-toast";

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
  const [targetQuestions, setTargetQuestions] = useState(0);
  const [formData, setFormData] = useState<AssessmentForm>({
    name: "",
    categories: [
      {
        name: "",
        questions: { easy: 0, medium: 0, hard: 0 }
      }
    ]
  });
  // const [error, setError] = useState<string>("");

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
    const numValue = parseInt(value);

    const totalSum = calculateTotalSum();
    const remainingQuestions = targetQuestions - totalSum + formData.categories[index].questions[difficulty];

    if (numValue > remainingQuestions) {
      toast.error(`You can only allocate ${remainingQuestions} questions.`);
      return;
    }

    setFormData(prev => {
      const updatedCategories = [...prev.categories];
      updatedCategories[index].questions[difficulty] = numValue;
      return { ...prev, categories: updatedCategories };
    });
  };

  const handleAssessmentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      name: e.target.value
    }));
    
  };

  const handleCategoryChange = (value: string, index: number) => {
    if (formData.categories.some((cat, i) => cat.name === value && i !== index)) {
      toast.error("This category has already been selected");
      return;
    }

    setFormData(prev => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === index ? { ...cat, name: value } : cat
      )
    }));
   
  };

  const handleAddCategory = () => {
    if (formData.categories.length >= AVAILABLE_CATEGORIES.length) {
      toast.error("All available categories have been added");
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
      toast.error("At least one category is required");
      return;
    }

    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
   
  };

  const handleNextStep = () => {
    if (step === 1 && !formData.name.trim()) {
     
      toast.error("Assessment name is required");
      return;
    }
    if(step === 1 && formData.categories.length <= 1 && formData.categories[0].name === ""){
      toast.error("At least add one category.");
      return;
    }
    if (step === 2) {
      const isValid = formData.categories.every(cat =>
        Object.values(cat.questions).some(count => count > 0)
      );
      if (!isValid) {
        toast.error("Each category must have at least one question");
        return;
      }
    }
    setStep(prev => prev + 1);
    
  };

  const handlePreviousStep = () => {
    setStep(prev => prev - 1);
   
  };

  const handleSubmit = () => {
    console.log("Submitting:", formData);
  };

  return (
    <div className="mx-auto py-8 px-6">
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
        
        <div className="relative flex justify-center items-center mb-8">
          {/* <div className="absolute left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700" /> */}
          <div className="relative flex justify-between w-full max-w-xs">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                ${step === 1 ? 'border-primary bg-gray-500 text-white' : 'bg-white dark:bg-primary'}`}>
                1
              </div>
              <span className="mt-2 text-sm">Basic Info</span>
            <div className="absolute left-[10%] top-[58%] right-[9%] h-0.5 bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="flex flex-col items-center ">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                ${step === 2 ? 'border-primary bg-gray-500 text-white' : ' bg-white dark:bg-primary'}`}>
                2
              </div>
              <span className="mt-2 text-sm">Questions</span>
            </div>
            <div className="flex flex-col items-center ">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                ${step === 3 ? 'border-primary bg-gray-500 text-white' : ' bg-white dark:bg-primary'}`}>
                3
              </div>
              <span className="mt-2 text-sm">Summary</span>
            </div>
          </div>
        </div>
      </div>
  
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-bold">Assessment Details</CardTitle>
            <CardDescription>Enter the basic information about your assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="assessmentName" className="font-bold">Assessment Name</Label>
              <Input
                id="assessmentName"
                placeholder="Enter a descriptive name"
                value={formData.name}
                onChange={handleAssessmentNameChange}
                className="dark:bg-gray-600"
              />
            </div>
  
            <div className="space-y-3">
              <Label className="font-bold">Categories</Label>
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
                  className="w-1/4"
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
  
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-bold">Question Distribution</CardTitle>
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
                    const percentage = ((total / targetQuestions) * 100).toFixed(1);
                    
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
                Target Questions: <input value={targetQuestions} className="w-16 font-bold p-2 rounded" type="number" onChange={(e) => setTargetQuestions(e.target.value)} />
              </div>
              <div className="text-sm">
                Selected Questions: <span className="font-semibold">{calculateTotalSum()}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={handlePreviousStep} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleNextStep}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
  
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-bold">Summary</CardTitle>
            <CardDescription>Review the details of your assessment before submitting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="font-bold">Assessment Name</Label>
              <div className="text-lg">{formData.name}</div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Categories and Questions</Label>
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
                      const percentage = ((total / targetQuestions) * 100).toFixed(1);
                      
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell className="text-center">{category.questions.easy}</TableCell>
                          <TableCell className="text-center">{category.questions.medium}</TableCell>
                          <TableCell className="text-center">{category.questions.hard}</TableCell>
                          <TableCell className="text-center font-semibold">{total}</TableCell>
                          <TableCell className="text-center">{percentage}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center p-4 bg-muted rounded-lg dark:bg-gray-800">
              <div className="text-sm">
                Target Questions: <span className="font-semibold">{targetQuestions}</span>
              </div>
              <div className="text-sm">
                Selected Questions: <span className="font-semibold">{calculateTotalSum()}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={handlePreviousStep} className="mr-4">
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