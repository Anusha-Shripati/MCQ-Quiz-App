'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlatformAuthStore } from '@/store/platformAuthStore';
import PlatformSidebar from '@/components/platform/layout/PlatformSidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SWRConfig } from 'swr';
import '@/styles/platform.css';

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, initializeAuth, initializing } = usePlatformAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!initializing && !isAuthenticated()) {
      router.push('/platform-auth/login');
    }
  }, [isAuthenticated, initializing, router]);

  if (initializing) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="platform-theme flex w-full">
      <PlatformSidebar />
      <div className="flex flex-col w-full">
        <div className="flex-grow bg-secondary border overflow-y flex justify-center">
          <ScrollArea className="px-6 w-full">
            <SWRConfig value={{ dedupingInterval: 10000, revalidateOnFocus: false }}>
              {children}
            </SWRConfig>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
