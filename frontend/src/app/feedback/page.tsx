import FeedbackPage from '@/components/result/feedback-form';
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: 'Feedback',
};
export default function Feedback() {
  return <FeedbackPage/>
}
