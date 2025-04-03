"use client"
import { ReactNode } from "react";
import Sidebar from "@/components/common/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdminAuth from "@/components/common/admin-auth";
import{ SWRConfig } from 'swr'


export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {

  return (
    <>
      <Sidebar />
      <div className="flex-1 bg-secondary border h-screen overflow-y flex justify-center">
        <ScrollArea className="px-6 w-full xl:max-w-[1600px]">
          <SWRConfig value={{dedupingInterval:10000}}>
            <AdminAuth>{children}</AdminAuth>
          </SWRConfig>
        </ScrollArea>
      </div>
    </>
  );
}

