'use client';

import { Shield, Clock } from 'lucide-react';

export default function PlatformAdmin() {
  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-4">
            <Shield className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Platform Admin Console
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          The platform administration interface is currently under development.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
            <Clock className="w-5 h-5 mr-2" />
            <span className="font-semibold">Coming Soon</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Phase 4 implementation in progress
          </p>
        </div>
        
        <div className="space-y-3 text-left">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Planned Features:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Tenant Management</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Subscription Plans</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Usage Analytics</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Platform Settings</span>
            </li>
          </ul>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Platform Admin • LR-MCQ SaaS
          </p>
        </div>
      </div>
    </div>
  );
}
