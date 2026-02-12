'use client';

import React from 'react';
// import UserAvatar from './user-avatar';
// import { ThemeToggle } from './theme-toggle';
import { useAuthStore } from '@/store/authStore';
import { Building2 } from 'lucide-react';

const HeaderPage = () => {
    const { tenant, tenantType } = useAuthStore();

    return (
        <div className="z-20 h-18 w-full sticky top-0 shadow-md">
            <div
                className={`flex items-center justify-between p-3 bg-background w-full gap-3`}
            >
                {/* Tenant Branding */}
                {tenantType === 'TENANT' && tenant?.slug && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 size={16} />
                        <span className="font-medium capitalize">{tenant.slug}</span>
                    </div>
                )}
                {tenantType === 'PLATFORM' && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 size={16} />
                        <span className="font-medium">Platform Admin</span>
                    </div>
                )}

                {/* Right Side Actions */}
                <div className="flex items-center gap-3 ml-auto">
                    {/* <ThemeToggle /> */}
                    {/* <UserAvatar /> */}
                </div>
            </div>
        </div>
    );
};
export default HeaderPage
