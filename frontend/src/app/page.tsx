import React from 'react'
import { Metadata } from 'next';
import LandingPage from '@/components/LandingPage/LandingPage';


export const metadata: Metadata = {
  title: 'LR-MCQ SaaS Platform',
};
function Home() {
  return <LandingPage/>
}

export default Home
