import { ReactNode } from "react";
import Sidebar from "@/components/common/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import ClientWrapper from "@/components/ClientWrapper";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <div className="flex-1 bg-secondary border h-screen overflow-y-scroll flex justify-center">
        <ClientWrapper>
          <ScrollArea className="px-6 w-full xl:max-w-[1600px]">
            {children}
          </ScrollArea>
        </ClientWrapper>
      </div>
    </>
  );
}

