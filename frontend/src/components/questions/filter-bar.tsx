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

interface FilterBarProps {
  totalQuestions: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedDifficulties: Question['difficulty_level'][];
  onDifficultyChange: (difficulties: Question['difficulty_level'][]) => void;
  technology: string;
}

export const FilterBar = ({
  totalQuestions,
  searchQuery,
  onSearchChange,
  selectedDifficulties,
  onDifficultyChange,
  technology,
}: FilterBarProps) => {
  const difficulties: Question['difficulty_level'][] = ['easy', 'medium', 'hard'];
  const { hasPermissionQuestionEdit } = useAuthStore();
  const isQuestionEditable = hasPermissionQuestionEdit();
  return (
    <div className="flex flex-col mb-6 sm:flex-row items-start sm:items-center justify-between sm:space-x-6 space-y-4 sm:space-y-0">
      <h2 className="text-xl font-semibold">{`Questions List (${totalQuestions})`}</h2>
      <div className="flex items-center justify-center gap-2">
        <Input
          type="text"
          placeholder="Search questions..."
          className="w-[300px] py-5 dark:border-gray-400"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            className={`px-4 py-[10px] rounded-md border cursor-pointer 
                    dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600
                    bg-gray-200 text-gray-800 border-gray-300`}
          >
            Select Difficulty
          </DropdownMenuTrigger>
          <DropdownMenuContent className="dark dark:bg-gray-700 dark:text-gray-200 bg-white text-gray-800">
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
        {isQuestionEditable && (
          <Link
            href="/questions/create-question/[QuestionSlug]"
            as={`/questions/create-question/${technology}`}
            className="px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Create Questions
          </Link>
        )}
      </div>
    </div>
  );
};
