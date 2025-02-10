"use client"
import Link from "next/link";
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Button } from "@/components/ui/button";
import { loginUser } from '@/store/features/authSlice';

export default function Home() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      // Force full page reload to sync middleware
      window.location.href = '/dashboard';
    } catch (err) {
      // Error handled by Redux
      throw err;
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-700 to-gray-900 h-screen w-screen flex flex-col items-center justify-center">
    
    <div className="text-6xl font-bold text-white mb-8">MCQ APP</div>

    <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-96">
      <h2 className="text-2xl font-bold mb-6 text-center dark:text-black">Admin Login</h2>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 mb-2" htmlFor="password">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
      >
        {loading ? "Logging in..." : "Login"}
      </Button>

      <div className="mt-4 text-center">
        <Link href="/forgot-password" className="text-blue-500 hover:underline">
          Forgot Password?
        </Link>
      </div>
    </form>

    <div className="mt-8 text-center">
      <p className="text-white">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-blue-300 hover:underline">
          Contact Admin
        </Link>
      </p>
    </div>
  </div>
  );
}