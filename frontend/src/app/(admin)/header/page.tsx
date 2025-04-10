import React from "react";
import UserAvatar from "../../../components/common/user-avatar";
import { ThemeToggle } from "../../../components/common/theme-toggle";

export const Header = () => {
  return (
    <div className="px-6 position: sticky top-3 z-20">
      <div
        className={`flex flex-row-reverse items-center justify-start p-4 rounded-lg dark:bg-[#334155] bg-[#ffffff] shadow-md mb-2 w-full gap-6 `}
      >
        <UserAvatar />
        <ThemeToggle />
      </div>
    </div>
  );
};
