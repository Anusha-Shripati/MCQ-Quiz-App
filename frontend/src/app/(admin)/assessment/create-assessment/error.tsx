'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function CreateAssessmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Failed to load create assessment
      </h2>
      <Button
        onClick={reset}
        className="bg-blue-600 text-white hover:bg-blue-700"
      >
        Try again
      </Button>
    </div>
  );
} 