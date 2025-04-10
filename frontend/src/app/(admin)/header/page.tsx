import React from "react";
import UserAvatar from "../../../components/common/user-avatar";
import { ThemeToggle } from "../../../components/common/theme-toggle";
import { useTheme } from "next-themes";

export const Header = () => {
  const { theme } = useTheme();
  const backgroundColor = theme === "dark" ? "bg-[#334155]" : "bg-[#f8fafc]";

  return (
    <div
      className={`flex flex-row-reverse items-center justify-start p-4 rounded-lg mt-3 ${backgroundColor} shadow-md mb-2 w-full gap-6 position: sticky top-3 z-10`}
    >
      <UserAvatar />
      <ThemeToggle />
    </div>
  );
};
