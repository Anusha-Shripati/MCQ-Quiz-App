"use client"

import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const instance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
})

instance.interceptors.request.use(
    (config) => {
        const token = Cookies.get("token");
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
        console.log(err);
        
        if (err.response.status === 401) {
            localStorage.clear()
            document.cookie = "token=; path=/;";
            router.push("/");
        } else {
            return Promise.reject(err)
        }
    }
)


export default instance

