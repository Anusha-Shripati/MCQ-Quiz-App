"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter as useNavRouter } from "next/navigation"; // Import useRouter for prefetching
import {
  FiMenu,
  FiChevronLeft,
  FiHome,
  FiFileText,
  FiHelpCircle,
  FiUsers,
} from "react-icons/fi";
import { Button } from "@/components/ui/form/button";
import LogicRaysImage from "../../app/assets/images/logicrays_logo-bg.png";
import { FaUserAlt, FaUserSecret } from "react-icons/fa";
import { useAuthStore } from "@/store/authStore";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Module, Permissions } from "@/types/common.types";
import { Avatar, AvatarImage } from "../ui/avatar";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const { setPermissions, user } = useAuthStore();

  const router = useRouter();

  const getPermission = async (url: string) => {
    if (user?.id) {
      const response = await fetcher(url);
      if (response.success) {
        const permissions = response.data?.role?.role_permissions?.reduce(
          (
            obj: Record<string, Permissions>,
            pr: Omit<Permissions, "module"> & { module: Module }
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
      } else {
        setPermissions(null, null);
        return null;
      }
    }
  };

  const { data: permissions, isLoading } = useSWR(
    `/user/${user?.id}`,
    getPermission,
    { refreshInterval: 30000 }
  );
  const pathname = usePathname();

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prv) => !prv);
  }, []);

  return (
    <aside
      ref={sidebarRef}
      className={`${
        isCollapsed ? "w-20" : "w-60"
      } bg-primary text-primary-foreground sticky top-0 left-0 text-white h-screen flex flex-col justify-center items-center transition-all duration-300 border-r-2 border-r-gray-100 overflow-auto`}
    >
      <div className="w-[calc(100%-20px)] space-y-4 h-full">
        <div className="flex items-center justify-between w-full h-[80px] p-2 text-white ">
          {!isCollapsed && (
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={LogicRaysImage.src}
                className="w-16 h-16 cursor-pointer"
                onClick={() => router.push("/dashboard")}
              />
            </Avatar>
          )}
          <div
            onClick={toggleSidebar}
            className="cursor-pointer hover:bg-gray-700 focus:outline-none flex justify-center items-center rounded-lg transition-colors duration-200 w-[40px] h-[40px]"
          >
            <span>
              {isCollapsed ? <FiMenu size={22} /> : <FiChevronLeft size={22} />}
            </span>
          </div>
        </div>

        {!isLoading && permissions && (
          <div className="flex flex-col justify-center">
            <nav className="flex-1 flex flex-col gap-4">
              <NavItem
                href="/dashboard"
                icon={<FiHome size={30} />}
                label="Dashboard"
                isCollapsed={isCollapsed}
                isActive={pathname === "/dashboard"}
              />
              {permissions?.assessments?.can_read && (
                <NavItem
                  href="/assessments"
                  icon={<FiFileText size={30} />}
                  label="Assessment"
                  isCollapsed={isCollapsed}
                  isActive={pathname === "/assessments"}
                />
              )}
              {permissions?.questions?.can_read && (
                <NavItem
                  href="/questions"
                  icon={<FiHelpCircle size={30} />}
                  label="Questions"
                  isCollapsed={isCollapsed}
                  isActive={pathname === "/questions"}
                />
              )}
              {permissions?.candidates?.can_read && (
                <NavItem
                  href="/candidates"
                  icon={<FiUsers size={30} />}
                  label="Candidates"
                  isCollapsed={isCollapsed}
                  isActive={pathname === "/candidates"}
                />
              )}
              {/* <NavItem
                href="/profile"
                icon={<FiSettings size={30} />}
                label="Profile"
                isCollapsed={isCollapsed}
                isActive={pathname === "/profile"}
              /> */}
              {!isCollapsed && (
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-gray-400"></div>
                  <span className="flex-shrink mx-4 text-gray-400">
                    Users Info
                  </span>
                  <div className="flex-grow border-t border-gray-400"></div>
                </div>
              )}
              {permissions?.users?.can_read && (
                <NavItem
                  href="/users"
                  icon={<FaUserAlt size={30} />}
                  label="Users"
                  isCollapsed={isCollapsed}
                  isActive={pathname === "/users"}
                />
              )}
              {user?.role?.name == "Super Admin" && (
                <NavItem
                  href="/roles"
                  icon={<FaUserSecret size={30} />}
                  label="Roles"
                  isCollapsed={isCollapsed}
                  isActive={pathname === "/roles"}
                />
              )}
            </nav>
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
    <Link href={href} className="w-full" prefetch={true}>
      <Button
        onMouseEnter={handleMouseEnter}
        className={`w-full text-base relative h-12 flex items-center justify-start gap-4 p-3 rounded-lg transition-colors ${isActive
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
