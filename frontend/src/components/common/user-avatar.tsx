import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

const UserAvatar = ({ className }: { className?: string }) => {
  const { user } = useAuthStore();
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleProfileNavigate = () => {
    router.push("/profile");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={`flex items-center rounded-sm cursor-pointer gap-3 ${className}`}
        >
          <Avatar>
            <AvatarImage
              src="https://avatars.githubusercontent.com/u/47379519?v=4"
              className="w-10 h-10"
            />
            <AvatarFallback>US</AvatarFallback>
          </Avatar>

          <div>
            <p className="text-md">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.role?.name}</p>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="w-48 flex flex-col space-y-1 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md dark:shadow-lg"
      >
        <DropdownMenuItem
          onClick={handleProfileNavigate}
          className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
        >
          <Settings className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          <span className="text-gray-900 dark:text-gray-200">Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
        >
          <LogOut className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          <span className="text-gray-900 dark:text-gray-200">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAvatar;
