"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { User } from "lucide-react"; // Import the user icon from lucide-react

export default function Profile() {
  const [userName, setUserName] = useState("LogicRays");
  const [email, setEmail] = useState("hello@iclrays.com");
  const [isEditingUserName, setIsEditingUserName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null); // State for profile picture
  const [isEditingProfilePicture, setIsEditingProfilePicture] = useState(false);

  const handleSaveUserName = () => {
    setIsEditingUserName(false);
    // Add logic to save the user name
  };

  const handleSaveEmail = () => {
    setIsEditingEmail(false);
    // Add logic to save the email
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result); // Set the image URL
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white m-4 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-8">Profile</h1>

      {/* Profile Picture Section */}
      <div className="flex items-center space-x-6 mb-12">
        <div className="relative">
          {profilePicture ? (
            <Image
              src={profilePicture}
              alt="Profile"
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-100">
              <User className="w-12 h-12 text-gray-400" /> {/* User icon */}
            </div>
          )}
          {isEditingProfilePicture && (
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          )}
        </div>
        <div>
          {isEditingProfilePicture ? (
            <Button
              onClick={() => setIsEditingProfilePicture(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save
            </Button>
          ) : (
            <Button
              onClick={() => setIsEditingProfilePicture(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* User Info Section */}
      <div className="space-y-6 mb-12">
        <div className="border-b pb-6">
          <div className="flex justify-between items-center mb-4">
            <Label className="text-gray-600">User Name</Label>
            {isEditingUserName ? (
              <Button
                onClick={handleSaveUserName}
                className="text-blue-600 hover:text-blue-800"
                variant="ghost"
              >
                Save
              </Button>
            ) : (
              <Button
                onClick={() => setIsEditingUserName(true)}
                className="text-blue-600 hover:text-blue-800"
                variant="ghost"
              >
                Edit
              </Button>
            )}
          </div>
          {isEditingUserName ? (
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full"
            />
          ) : (
            <div className="font-medium">{userName}</div>
          )}
        </div>

        <div className="border-b pb-6">
          <div className="flex justify-between items-center mb-4">
            <Label className="text-gray-600">Email</Label>
            {isEditingEmail ? (
              <Button
                onClick={handleSaveEmail}
                className="text-blue-600 hover:text-blue-800"
                variant="ghost"
              >
                Save
              </Button>
            ) : (
              <Button
                onClick={() => setIsEditingEmail(true)}
                className="text-blue-600 hover:text-blue-800"
                variant="ghost"
              >
                Edit
              </Button>
            )}
          </div>
          {isEditingEmail ? (
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          ) : (
            <div className="font-medium">{email}</div>
          )}
        </div>
      </div>

      {/* Change Password Section */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Change Password</h2>
        <form className="space-y-6">
          <div>
            <Label className="block text-gray-700 mb-2">Old Password</Label>
            <Input type="password" className="w-full" />
          </div>

          <div>
            <Label className="block text-gray-700 mb-2">New Password</Label>
            <Input type="password" className="w-full" />
          </div>

          <div>
            <Label className="block text-gray-700 mb-2">Re-New Password</Label>
            <Input type="password" className="w-full" />
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}