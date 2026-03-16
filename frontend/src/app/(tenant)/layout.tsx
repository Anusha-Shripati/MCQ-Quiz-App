'use client';
import { ReactNode } from 'react';
import Sidebar from '@/components/common/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import AdminAuth from '@/components/common/admin-auth';
import AuthInitializer from '@/components/common/auth-initializer';
import { SWRConfig } from 'swr';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthInitializer>
      <AdminAuth>
        <Sidebar />
        <div className="flex flex-col w-full">
          <div
            className="flex-grow bg-secondary border overflow-y flex justify-center"
          >
            <ScrollArea  className="px-6 w-full">
              <SWRConfig value={{ dedupingInterval: 10000,revalidateOnFocus:false }}>{children}</SWRConfig>
            </ScrollArea>
          </div>
        </div>
      </AdminAuth>
    </AuthInitializer>
  );
}
