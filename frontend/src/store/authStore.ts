import { create } from "zustand";
import api from "@/components/Axios";

interface User {
  email: string;
  password: string;
}

interface AuthState {
  user: User | null;
  initializing: boolean;
  loading: boolean;
  error?: string | null;
  success?: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  initializeAuth: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initializing: true,
  loading: false,

  login: async ({ email, password }: { email: string; password: string }) => {
    set({ loading: true });
    try {
      const response = await api({
        url: "http://localhost:3001/api/v1/user/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: { email, password },
      });

      set({ user: response.data.data, loading: false, error: null });
      localStorage.setItem("user", JSON.stringify(response.data.data));
      document.cookie = `token=${response.data.token}; path=/;`;

      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed";
      set({ error: errorMessage, loading: false });

      throw new Error(errorMessage);
    }
  },
  initializeAuth: () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        set({ user: JSON.parse(storedUser) });
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user"); // Remove invalid data
        set({ user: null });
      }
    }
    set({ initializing: false });
  },
  logout: () => {
    localStorage.removeItem("user"); // Remove entire user object
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    set({ user: null, loading: false });
  },
}));
