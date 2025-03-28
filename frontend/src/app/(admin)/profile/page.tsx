"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/form/button";
import ProfilePictureUpload from "@/components/profile/ProfilePictureUpload";
import { FormField } from "@/components/common/form-field";

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

  const {
    register: registerUserInfo,
    handleSubmit: handleUserInfoSubmit,
    formState: { errors: userInfoErrors },
    reset:userReset
  } = useForm({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      userName: "LogicRays",
      email: "hello@iclrays.com",
    },
  });

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
  const handleEditAndClose=()=>{
    if(isEditing){
      userReset()
    }
    setIsEditing((prv)=>!prv)
  }

  return (
    <div className="max-w-4xl mx-auto p-7 bg-white dark:bg-gray-700 m-4 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-8 dark:text-white">Profile</h1>

      <ProfilePictureUpload />

      <div className="space-y-4 mb-4 mt-4">
        <div className="mb-1 flex justify-end">
          <Button
            onClick={handleEditAndClose}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
            variant="ghost"
          >
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>
        <form onSubmit={handleUserInfoSubmit(onSaveUserInfo)}>
          <div className="pb-4 dark:border-gray-700">
            <FormField
              label='User Name'
              {...registerUserInfo("userName")}
              className="w-full mt-2 dark:bg-gray-800 dark:text-white"
              error={userInfoErrors.userName?.message}
              disabled={!isEditing}
            />
          </div>

          <div className="pb-2 dark:border-gray-700">
            <FormField
              label="Email"
              {...registerUserInfo("email")}
              className="w-full mt-2 dark:bg-gray-800 dark:text-white"
              disabled={!isEditing}
            />
            {userInfoErrors.email && (
              <p className="text-red-500 text-sm mt-1">
                {userInfoErrors.email.message}
              </p>
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

      <div>
        <h2 className="text-xl font-semibold mb-6 dark:text-white">
          Change Password
        </h2>
        <form
          className="space-y-4"
          onSubmit={handlePasswordSubmit(onChangePassword)}
        >
          <div>
            <FormField
              type="password"
              label="Old Password"
              {...registerPassword("oldPassword")}
              className="w-full dark:bg-gray-800 dark:text-white"
              error={passwordErrors.oldPassword?.message}
              disabled={!isEditing}
            />
          </div>

          <div>
            <FormField
              label='New Password'
              type="password"
              {...registerPassword("newPassword")}
              className="w-full dark:bg-gray-800 dark:text-white"
              disabled={!isEditing}
              error={passwordErrors.newPassword?.message}
            />
          </div>

          <div>
            <FormField
              type="password"
              label="Re-New Password"
              {...registerPassword("reNewPassword")}
              className="w-full dark:bg-gray-800 dark:text-white"
              disabled={!isEditing}
              error={passwordErrors.reNewPassword?.message}
            />
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
