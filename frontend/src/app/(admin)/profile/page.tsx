"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { Button } from "@/components/ui/form/button";
import ProfilePictureUpload from "@/components/profile/ProfilePictureUpload";

// Validation schemas using zod
const userInfoSchema = z.object({
  userName: z.string().min(1, "User Name is required"),
  email: z.string().email("Invalid email format"),
});

const passwordChangeSchema = z
  .object({
    oldPassword: z.string().min(1, "Old Password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    reNewPassword: z.string().min(1, "Re-New Password is required"),
  })
  .refine((data) => data.newPassword === data.reNewPassword, {
    message: "Passwords do not match",
    path: ["reNewPassword"],
  });

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  // React Hook Form for User Info
  const {
    register: registerUserInfo,
    handleSubmit: handleUserInfoSubmit,
    formState: { errors: userInfoErrors },
  } = useForm({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      userName: "LogicRays",
      email: "hello@iclrays.com",
    },
  });

  // React Hook Form for Password Change
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      reNewPassword: "",
    },
  });

  // Handlers
  const onSaveUserInfo = (data: { userName: string; email: string }) => {
    console.log("User Info Saved:", data);
    setIsEditing(false);
  };

  const onChangePassword = (data: {
    oldPassword: string;
    newPassword: string;
    reNewPassword: string;
  }) => {
    console.log("Password Changed:", data);
  };

  return (
    <div className="max-w-4xl mx-auto p-7 bg-white dark:bg-gray-700 m-4 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-8 dark:text-white">Profile</h1>

      {/* Profile Picture Section */}
      <ProfilePictureUpload />

      {/* User Info Section */}
      <div className="space-y-4 mb-4 mt-4">
        <div className="mb-1 flex justify-end">
          <Button
            onClick={() => setIsEditing((prev) => !prev)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
            variant="ghost"
          >
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>
        <form onSubmit={handleUserInfoSubmit(onSaveUserInfo)}>
          <div className="pb-4 dark:border-gray-700">
            <Label className="text-gray-600 dark:text-gray-300">
              User Name
            </Label>
            {isEditing ? (
              <>
                <Input
                  {...registerUserInfo("userName")}
                  className="w-full mt-2 dark:bg-gray-800 dark:text-white"
                />
                {userInfoErrors.userName && (
                  <p className="text-red-500 text-sm mt-1">
                    {userInfoErrors.userName.message}
                  </p>
                )}
              </>
            ) : (
              <Input
                {...registerUserInfo("userName")}
                disabled
                className="w-full mt-2 dark:bg-gray-800 dark:text-white"
              />
            )}
          </div>

          <div className="pb-2 dark:border-gray-700">
            <Label className="text-gray-600 dark:text-gray-300">Email</Label>
            {isEditing ? (
              <>
                <Input
                  {...registerUserInfo("email")}
                  className="w-full mt-2 dark:bg-gray-800 dark:text-white"
                />
                {userInfoErrors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {userInfoErrors.email.message}
                  </p>
                )}
              </>
            ) : (
              <Input
                {...registerUserInfo("email")}
                disabled
                className="w-full mt-2 dark:bg-gray-800 dark:text-white"
              />
            )}
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                Save
              </Button>
            </div>
          )}
        </form>
      </div>

      <hr className="mb-4" />

      {/* Change Password Section */}
      <div>
        <h2 className="text-xl font-semibold mb-6 dark:text-white">
          Change Password
        </h2>
        <form
          className="space-y-4"
          onSubmit={handlePasswordSubmit(onChangePassword)}
        >
          <div>
            <Label className="block text-gray-700 dark:text-gray-300 mb-2">
              Old Password
            </Label>
            <Input
              type="password"
              {...registerPassword("oldPassword")}
              className="w-full dark:bg-gray-800 dark:text-white"
              disabled={!isEditing}
            />
            {passwordErrors.oldPassword && (
              <p className="text-red-500 text-sm mt-1">
                {passwordErrors.oldPassword.message}
              </p>
            )}
          </div>

          <div>
            <Label className="block text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </Label>
            <Input
              type="password"
              {...registerPassword("newPassword")}
              className="w-full dark:bg-gray-800 dark:text-white"
              disabled={!isEditing}
            />
            {passwordErrors.newPassword && (
              <p className="text-red-500 text-sm mt-1">
                {passwordErrors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <Label className="block text-gray-700 dark:text-gray-300 mb-2">
              Re-New Password
            </Label>
            <Input
              type="password"
              {...registerPassword("reNewPassword")}
              className="w-full dark:bg-gray-800 dark:text-white"
              disabled={!isEditing}
            />
            {passwordErrors.reNewPassword && (
              <p className="text-red-500 text-sm mt-1">
                {passwordErrors.reNewPassword.message}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
