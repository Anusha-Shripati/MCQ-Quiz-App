import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import DateRangePicker from "../date-range-picker";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusOption {
  value: string;
  label: string;
}

interface FilterOptionsProps {
  activeFilter: string;
  handleOpenFilter: (filter: string) => void;
  assessmentFilter?: StatusOption[];
  dateRange?: [string, string];
  setAssessmentFilter?: (filter: StatusOption[]) => void;
}

export function FilterOptions({
  activeFilter,
  handleOpenFilter
}: FilterOptionsProps) {
  const renderFilterContent = (filter: string) => {
    switch (filter) {
      case "experience":
        return (
          <div className="space-y-4 w-64">
            <div className="flex items-center gap-4">
              <Input type="number" placeholder="Min" className="w-20" />
              <span className="text-gray-500">to</span>
              <Input type="number" placeholder="Max" className="w-20" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" className="text-sm">0–2 years</Button>
              <Button variant="outline" className="text-sm">3–5 years</Button>
              <Button variant="outline" className="text-sm">5+ years</Button>
            </div>
          </div>
        );
     
      case "created":
        return (
          <div className="space-y-2">
            <DateRangePicker />
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" className="text-sm">Last 7 Days</Button>
              <Button variant="outline" className="text-sm">Last 30 Days</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex gap-2 flex-wrap md:flex-nowrap shrink-0">
      {["Created"].map((filter) => (
        <div key={filter} className="relative">
          <Button
            variant="outline"
            onClick={() => handleOpenFilter(filter.toLowerCase())}
            className={cn(
              "h-11 text-sm font-medium gap-2 whitespace-nowrap",
              "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
              "hover:bg-gray-50 dark:hover:bg-gray-800",
              "transition-all duration-200",
              activeFilter === filter.toLowerCase() && "border-blue-500 dark:border-blue-400"
            )}
          >
            {filter}
            {activeFilter === filter.toLowerCase() ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {activeFilter === filter.toLowerCase() && (
            <div className={cn(
              "absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-900",
              "border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg",
              "z-50 p-4 transform origin-top",
              "animate-in fade-in slide-in-from-top-2 duration-200"
            )}>
              {renderFilterContent(filter.toLowerCase())}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 