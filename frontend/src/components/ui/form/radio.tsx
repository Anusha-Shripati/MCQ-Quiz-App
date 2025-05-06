'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '@/lib/utils';

const RadioGroup = RadioGroupPrimitive.Root;

const Radio = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      'peer h-4 w-4 rounded-full border border-primary text-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:border-primary',
      className
    )}
    {...props}
  >
    <div className="flex h-full w-full items-center justify-center">
      <span className="h-2 w-2 rounded-full bg-primary-foreground peer-data-[state=checked]:block hidden" />
    </div>
  </RadioGroupPrimitive.Item>
));
Radio.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, Radio };
