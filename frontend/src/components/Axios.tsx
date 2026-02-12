'use client';

import axios from 'axios';
import Cookies from 'js-cookie';
import { extractSubdomain } from '@/lib/tenant-utils';

const instance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
});

instance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
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

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        document.cookie = 'token=; path=/;';
        window.location.href = '/';
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
