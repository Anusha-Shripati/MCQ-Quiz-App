"use client"

import axios from "axios";
import Cookies from "js-cookie";
import { NextRouter } from "next/router";

// Simple cache implementation
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache: Record<string, { data: unknown; timestamp: number }> = {};

const instance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
})

// Add request caching for GET requests
instance.interceptors.request.use(
    async (config) => {
        const token = Cookies.get("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Only cache GET requests
        if (config.method?.toLowerCase() === 'get' && config.url) {
            const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`;
            const cachedResponse = cache[cacheKey];
            
            // If we have a valid cached response, use it
            if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_DURATION) {
                // Return cached response
                return {
                    ...config,
                    adapter: () => {
                        return Promise.resolve({
                            data: cachedResponse.data,
                            status: 200,
                            statusText: 'OK',
                            headers: {},
                            config,
                            request: {}
                        });
                    }
                };
            }
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response caching
instance.interceptors.response.use(
    (response) => {
        // Only cache GET requests
        if (response.config.method?.toLowerCase() === 'get' && response.config.url) {
            const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`;
            
            // Store the response in cache
            cache[cacheKey] = {
                data: response.data,
                timestamp: Date.now()
            };
        }
        return response;
    },
    (error) => Promise.reject(error)
);

export const setupResponseInterceptor = (router:NextRouter) => {
    instance.interceptors.response.use(
        (res) => res,
        (err) => {
            if (err.response?.status === 401) {
                if (typeof window !== "undefined") {
                    localStorage.clear();
                    document.cookie = "token=; path=/;";
                    router.push("/");
                }
            }
            return Promise.reject(err);
        }
    );
};


export default instance

