"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminAuth({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            router.push("/");
        }

        setLoading(false);
    }, [router]);

    if (loading) {
        return <LoadingSpinner className="min-h-screen w-full" />;
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}
