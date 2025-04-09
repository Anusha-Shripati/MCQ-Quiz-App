import { Button } from "@/components/ui/form/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/authStore";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

// interface LogoutButtonProps {
//   onLogout: () => void;
//   isCollapsed: boolean;
// }

export default function LogoutButton() {
  const { logout } = useAuthStore();

  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="flex items-center justify-between w-full">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <LogOut className="h-5 w-5 text-gray-600 hover:text-gray-900" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Logout</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
