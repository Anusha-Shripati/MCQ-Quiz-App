'use client';

import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { extractSubdomain } from '@/lib/tenant-utils';

const instance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
});

instance.interceptors.request.use(
  (config) => {
    // Check if platform or tenant based on subdomain
    if (typeof window !== 'undefined') {
      const tenantSlug = extractSubdomain(window.location.hostname);
      
      if (tenantSlug === 'admin') {
        // Platform request
        const platformToken = Cookies.get('platformToken');
        if (platformToken) {
          config.headers.Authorization = `Bearer ${platformToken}`;
        }
        config.headers['x-tenant-type'] = 'PLATFORM';
      } else {
        // Tenant request
        const token = Cookies.get('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        if (tenantSlug) {
          config.headers['x-tenant-slug'] = tenantSlug;
          config.headers['x-tenant-type'] = 'TENANT';
        }
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const tenantSlug = extractSubdomain(window.location.hostname);
        
        if (tenantSlug === 'admin') {
          // Platform 401 - redirect to platform login
          localStorage.removeItem('platformAdmin');
          document.cookie = 'platformToken=; path=/;';
          window.location.href = '/platform-auth/login';
        } else {
          // Tenant 401 - redirect to tenant login
          localStorage.clear();
          document.cookie = 'token=; path=/;';
          window.location.href = '/';
        }
      }
    }
    
    // Backend permission codes are nested under `data.error` in the response payload.
    if (err.response?.status === 403) {
      const responseData = err.response.data;
      const errorData = responseData?.data ?? responseData;
      const errorCode = errorData?.error ?? responseData?.error;
      
      if (
        errorCode === 'ACCESS_DENIED' ||
        errorCode === 'ACTION_DENIED' ||
        errorCode === 'ROLE_ACCESS_DENIED'
      ) {
        const message =
          responseData?.message ||
          'Access denied: You don\'t have permission to perform this action.';

        if (typeof window !== 'undefined') {
          toast.error(message, {
            duration: 5000,
            style: {
              background: '#ef4444',
              color: '#fff',
              fontWeight: '500',
            },
          });
        }
        
        // Don't redirect, just show the error message
        return Promise.reject(err);
      }
    }
    
    // Handle tenant errors
    if (err.response?.data?.error) {
      const errorCode = err.response.data.error;
      
      // Redirect to tenant not found page for tenant errors
      if (
        errorCode === 'TENANT_NOT_FOUND' ||
        errorCode === 'TENANT_SUSPENDED' ||
        errorCode === 'TENANT_EXPIRED' ||
        errorCode === 'TENANT_CANCELLED'
      ) {
        if (typeof window !== 'undefined') {
          // Pass error code as query parameter
          window.location.href = `/tenant-not-found?error=${errorCode}`;
        }
      }
    }
    
    return Promise.reject(err);
  }
);

export const candidateInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
});

// Add tenant headers to candidate instance
candidateInstance.interceptors.request.use(
  (config) => {
    // Extract tenant from current URL using tenant-utils
    if (typeof window !== 'undefined') {
      const tenantSlug = extractSubdomain(window.location.hostname);
      
      if (tenantSlug && tenantSlug !== 'admin') {
        config.headers['x-tenant-slug'] = tenantSlug;
        config.headers['x-tenant-type'] = 'TENANT';
      } else if (tenantSlug === 'admin') {
        config.headers['x-tenant-type'] = 'PLATFORM';
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
