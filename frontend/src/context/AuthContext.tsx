"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  email: string;
  role: string;
  token: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Initialize user from localStorage
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");
    
    if (token && email && role) {
      setUser({ email, role, token });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("http://localhost:3005/api/v1/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.data.token) {
        // Store user data in localStorage
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("email", data.data.email);
        localStorage.setItem("role", data.data.role);
        document.cookie = `token=${data.data.token}; path=/; max-age=86400`;
        
        setUser({
          email: data.data.email,
          role: data.data.role,
          token: data.data.token
        });
        router.push("/dashboard");
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      throw new Error(error.message || "Login failed");
    }
  };

  const logout = () => {
    // Remove all user-related data
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);