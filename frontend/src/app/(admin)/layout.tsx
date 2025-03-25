"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import { useAppSelector } from "@/toolkit-store/hooks";
import Sidebar from "@/components/common/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
// import ClientWrapper from "@/components/ClientWrapper";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuthStore } from "@/store/authStore";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  // const { user, loading } = useAppSelector((state) => state.auth);
  const { user, loading } = useAuthStore();
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (!mounted || loading) {
    return (
      <LoadingSpinner className="min-h-screen w-full"/>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 bg-secondary border h-screen overflow-y-scroll flex justify-center">
        {/* <ClientWrapper> */}
          <ScrollArea className="px-6 w-full xl:max-w-[1600px]">
            {children}
          </ScrollArea>
        {/* </ClientWrapper> */}
      </div>
    </>
  );
}

