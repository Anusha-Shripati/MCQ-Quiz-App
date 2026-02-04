import { Input } from '@/components/ui/form/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Question } from '@/shared/types/app';
import { useAuthStore } from '@/store/authStore';
import { PlusCircle } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedDifficulties: Question['difficulty_level'][];
  onDifficultyChange: (difficulties: Question['difficulty_level'][]) => void;
  selectedQuestionTypes: Question['type'][];
  onQuestionTypeChange: (types: Question['type'][]) => void;
  technology: string;
}

export const FilterBar = ({
  searchQuery,
  onSearchChange,
  selectedDifficulties,
  onDifficultyChange,
  selectedQuestionTypes,
  onQuestionTypeChange,
  technology,
}: FilterBarProps) => {
  const difficulties: Question['difficulty_level'][] = ['easy', 'medium', 'hard'];
  const question_type: Question['type'][] = [
    'multiple_select',
    'video',
    'text',
    'mcq',
    'code_snippet',
    'code_snippet_with_mcq',
  ];
  const { hasPermissionQuestionEdit } = useAuthStore();
  const isQuestionEditable = hasPermissionQuestionEdit();
  return (
    <div className="flex flex-col mb-6 sm:flex-row items-start sm:items-center justify-between sm:space-x-6 space-y-4 sm:space-y-0">
      <h2 className="text-xl font-semibold">Questions List</h2>
      <div className="flex items-center justify-center gap-2">
        <Input
          type="search"
          placeholder="Search questions..."
          className="w-[200px] py-5 dark:border-gray-400"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            className={`px-4 py-[10px] rounded-md border cursor-pointer 
                    dark:bg-secondary dark:text-gray-200 dark:border-gray-600
                    bg-gray-200 text-gray-800 border-gray-300`}
          >
            Select Difficulty
          </DropdownMenuTrigger>
          <DropdownMenuContent className="dark dark:bg-secondary dark:text-gray-200 bg-white text-gray-800">
            <DropdownMenuCheckboxItem
              checked={selectedDifficulties.length === difficulties.length}
              onCheckedChange={() => {
                onDifficultyChange(
                  selectedDifficulties.length === difficulties.length ? [] : difficulties
                );
              }}
            >
              Select All
            </DropdownMenuCheckboxItem>
            {difficulties.map((difficulty: Question['difficulty_level']) => (
              <DropdownMenuCheckboxItem
                key={difficulty}
                checked={selectedDifficulties.includes(difficulty)}
                onCheckedChange={() => {
                  const updatedSelections = selectedDifficulties.includes(difficulty)
                    ? selectedDifficulties.filter((item) => item !== difficulty)
                    : [...selectedDifficulties, difficulty];
                  onDifficultyChange(updatedSelections);
                }}
              >
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={`px-4 py-[10px] rounded-md border cursor-pointer 
                    dark:bg-secondary dark:text-gray-200 dark:border-gray-600
                    bg-gray-200 text-gray-800 border-gray-300`}
          >
            Select Question Type
          </DropdownMenuTrigger>
          <DropdownMenuContent className="dark dark:bg-secondary dark:text-gray-200 bg-white text-gray-800">
            <DropdownMenuCheckboxItem
              checked={selectedQuestionTypes.length === question_type.length}
              onCheckedChange={() => {
                onQuestionTypeChange(
                  selectedQuestionTypes.length === question_type.length ? [] : question_type
                );
              }}
            >
              Select All
            </DropdownMenuCheckboxItem>
            {question_type.map((type: Question['type']) => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={selectedQuestionTypes.includes(type)}
                onCheckedChange={() => {
                  const updatedSelections = selectedQuestionTypes.includes(type)
                    ? selectedQuestionTypes.filter((item) => item !== type)
                    : [...selectedQuestionTypes, type];
                  onQuestionTypeChange(updatedSelections);
                }}
              >
                {type
                  .split('_')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {isQuestionEditable && (
          <Link
            href="/questions/create-question/[QuestionSlug]"
            as={`/questions/create-question/${technology}`}
            className="px-4 py-3 text-sm font-medium bg-foreground text-secondary rounded-md shadow-sm hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 inline-flex items-center"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Questions
          </Link>
        )}
      </div>
    </div>
  );
};
