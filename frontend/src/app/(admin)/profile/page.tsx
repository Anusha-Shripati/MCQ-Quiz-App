"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { Button } from "@/components/ui/form/button";
import ProfilePictureUpload from "@/components/profile/ProfilePictureUpload";

// Helper functions
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password: string) => password.length >= 8;

// Reusable Input Field Component
const ValidatedInput = ({
  label,
  type = "text",
  value,
  onChange,
  error,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) => (
  <div>
    <Label className="block text-gray-700 dark:text-gray-300 mb-2">{label}</Label>
    <Input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full dark:bg-gray-800 dark:text-white"
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default function Profile() {
  // State for user info
  const [userName, setUserName] = useState("LogicRays");
  const [email, setEmail] = useState("hello@iclrays.com");
  const [isEditing, setIsEditing] = useState(false);

  // State for password fields
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    reNewPassword: "",
  });

  // Validation states
  const [errors, setErrors] = useState({
    userName: "",
    email: "",
    oldPassword: "",
    newPassword: "",
    reNewPassword: "",
  });

  const [isPasswordFormValid, setIsPasswordFormValid] = useState(false);

  // Handlers for user info validation
  const validateUserInfo = () => {
    const newErrors = { userName: "", email: "" };
    let isValid = true;

    if (!userName.trim()) {
      newErrors.userName = "User Name is required";
      isValid = false;
    }

    if (!isValidEmail(email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleSave = () => {
    if (validateUserInfo()) {
      setIsEditing(false);
      // Add logic to save the user info
    }
  };

  // Handlers for password validation
  const validatePasswordForm = () => {
    const newErrors = { oldPassword: "", newPassword: "", reNewPassword: "" };
    let isValid = true;

    if (!passwords.oldPassword.trim()) {
      newErrors.oldPassword = "Old Password is required";
      isValid = false;
    }

    if (!isValidPassword(passwords.newPassword)) {
      newErrors.newPassword = "Password must be at least 8 characters";
      isValid = false;
    }

    if (passwords.newPassword !== passwords.reNewPassword) {
      newErrors.reNewPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePasswordForm()) {
      console.log("Password changed successfully");
      // Add logic to save the new password
    }
  };

  // Update password form validity
  useEffect(() => {
    setIsPasswordFormValid(
      passwords.oldPassword.trim().length > 0 &&
        isValidPassword(passwords.newPassword) &&
        passwords.reNewPassword.trim().length > 0 &&
        passwords.newPassword === passwords.reNewPassword
    );
  }, [passwords]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-700 m-4 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-8 dark:text-white">Profile</h1>

      {/* Profile Picture Section */}
      <ProfilePictureUpload />

      {/* User Info Section */}
      <div className="space-y-4 mb-4 mt-4">
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
            <ValidatedInput
              label="User Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              error={errors.userName}
            />
          ) : (
            <div className="font-medium mt-2 dark:text-white">{userName}</div>
          )}
        </div>

        <div className="pb-2 dark:border-gray-700">
          <Label className="text-gray-600 dark:text-gray-300">Email</Label>
          {isEditing ? (
            <ValidatedInput
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
          ) : (
            <div className="font-medium mt-2 dark:text-white">{email}</div>
          )}
        </div>
      </div>

      <hr className="mb-4" />

      {/* Change Password Section */}
      <div>
        <h2 className="text-xl font-semibold mb-6 dark:text-white">Change Password</h2>
        <form className="space-y-4" onSubmit={handlePasswordChange}>
          <ValidatedInput
            label="Old Password"
            type="password"
            value={passwords.oldPassword}
            onChange={(e) =>
              setPasswords((prev) => ({ ...prev, oldPassword: e.target.value }))
            }
            error={errors.oldPassword}
          />
          <ValidatedInput
            label="New Password"
            type="password"
            value={passwords.newPassword}
            onChange={(e) =>
              setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))
            }
            error={errors.newPassword}
          />
          <ValidatedInput
            label="Re-New Password"
            type="password"
            value={passwords.reNewPassword}
            onChange={(e) =>
              setPasswords((prev) => ({ ...prev, reNewPassword: e.target.value }))
            }
            error={errors.reNewPassword}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              disabled={!isPasswordFormValid}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}