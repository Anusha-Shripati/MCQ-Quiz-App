'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter as useNavRouter } from 'next/navigation';
import { FiHome, FiFileText, FiHelpCircle, FiUsers } from 'react-icons/fi';
import { Button } from '@/components/ui/form/button';
import ImageLinks from '@/app/assets/images/image-links';
import { FaUserAlt, FaUserSecret } from 'react-icons/fa';
import { useAuthStore } from '@/store/authStore';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import { Module, Permissions } from '@/types/common.types';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import UserAvatar from './user-avatar';
import { ThemeToggle } from './theme-toggle';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const { setPermissions, user, setParamsLoading } = useAuthStore();

  const router = useRouter();

  const getPermission = async (url: string) => {

    if (user?.id) {
      try {

        const response = await fetcher(url);
        if (response.success) {
          const permissions = response.data?.role?.role_permissions?.reduce(
            (
              obj: Record<string, Permissions>,
              pr: Omit<Permissions, 'module'> & { module: Module }
            ) => {
              obj[pr.module?.name] = {
                can_edit: pr.can_edit,
                can_read: pr.can_read,
              };
              return obj;
            },
            {}
          );
          setPermissions(permissions, response.data);
          document.cookie = `role=${response.data?.role?.name}; path=/;`;
          document.cookie = `permissions=${encodeURIComponent(JSON.stringify(permissions))}; path=/;`;
          return permissions;
        }

      } catch (error) {
        console.error('Error fetching permissions:', error);
        setPermissions(null, null);
        // document.cookie = `role=; path=/;`;
        // document.cookie = `permissions=; path=/;`;
        // document.cookie = 'token=; path=/;';
        // router.push('/');
        return null;
      }
    }
  };

  const { data: permissions, isLoading } = useSWR(`/user/${user?.id}`, getPermission, {
    // refreshInterval: 30000,
  });
  const pathname = usePathname();
  useEffect(() => {
    setParamsLoading(false);
  }, [pathname])

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prv) => !prv);
  }, []);

  return (
    <aside
      ref={sidebarRef}
      className={`${
        isCollapsed ? 'w-16' : 'w-56'
      } bg-primary text-primary-foreground sticky top-0 left-0 h-screen z-50 transition-all duration-300 relative shadow-sm`}
    >
      <div className="overflow-auto flex flex-row justify-center items-center h-full bg-primary">
        <div className="w-[calc(100%-20px)] flex flex-col justify-between h-full pb-4 pt-4">
          <div className="space-y-4 flex-shrink-0">
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
                <div className="w-[170px] h-[50px] flex justify-center items-center">
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

            {!isLoading && permissions && (
              <div className="flex flex-col justify-center">
                <nav className="flex-1 flex flex-col gap-3">
                  <NavItem
                    href="/dashboard"
                    icon={<FiHome size={30} />}
                    label="Dashboard"
                    isCollapsed={isCollapsed}
                    isActive={pathname.includes('dashboard')}
                  />

                  {permissions?.questions?.can_read && (
                    <NavItem
                      href="/questions"
                      icon={<FiHelpCircle size={30} />}
                      label="Questions"
                      isCollapsed={isCollapsed}
                      isActive={pathname.includes('questions')}
                    />
                  )}
                  {permissions?.assessments?.can_read && (
                    <NavItem
                      href="/assessments"
                      icon={<FiFileText size={30} />}
                      label="Assessment"
                      isCollapsed={isCollapsed}
                      isActive={pathname.includes('assessments')}
                    />
                  )}
                  {permissions?.candidates?.can_read && (
                    <NavItem
                      href="/candidates"
                      icon={<FiUsers size={30} />}
                      label="Candidates"
                      isCollapsed={isCollapsed}
                      isActive={pathname.includes('candidates')}
                    />
                  )}
                  {permissions?.results?.can_read && (
                    <NavItem
                      href="/results"
                      icon={<Layers size={30} />}
                      label="Results"
                      isCollapsed={isCollapsed}
                      isActive={pathname.includes('results')}
                    />
                  )}
                  {permissions?.users?.can_read && (
                    <NavItem
                      href="/users"
                      icon={<FaUserAlt size={30} />}
                      label="Users"
                      isCollapsed={isCollapsed}
                      isActive={pathname.includes('users')}
                    />
                  )}
                  {user?.role?.name == 'Super Admin' && (
                    <NavItem
                      href="/roles"
                      icon={<FaUserSecret size={30} />}
                      label="Roles"
                      isCollapsed={isCollapsed}
                      isActive={pathname.includes('roles')}
                    />
                  )}
                </nav>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center gap-2 mt-4 flex-shrink-0">
            <ThemeToggle isCollapsed={isCollapsed} />
            <UserAvatar isCollapsed={isCollapsed} />
            {isCollapsed && (
              <Button
                onClick={toggleSidebar}
                variant="ghost"
                size="icon"
                className="hover:bg-secondary hover:text-secondary-foreground rounded-lg w-10 h-10 transition-all duration-200"
              >
                <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </div>
        {!isCollapsed && (
          <div
            onClick={toggleSidebar}
            className="absolute bottom-4 -right-[13%] transform -translate-y-1/2 cursor-pointer -translate-x-2"
          >
            <Button
              variant="ghost"
              className="bg-background text-foreground border border-border rounded-full shadow-md flex items-center justify-center w-8 h-8"
            >
              <ChevronLeft size={14} />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}

function NavItem({
  href,
  icon,
  label,
  isCollapsed,
  isActive,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  isActive: boolean;
}) {
  const router = useNavRouter();

  // Prefetch the route data when mouse hovers over the navigation item
  const handleMouseEnter = useCallback(() => {
    router.prefetch(href);
  }, [router, href]);

  return (
    <Tooltip delayDuration={0}>
      <Link href={href} prefetch={true}>
        {isCollapsed ? (
          <>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onMouseEnter={handleMouseEnter}
                className={`w-full text-base relative h-8 flex justify-center items-center gap-4 p-3 rounded-lg transition-colors ${isActive
                  ? 'bg-secondary text-secondary-foreground'
                  : 'hover:bg-secondary hover:text-secondary-foreground'
                  }`}
              >
                <span className="h-5 w-5">{icon}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              {label}
            </TooltipContent>
          </>
        ) : (
          <Button
            variant="ghost"
            onMouseEnter={handleMouseEnter}
            className={`w-full text-base relative h-10 flex justify-start items-center gap-4 p-3 rounded-lg transition-colors ${isActive
              ? 'bg-secondary text-secondary-foreground'
              : 'hover:bg-secondary hover:text-secondary-foreground'
              }`}
          >
            <span className="h-5 w-5">{icon}</span>
            <span>{label}</span>
          </Button>
        )}
      </Link>
    </Tooltip>
  );
}
