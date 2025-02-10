import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useTheme } from "next-themes";

interface FilterBarProps {
  totalQuestions: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedDifficulties: string[];
  onDifficultyChange: (difficulties: string[]) => void;
}

export const FilterBar = ({
  totalQuestions,
  searchQuery,
  onSearchChange,
  selectedDifficulties,
  onDifficultyChange,
}: FilterBarProps) => {
  const { theme } = useTheme();
  const difficulties = ["easy", "medium", "hard"];

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
            className={`px-4 py-2 rounded-md border cursor-pointer ${
              theme === "dark" ? "bg-gray-700 text-gray-200 border-gray-600" : "bg-gray-200 text-gray-800 border-gray-300"
            }`}
          >
            Select Difficulty
          </DropdownMenuTrigger>
          <DropdownMenuContent className={theme === "dark" ? "bg-gray-700 text-gray-200" : "bg-white text-gray-800"}>
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
            {difficulties.map((difficulty) => (
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
        <Link
          href="/questions/create-question"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          Create Questions
        </Link>
      </div>
    </div>
  );
};