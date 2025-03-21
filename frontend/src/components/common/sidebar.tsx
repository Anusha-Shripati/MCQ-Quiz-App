"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Import usePathname
import {
  FiMenu,
  FiChevronLeft,
  FiHome,
  FiFileText,
  FiHelpCircle,
  FiUsers,
  FiSettings,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/common/user-avatar";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/features/authSlice";
import { FaUserAlt } from "react-icons/fa";


export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  // const { logout } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };
  
  return (
    <aside
      ref={sidebarRef}
      className={`${
        isCollapsed ? "w-16" : "w-60"
      } bg-primary text-primary-foreground sticky top-0 left-0 text-white h-screen flex flex-col justify-center items-center transition-all duration-300 border-r-2 border-r-gray-100 overflow-x-hidden`}
    >
      <div className="w-[calc(100%-20px)] space-y-4 h-full">
        <Button
          onClick={toggleSidebar}
          className="flex items-center justify-start w-full h-12 p-4 text-white hover:bg-gray-700 focus:outline-none"
        >
          {isCollapsed ? <FiMenu size={24} /> : <FiChevronLeft size={24} />}
        </Button>

        <div className="h-[90%] flex flex-col justify-between">
          <nav className="flex-1 flex flex-col gap-4">
            <NavItem
              href="/dashboard"
              icon={<FiHome size={30} />}
              label="Dashboard"
              isCollapsed={isCollapsed}
              isActive={pathname === "/dashboard"}
            />
            <NavItem
              href="/assessment"
              icon={<FiFileText size={30} />}
              label="Assessment"
              isCollapsed={isCollapsed}
              isActive={pathname === "/assessment"}
            />
            <NavItem
              href="/questions"
              icon={<FiHelpCircle size={30} />}
              label="Questions"
              isCollapsed={isCollapsed}
              isActive={pathname === "/questions"}
            />
            <NavItem
              href="/candidates"
              icon={<FiUsers size={30} />}
              label="Candidates"
              isCollapsed={isCollapsed}
              isActive={pathname === "/candidates"}
            />
            <NavItem
              href="/profile"
              icon={<FiSettings size={30} />}
              label="Profile"
              isCollapsed={isCollapsed}
              isActive={pathname === "/profile"}
            />
            <NavItem
              href="/users"
              icon={<FaUserAlt size={30} />}
              label="Users"
              isCollapsed={isCollapsed}
              isActive={pathname === "/users"}
            />
            <ThemeToggle />
          </nav>

          <div className="flex items-center justify-between w-full">
            <UserAvatar isCollapsed={isCollapsed} />
            {!isCollapsed && (
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
            )}
          </div>
        </div>
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
  return (
    <Link href={href} className="w-full">
      <Button
        className={`w-full text-base relative h-12 flex items-center justify-start gap-4 p-3 rounded-lg transition-colors ${
          isActive
            ? "bg-secondary text-secondary-foreground"
            : "hover:bg-secondary hover:text-secondary-foreground"
        }`}
      >
        <span className="h-5 w-5">{icon}</span>
        {!isCollapsed && <span>{label}</span>}
      </Button>
    </Link>
  );
}

