'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    value?: number;
    pass_criteria?: number;
  }
>(({ className, value = 0, pass_criteria , ...props }, ref) => {
  const progressColor =
    pass_criteria !== undefined
      ? value >= pass_criteria
        ? 'bg-green-600'
        : 'bg-red-600'
      : 'bg-blue-600';

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-gray-200', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn('h-full transition-all', progressColor)}
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
