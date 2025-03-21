import { useState } from "react";
import Image from "next/image";
import { Camera, User2Icon } from "lucide-react"; // Camera icon

const ProfilePictureUpload = () => {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-24 h-24">
      {/* Profile Image / Placeholder */}
      {profilePicture ? (
        <Image
          src={profilePicture}
          alt="Profile"
          width={96}
          height={96}
          className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
        />
      ) : (
        <div className="w-24 h-24 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <span className="text-gray-400 dark:text-gray-500 text-xl font-bold"><User2Icon/></span> {/* Default icon */}
        </div>
      )}

      {/* Camera Icon Overlay */}
      <label className="absolute bottom-0 right-0 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center cursor-pointer border-2 border-white dark:border-gray-900 shadow-lg">
        <Camera className="w-5 h-5 text-white" />
        <input
          type="file"
          accept="image/*"
          onChange={handleProfilePictureChange}
          className="hidden"
        />
      </label>
    </div>
  );
};

export default ProfilePictureUpload;