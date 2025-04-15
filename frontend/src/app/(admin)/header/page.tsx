import React from "react";
import UserAvatar from "../../../components/common/user-avatar";
import { ThemeToggle } from "../../../components/common/theme-toggle";

export const Header = () => {
  return (
    <div className="z-20 w-full sticky top-0">
      <div
        className={`flex flex-row-reverse items-center justify-start p-3 dark:bg-[#1f2937] bg-[#ffffff] w-full gap-3 `}
      >
        <UserAvatar />
        <ThemeToggle />
      </div>
    </div>
  );
};
