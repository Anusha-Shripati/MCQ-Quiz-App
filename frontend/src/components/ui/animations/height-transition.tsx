'use client';

import { useEffect, useRef, useState } from 'react';

interface HeightTransitionProps {
  isVisible: boolean;
  children: React.ReactNode;
  className?: string;
  duration?: number;
}

export const HeightTransition = ({ 
  isVisible, 
  children, 
  className = "", 
  duration = 300 
}: HeightTransitionProps) => {
  const [height, setHeight] = useState<number | 'auto'>(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!contentRef.current) return;
    
    if (isVisible) {
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(contentHeight);
      const timer = setTimeout(() => setHeight('auto'), duration);
      return () => clearTimeout(timer);
    } else {
      if (contentRef.current.scrollHeight > 0) {
        setHeight(contentRef.current.scrollHeight);
        setTimeout(() => setHeight(0), 5);
      } else {
        setHeight(0);
      }
    }
  }, [isVisible, contentRef]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything during SSR to avoid hydration mismatches
  if (!mounted) {
    return null;
  }

  return (
    <div 
      className={`overflow-hidden transition-all ease-in-out ${className}`} 
      style={{ 
        height: height === 'auto' ? 'auto' : `${height}px`,
        transitionDuration: `${duration}ms`,
        opacity: height === 0 ? 0 : 1,
      }}
    >
      <div ref={contentRef}>
        {children}
      </div>
    </div>
  );
};
