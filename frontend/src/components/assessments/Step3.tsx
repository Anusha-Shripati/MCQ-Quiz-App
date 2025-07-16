import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/form/button';
import { Label } from '@/components/ui/form/label';
import { ArrowLeft } from 'lucide-react';
import { AssessmentForm } from '@/types/assessment.types';
import { questionTypeOptions } from '@/shared/constants/data';

interface Step3Props {
  formData: AssessmentForm;
  setStep: (step: number) => void;
  handlePreviousStep: () => void;
  handleSubmit: () => void;
  calculateTotalSum: () => number;
  isMutating: boolean;
}

const Step3: React.FC<Step3Props> = ({
  formData,
  setStep,
  handlePreviousStep,
  handleSubmit,
  calculateTotalSum,
  isMutating,
}) => {
  const calculateDifficultyPercentage = (difficulty: 'easy' | 'medium' | 'hard') => {
    const totalForDifficulty = formData.technologies.reduce(
      (sum, tech) => sum + tech[difficulty].total,
      0
    );
    return formData.targetQuestions > 0
      ? Math.round((totalForDifficulty / formData.targetQuestions) * 100)
      : 0;
  };

  return (
    <Card className="max-h-[80vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="p-4">
        <CardTitle className="font-bold text-lg dark:text-white">Assessment Summary</CardTitle>
        <CardDescription className="text-sm dark:text-gray-300">
          Review and confirm your assessment details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {/* Basic Information Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(1)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
            >
              Edit
            </Button>
          </div>
          <div className="grid gap-2">
            <div>
              <Label className="text-xs font-bold text-gray-500 dark:text-gray-400">Assessment Name</Label>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {formData.name}
              </p>
            </div>
            <div>
              <Label className="text-xs font-bold text-gray-500 dark:text-gray-400">
                Selected Technologies
              </Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {formData.technologies.map((category) => (
                  <div
                    key={category.name}
                    className="px-2 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-xs font-medium"
                  >
                    {category.name}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs font-bold text-gray-500 dark:text-gray-400">Passing Score</Label>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {formData.pass_criteria} Marks
              </p>
            </div>
          </div>
        </div>

        {/* Questions Distribution Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Questions Distribution
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(2)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
            >
              Edit
            </Button>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
            <Table className="text-sm">
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-700">
                  <TableHead className="w-[30%] p-2 dark:text-white">Technology</TableHead>
                  <TableHead className="text-center p-2">
                    Easy ({calculateDifficultyPercentage('easy')}%)
                  </TableHead>
                  <TableHead className="text-center p-2">
                    Medium ({calculateDifficultyPercentage('medium')}%)
                  </TableHead>
                  <TableHead className="text-center p-2">
                    Hard ({calculateDifficultyPercentage('hard')}%)
                  </TableHead>
                  <TableHead className="text-center p-2 dark:text-white">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.technologies.map((tech) => {
                  const total = tech.easy.total + tech.medium.total + tech.hard.total;
                  return (
                    <TableRow key={tech.name} className="hover:bg-gray-50 dark:hover:bg-gray-600 text-lg">
                      <TableCell className="font-medium p-2 dark:text-white">{tech.name}</TableCell>
                      <TableCell className="text-center p-2 dark:text-gray-300">
                        <div className='flex flex-col gap-2 w-3/4 '>
                          {questionTypeOptions.map((item)=>{
                            return <div className='flex gap-3 justify-between' key={item.value}>
                              <label>{item.label}: </label>
                              <label>{tech.easy[item.value] || 0}</label>
                            </div>
                          })}
                        </div>
                        <div className='flex w-3/4 justify-between mt-3 font-bold text-md border-t-2  pt-2'> <label >Total:</label> <span> {tech.easy.total}</span></div>

                      </TableCell>
                      <TableCell className="text-center p-2 dark:text-gray-300">
                        <div className='flex flex-col gap-2 w-3/4 '>
                          {questionTypeOptions.map((item)=>{
                            return <div className='flex gap-3 justify-between' key={item.value}>
                              <label>{item.label}: </label>
                              <label>{tech.medium[item.value] || 0}</label>
                            </div>
                          })}
                        </div>
                        <div className='flex w-3/4 justify-between mt-3 font-bold text-md border-t-2  pt-2'> <label >Total:</label> <span> {tech.medium.total}</span></div>

                      </TableCell>
                      <TableCell className="text-center p-2 dark:text-gray-300" >
                        <div className='flex flex-col gap-2 w-3/4 '>
                          {questionTypeOptions.map((item)=>{
                            return <div className='flex gap-3 justify-between' key={item.value}>
                              <label>{item.label}: </label>
                              <label>{tech.medium[item.value] || 0}</label>
                            </div>
                          })}
                        </div>
                       <div className='flex w-3/4 justify-between mt-3 font-bold text-md border-t-2 pt-2'> <label >Total:</label> <span> {tech.hard.total}</span></div>
                      </TableCell>
                      <TableCell className="text-center p-2 font-semibold dark:text-white">
                        {total}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-600">
                  <TableCell className="font-medium p-2 dark:text-white">Total</TableCell>
                  <TableCell className="text-center p-2 dark:text-gray-300">
                    {formData.technologies.reduce((sum, tech) => sum + tech.easy.total, 0)}
                  </TableCell>
                  <TableCell className="text-center p-2 dark:text-gray-300">
                    {formData.technologies.reduce((sum, tech) => sum + tech.medium.total, 0)}
                  </TableCell>
                  <TableCell className="text-center p-2 dark:text-gray-300">
                    {formData.technologies.reduce((sum, tech) => sum + tech.hard.total, 0)}
                  </TableCell>
                  <TableCell className="text-center p-2 font-semibold dark:text-white">
                    {calculateTotalSum()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Target & Selected Questions Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="space-y-1 mb-2 sm:mb-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">Target Questions</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formData.targetQuestions}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Selected Questions</p>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {calculateTotalSum()}
            </p>
          </div>
        </div>
      </CardContent>

      {/* Footer Actions */}
      <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 p-4">
        <Button
          variant="outline"
          disabled={isMutating}
          onClick={handlePreviousStep}
          className="text-sm dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isMutating}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white text-sm"
        >
          Create Assessment
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Step3;
