"use client";

import { Button } from '@/components/ui/form/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User2Icon } from 'lucide-react';
import { usePlatformAuthStore } from '@/store/platformAuthStore';

const PlatformUserAvatar = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const { platformAdmin, logout } = usePlatformAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/platform-auth/login';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`w-full text-base relative h-10 flex ${isCollapsed ? 'justify-center' : 'justify-start'} items-center gap-4 p-3 rounded-lg transition-colors text-white/90 hover:bg-white/10 hover:text-white`}
        >
          <span className="h-5 w-5">
            <User2Icon className="w-[30px] h-[30px]" />
          </span>
          {!isCollapsed && <span>{platformAdmin?.name}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-40 flex flex-col space-y-1 p-2 bg-white dark:bg-primary rounded-md shadow-md dark:shadow-lg"
      >
        <DropdownMenuItem className="flex items-center space-x-2 p-2 justify-center rounded-md hover:bg-gray-100 dark:hover:bg-secondary">
          <div>
            <p className="text-md">{platformAdmin?.name}</p>
            <p className="text-sm text-gray-500">{platformAdmin?.role?.name}</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center space-x-2 p-2 justify-start rounded-md hover:bg-gray-100 dark:hover:bg-secondary cursor-pointer"
        >
          <LogOut className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          <span className="text-gray-900 dark:text-gray-200">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PlatformUserAvatar;
