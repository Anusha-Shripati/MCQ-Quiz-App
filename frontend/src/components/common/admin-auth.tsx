'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { User } from '@/types/common.types';

export default function AdminAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push('/');
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
