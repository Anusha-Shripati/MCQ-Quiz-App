'use client';
import React from 'react';
import { useAuthStore } from '../../store/authStore';

const UserMainHeader = () => {
  const { userCount } = useAuthStore();

  return (
    <div className="flex justify-between w-full">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        All Users ({userCount || 0})
      </h1>
    </div>
  );
};

export default UserMainHeader;
