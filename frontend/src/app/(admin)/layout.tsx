"use client";
import { ReactNode } from "react";
import Sidebar from "@/components/common/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdminAuth from "@/components/common/admin-auth";
import { SWRConfig } from "swr";
import { Header } from "@/app/(admin)/header/page";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminAuth>
        <Sidebar />
        <div className="flex flex-col w-full">
          <Header />
          <div className="flex-grow bg-secondary border overflow-auto flex justify-center" style={{maxHeight:'calc(100vh - 5rem)'}}>
            {/* <ScrollArea className="px-6 w-full xl:max-w-[1600px]"> */}
            <ScrollArea className="px-6 w-full">
              <SWRConfig value={{ dedupingInterval: 10000 }}>
                {children}
              </SWRConfig>
            </ScrollArea>
          </div>
        </div>
      </AdminAuth>
    </>
  );
}
