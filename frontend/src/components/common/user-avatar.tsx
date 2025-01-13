import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserAvatar = ({
  isCollapsed = false,
  className,
}: {
  isCollapsed?: boolean;
  className?: string;
}) => {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Avatar>
        <AvatarImage
          src="https://avatars.githubusercontent.com/u/47379519?v=4"
          className="w-10 h-10"
        />
        <AvatarFallback>US</AvatarFallback>
      </Avatar>
      {!isCollapsed && (
        <div>
          <p className="font-semibold">John Doe</p>
          <p className="text-sm text-gray-500">Developer</p>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;

