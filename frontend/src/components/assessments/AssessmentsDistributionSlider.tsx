import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

interface AssessmentsDistributionSliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  className?: string;
}

export const AssessmentsDistributionSlider = ({
  value,
  onValueChange,
  className,
}: AssessmentsDistributionSliderProps) => {
  // value is an array of 2 numbers [firstSplit, secondSplit]
  // Easy: 0 to value[0]
  // Medium: value[0] to value[1]
  // Hard: value[1] to 100

  const easyPct = value[0];
  const mediumPct = value[1] - value[0];
  const hardPct = 100 - value[1];

  return (
    <div className={cn('w-full space-y-4', className)}>
      <div className="flex justify-between text-sm font-medium">
        <div className="text-green-600">Easy: {easyPct}%</div>
        <div className="text-yellow-600">Medium: {mediumPct}%</div>
        <div className="text-red-600">Hard: {hardPct}%</div>
      </div>

      <SliderPrimitive.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={value}
        max={100}
        step={1}
        minStepsBetweenThumbs={5}
        onValueChange={onValueChange}
      >
        <SliderPrimitive.Track className="bg-gray-200 relative grow rounded-full h-[8px] overflow-hidden">
          {/* Easy Segment */}
          <div
            className="absolute h-full bg-green-500"
            style={{ left: '0%', width: `${value[0]}%` }}
          />
          {/* Medium Segment */}
          <div
            className="absolute h-full bg-yellow-500"
            style={{ left: `${value[0]}%`, width: `${value[1] - value[0]}%` }}
          />
          {/* Hard Segment */}
          <div
            className="absolute h-full bg-red-500"
            style={{ left: `${value[1]}%`, right: '0%' }}
          />
        </SliderPrimitive.Track>
        
        {value.map((_, i) => (
          <SliderPrimitive.Thumb
            key={i}
            className="block w-5 h-5 bg-white border-2 border-primary rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
          />
        ))}
      </SliderPrimitive.Root>
    </div>
  );
};
