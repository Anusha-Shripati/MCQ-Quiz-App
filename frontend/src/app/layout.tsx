import { ReactNode, Suspense } from 'react';
import './globals.css';
import { ThemeProvider } from '@/components/common/theme-provider';
import { nunito } from '@/lib/fonts';
import { TooltipProvider } from '@/components/ui/tooltip';
import { NavigationProgress } from '@/components/ui/navigation-progress';
import { Toaster } from 'react-hot-toast';
import AuthInitializer from '@/components/common/auth-initializer';
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
          <AuthInitializer>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <NavigationProgress />
              <TooltipProvider>{children}</TooltipProvider>
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 5000,
                  style: {
                    padding: '12px 16px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  },
                }}
              />
            </ThemeProvider>
          </AuthInitializer>
        </Suspense>

      </body>
    </html>
  );
}
