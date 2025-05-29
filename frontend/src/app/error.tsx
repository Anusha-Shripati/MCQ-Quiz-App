'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/form/button';

export default function Error({
  error,
  reset,
  className,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (Error & { digest?: string }) | any;
  reset: () => void;
  className?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className={`flex h-full flex-col items-center justify-center gap-4 w-full ${className || ''}`}
    >
      <h2 className="text-center text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Something went wrong!
      </h2>
      <Button variant="default" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
