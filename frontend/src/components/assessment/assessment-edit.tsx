import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { DifficultySlider } from "@/components/ui/difficulty-slider";
import { 
  updateTechnologyQuestions, 
  removeTechnology, 
  addTechnology,
  saveAssessment,
  type Technology,
  updateAssessment,
} from "@/store/features/assessmentSlice";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";

interface AssessmentEditProps {
  assessment: {
    id: string;
    title: string;
    createdBy: string;
    createdDate: string;
    technologies: Technology[];
  };
  onSave: () => void;
  onCancel: () => void;
}

export default function AssessmentEdit({ assessment, onSave, onCancel }: AssessmentEditProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [newTechName, setNewTechName] = useState("");

  const totalQuestions = assessment.technologies.reduce(
    (sum, tech) => sum + tech.questions.easy + tech.questions.medium + tech.questions.hard,
    0
  );

  const handleQuestionChange = (
    techName: string,
    difficulty: keyof Technology["questions"],
    value: number
  ) => {
    const tech = assessment.technologies.find(t => t.name === techName);
    if (tech) {
      const newQuestions = {
        ...tech.questions,
        [difficulty]: value
      };
      dispatch(updateTechnologyQuestions({ 
        assessmentId: assessment.id, 
        techName, 
        questions: newQuestions 
      }));
    }
  };

  const handleRemoveTechnology = (techName: string) => {
    dispatch(removeTechnology({ assessmentId: assessment.id, techName }));
  };

  const handleAddTechnology = () => {
    if (newTechName.trim()) {
      dispatch(addTechnology({ 
        assessmentId: assessment.id,
        technology: {
          name: newTechName.trim(), 
          percentage: 25 
        }
      }));
      setNewTechName("");
    }
  };

  const handleSaveChanges = () => {
    dispatch(updateAssessment(assessment));
    onSave();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button 
              onClick={onCancel}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Title Section */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {assessment.title}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Created by {assessment.createdBy} on {assessment.createdDate}
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  className="hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveChanges}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            {/* Technologies Pills */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {assessment.technologies.map((tech) => (
                  <div 
                    key={tech.name} 
                    className="flex items-center bg-gray-50 hover:bg-gray-100 transition-colors rounded-full px-4 py-2"
                  >
                    <span className="text-sm font-medium text-gray-700">{tech.name}</span>
                    <button 
                      onClick={() => handleRemoveTechnology(tech.name)}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTechName}
                    onChange={(e) => setNewTechName(e.target.value)}
                    placeholder="New technology..."
                    className="rounded-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleAddTechnology}
                    className="rounded-full text-sm hover:bg-gray-50"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Questions Grid */}
              <div className="mt-8">
                {/* Headers */}
                <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr] gap-6 mb-6">
                  <div className="text-sm font-medium text-gray-700">Technology</div>
                  <DifficultySlider label="Easy" value={50} />
                  <DifficultySlider label="Medium" value={50} />
                  <DifficultySlider label="Hard" value={50} />
                  <div className="text-sm font-medium text-gray-700 text-center">Total</div>
                </div>

                {/* Technology Rows */}
                <div className="space-y-4">
                  {assessment.technologies.map((tech) => (
                    <div 
                      key={tech.name} 
                      className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr] gap-6 items-center py-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="text-gray-900">
                        {tech.name} 
                        <span className="ml-1 text-sm text-gray-500">({tech.percentage}%)</span>
                      </div>
                      <input
                        type="number"
                        value={tech.questions.easy}
                        onChange={(e) => handleQuestionChange(tech.name, 'easy', parseInt(e.target.value))}
                        className="w-20 px-3 py-2 text-center rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="number"
                        value={tech.questions.medium}
                        onChange={(e) => handleQuestionChange(tech.name, 'medium', parseInt(e.target.value))}
                        className="w-20 px-3 py-2 text-center rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="number"
                        value={tech.questions.hard}
                        onChange={(e) => handleQuestionChange(tech.name, 'hard', parseInt(e.target.value))}
                        className="w-20 px-3 py-2 text-center rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="text-center font-medium text-gray-900">
                        {tech.questions.easy + tech.questions.medium + tech.questions.hard}
                      </div>
                    </div>
                  ))}

                  {/* Totals Row */}
                  <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr] gap-6 items-center pt-4 border-t border-gray-200">
                    <div className="font-medium text-gray-900">Total</div>
                    <div className="text-center font-medium text-gray-900">
                      {assessment.technologies.reduce((sum, tech) => sum + tech.questions.easy, 0)}
                    </div>
                    <div className="text-center font-medium text-gray-900">
                      {assessment.technologies.reduce((sum, tech) => sum + tech.questions.medium, 0)}
                    </div>
                    <div className="text-center font-medium text-gray-900">
                      {assessment.technologies.reduce((sum, tech) => sum + tech.questions.hard, 0)}
                    </div>
                    <div className="text-center font-medium text-blue-600">
                      {totalQuestions}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}