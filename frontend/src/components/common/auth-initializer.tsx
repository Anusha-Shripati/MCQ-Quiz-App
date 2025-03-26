"use client"
import { useAuthStore } from '@/store/authStore';
import React, { ReactNode, useEffect } from 'react'

export default function AuthInitializer({ children }: { children: ReactNode }) {

    const { initializeAuth } = useAuthStore();
    useEffect(() => {
        initializeAuth();
    }, []);

    return <>{children}</>;
}