import Answer from '@/components/result/result-view'
import { Metadata } from 'next';
import React from 'react'


export const metadata: Metadata = {
  title: 'Result',
};
function ResultView() {
  return (
    <Answer/>
  )
}

export default ResultView