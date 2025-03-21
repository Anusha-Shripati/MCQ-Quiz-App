"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ProfilePictureUpload from "@/components/profile/ProfilePictureUpload";

export default function Profile() {
  const [userName, setUserName] = useState("LogicRays");
  const [email, setEmail] = useState("hello@iclrays.com");
  const [isEditing, setIsEditing] = useState(false);

  // Password fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [reNewPassword, setReNewPassword] = useState("");

  // Validation states
  const [userNameError, setUserNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [reNewPasswordError, setReNewPasswordError] = useState("");
  const [isPasswordFormValid, setIsPasswordFormValid] = useState(false);
  // Handle Save for User Info
  const handleSave = () => {
    // Validate User Name
    if (!userName.trim()) {
      setUserNameError("User Name is required");
      return;
    } else {
      setUserNameError("");
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
      return;
    } else {
      setEmailError("");
    }

    setIsEditing(false);
    // Add logic to save the user info
  };

  // Handle Save for Password Change
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Old Password
    if (!oldPassword.trim()) {
      setOldPasswordError("Old Password is required");
      return;
    } else {
      setOldPasswordError("");
    }

    // Validate New Password
    if (newPassword.length < 8) {
      setNewPasswordError("Password must be at least 8 characters");
      return;
    } else {
      setNewPasswordError("");
    }

    // Validate Re-New Password
    if (newPassword !== reNewPassword) {
      setReNewPasswordError("Passwords do not match");
      return;
    } else {
      setReNewPasswordError("");
    }

    // Add logic to save the new password
    console.log("Password changed successfully");
  };

    useEffect(() => {
      setIsPasswordFormValid(
        oldPassword.trim().length > 0 &&
        newPassword.trim().length >= 8 &&
        reNewPassword.trim().length > 0 &&
        newPassword === reNewPassword
      );
    }, [oldPassword, newPassword, reNewPassword]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-700 m-4 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-8 dark:text-white">Profile</h1>

      {/* Profile Picture Section */}
      <ProfilePictureUpload />

      {/* User Info Section */}
      <div className="space-y-4 mb-4 mt-4">
         {/* Single Edit / Save Button */}
         <div className="mb-1 flex justify-end">
          <Button
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
            variant="ghost"
          >
            {isEditing ? "Save" : "Edit"}
          </Button>
        </div>
        <div className="pb-4 dark:border-gray-700">
          <Label className="text-gray-600 dark:text-gray-300">User Name</Label>
          {isEditing ? (
            <>
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full mt-2 dark:bg-gray-800 dark:text-white"
              />
              {userNameError && <p className="text-red-500 text-sm mt-1">{userNameError}</p>}
            </>
          ) : (
            <div className="font-medium mt-2 dark:text-white">{userName}</div>
          )}
        </div>

        <div className="pb-2 dark:border-gray-700">
          <Label className="text-gray-600 dark:text-gray-300">Email</Label>
          {isEditing ? (
            <>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-2 dark:bg-gray-800 dark:text-white"
              />
              {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
            </>
          ) : (
            <div className="font-medium mt-2 dark:text-white">{email}</div>
          )}
        </div>
      </div>

      <hr className="mb-4"/>
      {/* Change Password Section */}
      <div>
        <h2 className="text-xl font-semibold mb-6 dark:text-white">Change Password</h2>
        <form className="space-y-4" onSubmit={handlePasswordChange}>
          <div>
            <Label className="block text-gray-700 dark:text-gray-300 mb-2">Old Password</Label>
            <Input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full dark:bg-gray-800 dark:text-white"
            />
            {oldPasswordError && <p className="text-red-500 text-sm mt-1">{oldPasswordError}</p>}
          </div>

          <div>
            <Label className="block text-gray-700 dark:text-gray-300 mb-2">New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full dark:bg-gray-800 dark:text-white"
            />
            {newPasswordError && <p className="text-red-500 text-sm mt-1">{newPasswordError}</p>}
          </div>

          <div>
            <Label className="block text-gray-700 dark:text-gray-300 mb-2">Re-New Password</Label>
            <Input
              type="password"
              value={reNewPassword}
              onChange={(e) => setReNewPassword(e.target.value)}
              className="w-full dark:bg-gray-800 dark:text-white"
            />
            {reNewPasswordError && <p className="text-red-500 text-sm mt-1">{reNewPasswordError}</p>}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              disabled={!isPasswordFormValid}  // Disable if validations fail
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}