'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/form/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function PlatformThemeToggle({ isCollapsed = true }: { isCollapsed?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className={`w-full text-base relative h-10 flex ${isCollapsed ? 'justify-center' : 'justify-start'} items-center gap-4 p-3 rounded-lg transition-colors text-slate-700 dark:text-white/90 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white`}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            <span className="h-5 w-5 relative flex items-center justify-center overflow-hidden">
              <Sun className="absolute h-[30px] w-[30px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-slate-700" />
              <Moon className="absolute h-[30px] w-[30px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-white" />
            </span>
            {!isCollapsed && <span>Theme</span>}
          </Button>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" align="center">
            <p>Switch to {theme === 'dark' ? 'light' : 'dark'} theme</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
