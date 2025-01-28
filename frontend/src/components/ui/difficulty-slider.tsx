interface DifficultySliderProps {
  label: string;
  value: number;
}

export function DifficultySlider({ label, value }: DifficultySliderProps) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-600 mb-1">{label}</span>
      <div className="flex items-center gap-2">
        <div className="h-1 flex-grow bg-gray-200 rounded-full relative">
          <div className="absolute h-4 w-4 bg-blue-500 rounded-full top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute h-1 w-1/2 bg-blue-500 rounded-full left-0"></div>
        </div>
        <span className="text-xs text-gray-500">{value}%</span>
      </div>
    </div>
  );
} 