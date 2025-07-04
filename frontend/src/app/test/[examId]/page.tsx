import TestPage from '@/components/test/test-page'
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: 'Candidate Exam',
};
function Test() {
  return (
    <TestPage/>
  )
}

export default Test