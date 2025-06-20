'use client';
// import Loading from '@/app/loading';
import { useAuthStore } from '@/store/authStore';
import React, { ReactNode, useEffect } from 'react';

export default function AuthInitializer({ children }: { children: ReactNode }) {
  const { initializeAuth } = useAuthStore();
  
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // if(initializing){
  //     return <Loading/>
  // }
  return <>{children}</>;
}
