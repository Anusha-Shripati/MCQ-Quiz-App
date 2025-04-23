'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgress() {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Start progress when navigation starts
    setIsNavigating(true);

    // Complete progress after component mounts with new route
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <div className="h-1 bg-primary animate-pulse">
        <div className="h-1 bg-gray-200">
          <div className="h-full bg-primary animate-progress-bar" style={{ width: '100%' }} />
        </div>
      </div>
    </div>
  );
}
