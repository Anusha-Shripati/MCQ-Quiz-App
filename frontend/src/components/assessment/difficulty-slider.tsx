import { useState, useEffect } from "react";

interface DifficultySliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export function DifficultySlider({ label, value, onChange }: DifficultySliderProps) {
  const [sliderValue, setSliderValue] = useState(value);

  // Sync slider value with prop value when it changes
  useEffect(() => {
    setSliderValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setSliderValue(newValue);
    onChange(newValue);  // Pass the new value back to parent
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-700">
        <span>{label}</span>
        <span>{sliderValue}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={sliderValue}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
}
