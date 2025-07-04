import ResetPasswordPage from '@/components/user/reset-password'
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: 'Rest Password',
};
function ResetPassword() {
  return (
    <ResetPasswordPage/>
  )
}

export default ResetPassword