import { ReactNode, Suspense } from 'react';
import './globals.css';
import { ThemeProvider } from '@/components/common/theme-provider';
import { ToastSetup } from '@/components/common/toast-setup';
import { nunito } from '@/lib/fonts';
import { TooltipProvider } from '@/components/ui/tooltip';
import { NavigationProgress } from '@/components/ui/navigation-progress';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MCQ Quiz Application',
  description: 'A full-stack MCQ quiz application with Node.js backend and Next.js frontend',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`flex min-h-screen relative hide-scroller ${nunito.className}`}>
        <Suspense fallback={<LoadingSpinner/>}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NavigationProgress />
            <TooltipProvider>{children}</TooltipProvider>
            <ToastSetup />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
