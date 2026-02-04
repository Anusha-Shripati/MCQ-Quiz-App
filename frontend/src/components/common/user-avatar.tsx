"use client";

import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/authStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { LogOut, Settings, User2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { userEndpoint } from '@/lib/endpoint';
import Image from 'next/image';
import { Button } from '@/components/ui/form/button';

const UserAvatar = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const { user } = useAuthStore();
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async() => {
    try{
      await api.get(userEndpoint.LOGOUT)
      logout();
      router.push('/');
    }catch(error){
      toast.error(isAxiosError(error)? (error?.response?.data?.message || 'Failed'):'Failed')
    }
  };

  const handleProfileNavigate = () => {
    router.push('/profile');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`w-full text-base relative h-12 flex ${isCollapsed ? 'justify-center' : 'justify-start'} items-center gap-4 p-3 rounded-lg transition-colors hover:bg-secondary hover:text-secondary-foreground`}
        >
          <span className="h-5 w-5">
            {user?.image ? (
              <Image
                src={`${((process.env.NEXT_PUBLIC_IMGAE_PREFIX || '') + (user?.image || ''))}`}
                className="w-[30px] h-[30px] rounded-full"
                alt="User Avatar"
                width={30}
                height={30}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/fallback.png';
                }}
              />
            ) : (
              <User2Icon className="w-[30px] h-[30px]" />
            )}
          </span>
          {!isCollapsed && <span>{user?.name}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-40 flex flex-col space-y-1 p-2 bg-white dark:bg-primary rounded-md shadow-md dark:shadow-lg"
      >
        <DropdownMenuItem
          // onClick={handleProfileNavigate}
          className="flex items-center space-x-2 p-2 justify-center rounded-md hover:bg-gray-100 dark:hover:bg-secondary"
        >
          <div>
            <p className="text-md">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.role?.name}</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleProfileNavigate}
          className="flex items-center justify-start space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-secondary cursor-pointer"
        >
          <Settings className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          <span className="text-gray-900 dark:text-gray-200">Profile</span>
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

export default UserAvatar;
