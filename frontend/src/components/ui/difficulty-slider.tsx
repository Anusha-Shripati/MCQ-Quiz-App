import * as React from "react";

interface DifficultySliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color?: "green" | "blue" | "red";
}

export function DifficultySlider({ 
  label, 
  value, 
  onChange,
  color = "blue" 
}: DifficultySliderProps) {
  const colorStyles = {
    green: "bg-green-500 dark:bg-green-600",
    blue: "bg-blue-500 dark:bg-blue-600",
    red: "bg-red-500 dark:bg-red-600"
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </div>
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
        <div 
          className={`absolute h-full rounded-full transition-all ${colorStyles[color]}`}
          style={{ width: `${value}%` }}
        />
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ WebkitAppearance: "none" }}
        />
        <div 
          className="absolute h-4 w-4 -top-1 rounded-full bg-white border-2 border-blue-500 dark:border-blue-400 transition-all hover:scale-110"
          style={{ left: `${value}%`, transform: 'translateX(-50%)' }}
        />
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {value}%
      </div>
    </div>
  );
} 