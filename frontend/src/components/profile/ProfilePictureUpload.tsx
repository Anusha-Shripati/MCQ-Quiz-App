import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Camera, User2Icon } from 'lucide-react';
import { Input } from '../ui/form/input';
import { Button } from '../ui/form/button';
import { useProfileStore } from '@/store/profileStore';
import { api, isAxiosError } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { userEndpoint } from '@/lib/endpoint';

const ProfilePictureUpload = ({ imageUrl }: { imageUrl: string }) => {
  const [profilePicture, setProfilePicture] = useState<string | null>(imageUrl);

  useEffect(() => {
    setProfilePicture(imageUrl);
  }, [imageUrl])
  const { isEditing, setIsEditing } = useProfileStore();
  const { user, setUser } = useAuthStore()

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('Selected file:', file);
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.put(`${userEndpoint.UPLOAD_IMAGE}/${user?.id}`, formData);
        if (response.success) {
          setProfilePicture(response.data.path);
          if (user) {
            setUser({
              ...user,
              image: response.data.path,
            });
          }
          toast.success('Profile picture uploaded successfully!');
        }

      } catch (error) {
        if (isAxiosError(error)) {
          toast.error(error.response?.data?.message || 'Error uploading file');
        } else {
          toast.error('An unexpected error occurred');
        }
        console.error('Upload error:', error);
      }
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="relative w-24 h-24">
        {/* Display profile picture or placeholder */}
        {profilePicture ? (
          <Image
            src={profilePicture}
            alt="Profile"
            width={96}
            height={96}
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
          />
        ) : (
          <div
            className="w-24 h-24 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-100 dark:bg-gray-800"
            aria-label="Default profile picture"
          >
            <User2Icon className="text-gray-400 dark:text-gray-500 text-xl" />
          </div>
        )}

        {/* Camera icon overlay for uploading a new picture */}
        <label
          className="absolute bottom-0 right-0 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center cursor-pointer border-2 border-white dark:border-gray-900 shadow-lg"
          aria-label="Upload profile picture"
        >
          <Camera className="w-5 h-5 text-white" />
          <Input
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
            className="hidden"
          />
        </label>
      </div>

      <Button
        onClick={() => setIsEditing(!isEditing)}
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
        variant="ghost"
      >
        {isEditing ? 'Cancel' : 'Edit'}
      </Button>
    </div>
  );
};

export default ProfilePictureUpload;
