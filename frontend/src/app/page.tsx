import Login from '@/components/common/login'
import React from 'react'
import { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'Admin Login',
};
function Home() {
  return <Login/>
}

export default Home
