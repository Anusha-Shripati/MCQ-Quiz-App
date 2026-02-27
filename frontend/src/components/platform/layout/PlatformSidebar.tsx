'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Building2, CreditCard, Users, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/form/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';
import ImageLinks from '@/app/assets/images/image-links';
import PlatformUserAvatar from './PlatformUserAvatar';
import { PlatformThemeToggle } from '../common/PlatformThemeToggle';
import { usePlatformAuthStore } from '@/store/platformAuthStore';
import '@/styles/platform.css';

const navigation = [
  { name: 'Dashboard', href: '/platform/dashboard', icon: LayoutDashboard, permission: null },
  { name: 'Tenants', href: '/platform/tenants', icon: Building2, permission: 'tenants' },
  { name: 'Plans', href: '/platform/plans', icon: CreditCard, permission: 'plans' },
  { name: 'Admins', href: '/platform/admins', icon: Users, permission: 'admins' },
  { name: 'Roles', href: '/platform/roles', icon: Shield, permission: 'roles' },
];

export default function PlatformSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { permissions, platformAdmin } = usePlatformAuthStore();

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  return (
    <aside className={`platform-sidebar ${isCollapsed ? 'platform-sidebar-collapsed' : 'platform-sidebar-expanded'}`}>
      <div className="overflow-auto flex flex-row justify-center items-center h-full">
        <div className="w-[calc(100%-20px)] flex flex-col justify-between h-full pb-4 pt-4">
          <div className="space-y-4 flex-shrink-0">
            {/* Header */}
            <div className="flex items-center justify-center w-full pt-3 flex-shrink-0 pb-3">
              {isCollapsed ? (
                <div className="w-10 h-10 flex justify-center items-center">
                  <Image
                    alt="Logic Rays Logo"
                    src={ImageLinks.logicrays_logo_bg_white}
                    className="cursor-pointer"
                    width={40}
                    height={40}
                    onClick={() => router.push('/dashboard')}
                  />
                </div>
              ) : (
                <div className="w-[170px] h-[50px] flex justify-center items-center mx-auto">
                  <Image
                    alt="Logic Rays Logo"
                    src={ImageLinks.white_logo}
                    className="cursor-pointer"
                    width={170}
                    height={50}
                    onClick={() => router.push('/dashboard')}
                  />
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex flex-col justify-center">
              <nav className="flex-1 platform-sidebar-nav">
                {navigation.map((item) => {
                  // Check permissions - show if no permission required or if user has read access
                  if (item.permission && permissions && !permissions[item.permission]?.can_read) {
                    return null;
                  }

                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Tooltip key={item.name} delayDuration={0}>
                      <Link href={item.href} prefetch={true}>
                        {isCollapsed ? (
                          <>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                onMouseEnter={() => router.prefetch(item.href)}
                                className={`platform-sidebar-item justify-center ${isActive ? 'platform-sidebar-item-active' : ''}`}
                              >
                                <span className="h-5 w-5">
                                  <Icon className="platform-sidebar-icon" />
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" align="center">
                              {item.name}
                            </TooltipContent>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            onMouseEnter={() => router.prefetch(item.href)}
                            className={`platform-sidebar-item justify-start ${isActive ? 'platform-sidebar-item-active' : ''}`}
                          >
                            <span className="h-5 w-5">
                              <Icon className="platform-sidebar-icon" />
                            </span>
                            <span className="platform-sidebar-text">{item.name}</span>
                          </Button>
                        )}
                      </Link>
                    </Tooltip>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Footer */}
          <div className="platform-sidebar-footer">
            {/* Platform Name */}
            {!isCollapsed && (
              <div className="mb-4 pb-4 border-b border-white/10 w-full flex gap-4 p-3 rounded-lg">
                <Building2 size={20} color='white' />
                <p className="text-white text-base">Platform Admin</p>
              </div>
            )}

            {/* Theme Toggle */}
            <PlatformThemeToggle isCollapsed={isCollapsed} variant="sidebar" />

            {/* Profile with Logout */}
            <PlatformUserAvatar isCollapsed={isCollapsed} />

            {/* Expand Button - Only when collapsed */}
            {isCollapsed && (
              <Button
                onClick={toggleSidebar}
                variant="ghost"
                size="icon"
                className="text-slate-700 dark:text-white/90 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white rounded-lg w-10 h-10 transition-all duration-200"
              >
                <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </div>

        {/* Collapse Button (Expanded State) */}
        {!isCollapsed && (
          <div
            onClick={toggleSidebar}
            className="absolute bottom-4 -right-[13%] transform -translate-y-1/2 cursor-pointer -translate-x-2"
          >
            <Button
              variant="ghost"
              className="bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-full shadow-md flex items-center justify-center w-8 h-8 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronLeft size={14} />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
