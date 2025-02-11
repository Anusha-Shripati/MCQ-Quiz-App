import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Question } from "@/shared/types/app";
import { useTheme } from "next-themes";

interface QuestionCardProps {
  question: Question;
}

export const QuestionCard = ({ question }: QuestionCardProps) => {
  const { theme } = useTheme();

  return (
    <Card className={`${theme === "dark" ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800"} mb-4 p-4 shadow-sm`}>
      <div className="text-lg font-semibold mb-2">
        {question.id}. {question.question}
      </div>
      <ul className="space-y-2">
        {question.options?.map((option, index) => (
          <li
            key={index}
            className={`p-2 rounded-md text-sm md:text-base ${
              option === question?.correctAnswer
                ? theme === "dark"
                  ? "bg-green-800 text-green-100"
                  : "bg-green-100 text-green-800"
                : theme === "dark"
                ? "bg-gray-800 text-gray-400"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {String.fromCharCode(65 + index)}. {option}
          </li>
        ))}
      </ul>
      <div className="flex justify-between items-center mt-4 text-sm">
        <div className="space-x-4">
          <Button variant="link" className="text-blue-500 hover:underline">
            Edit
          </Button>
          <Button variant="link" className="text-red-500 hover:underline">
            Delete
          </Button>
        </div>
        <Badge className={`${theme === "dark" ? "bg-gray-600 text-gray-200" : "bg-gray-200 text-gray-800"} py-1 px-3`}>
          {question.difficulty}
        </Badge>
      </div>
    </Card>
  );
};