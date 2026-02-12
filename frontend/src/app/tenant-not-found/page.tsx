'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Ban, Clock, XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function TenantNotFound() {
  const [hostname, setHostname] = useState('');
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'TENANT_NOT_FOUND';

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  const errorConfig = {
    TENANT_NOT_FOUND: {
      icon: AlertCircle,
      title: 'Organization Not Found',
      message: "The organization you're trying to access doesn't exist.",
      color: 'red',
    },
    TENANT_SUSPENDED: {
      icon: Ban,
      title: 'Account Suspended',
      message: 'This organization has been suspended. Please contact support.',
      color: 'orange',
    },
    TENANT_EXPIRED: {
      icon: Clock,
      title: 'Subscription Expired',
      message: 'This organization\'s subscription has expired. Please renew to continue.',
      color: 'yellow',
    },
    TENANT_CANCELLED: {
      icon: XCircle,
      title: 'Account Cancelled',
      message: 'This organization account has been cancelled.',
      color: 'gray',
    },
    INVALID_DOMAIN: {
      icon: AlertCircle,
      title: 'Invalid Domain',
      message: 'The domain you\'re trying to access is not valid. Please check the URL.',
      color: 'red',
    },
  };

  const config = errorConfig[error as keyof typeof errorConfig] || errorConfig.TENANT_NOT_FOUND;
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className={`rounded-full bg-${config.color}-100 dark:bg-${config.color}-900/20 p-4`}>
            <Icon className={`w-12 h-12 text-${config.color}-600 dark:text-${config.color}-400`} />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {config.title}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {config.message}
        </p>
        
        {hostname && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Requested URL:
            </p>
            <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
              {hostname}
            </p>
          </div>
        )}
        
        {error === 'TENANT_NOT_FOUND' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please check:
            </p>
            <ul className="text-sm text-left text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>The URL is spelled correctly</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Your organization is active</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You have the correct subdomain</span>
              </li>
            </ul>
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help?{' '}
            <a 
              href="mailto:support@lr-mcq.com" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
