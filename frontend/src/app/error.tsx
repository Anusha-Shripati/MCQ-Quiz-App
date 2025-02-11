'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Something went wrong!
      </h2>
      <Button 
        variant="ghost"
        onClick={reset}
      >
        Try again
      </Button>
    </div>
  );
} 