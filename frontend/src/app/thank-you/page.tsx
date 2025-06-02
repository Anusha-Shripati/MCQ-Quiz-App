'use client'
import { useExamStore } from '@/store/examStore';
import { CheckCircle } from 'lucide-react';
import { FC, useEffect } from 'react';

const ThankYouPage: FC = () => {
  const {cameraStreamRef} = useExamStore()
  useEffect(() => { 
    cameraStreamRef?.getTracks().forEach((track)=>{
      track.stop()
    },[])
  }, [])
  return<div className="relative flex items-center justify-center w-full min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 overflow-hidden" >
    <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-200 rounded-full filter blur-3xl opacity-40 animate-pulse"></div>
    <div className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] bg-blue-300 rounded-full filter blur-3xl opacity-40 animate-pulse"></div>
    <div className="relative bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-12 max-w-lg w-full text-center transition-transform duration-500 hover:scale-105">
      <div className="flex justify-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
      </div>
      <h1 className="text-5xl font-extrabold text-gray-800 mb-4 drop-shadow">Thank You!</h1>
      <p className="text-lg text-gray-700 leading-relaxed mb-6">
        Your quiz has been submitted successfully.<br />
        Our team will carefully review your responses and get back to you with the results shortly.<br />
        Thank you for your time and effort.
      </p>
      <p className="text-sm text-gray-500">
        We appreciate your participation and look forward to sharing the results with you soon.
      </p>
    </div>
  </div>
};

export default ThankYouPage;