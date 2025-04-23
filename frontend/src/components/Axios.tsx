'use client';

import axios from 'axios';
import Cookies from 'js-cookie';

const instance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
});

instance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    console.log(err.response?.status, 'err.response?.status');

    if (err.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        document.cookie = 'token=; path=/;';
        window.location.href = '/';
      }
    }
    return Promise.reject(err);
  }
);

export const candidateInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
});

export default instance;
