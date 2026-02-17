import PlatformProfilePage from '@/components/platform/profile/platform-profile-page';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Profile',
};

function PlatformProfile() {
  return <PlatformProfilePage />;
}

export default PlatformProfile;
