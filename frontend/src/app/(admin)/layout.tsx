'use client';
import { ReactNode } from 'react';
import Sidebar from '@/components/common/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import AdminAuth from '@/components/common/admin-auth';
import { SWRConfig } from 'swr';
import { Header } from '@/app/(admin)/header/page';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminAuth>
        <Sidebar />
        <div className="flex flex-col w-full">
          <Header />
          <div
            className="flex-1 bg-secondary border overflow-y flex justify-center"
            style={{ height: 'calc(100vh - 10rem)' }}
          >
            {/* <ScrollArea className="px-6 w-full xl:max-w-[1600px]"> */}
            <ScrollArea className="px-6 w-full">
              <SWRConfig value={{ dedupingInterval: 10000 }}>{children}</SWRConfig>
            </ScrollArea>
          </div>
        </div>
      </AdminAuth>
    </>
  );
}
