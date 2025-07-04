import ProfilePage from '@/components/profile/profile-page'
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: 'Profile',
};
function Profile() {
  return (
    <ProfilePage/>
  )
}

export default Profile