import { create } from 'zustand';
import { Module, Permissions, UserData } from '@/types/common.types';
import { api, isAxiosError } from '@/lib/api';
import { userEndpoint } from '@/lib/endpoint';

interface User {
  id?: string;
  name: string;
  email: string;
  password: string;
  image?: string;
  role: {
    id: string;
    name: string;
    role_permissions: Permissions;
  };
  token: string;
}

interface AuthState {
  user: User | null;
  initializing: boolean;
  loading: boolean;
  error?: string | null;
  success?: boolean;
  userFilter: string;
  userList: UserData[];
  userCount: number;
  setUserListData: (count: number, list: UserData[]) => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  initializeAuth: () => void;
  logout: () => void;
  setUserFilter: (filter: string) => void;
  permissions: Record<string, Permissions> | null;
  paramsLoading: boolean;
  setParamsLoading: (loading: boolean) => void;
  setPermissions: (
    permissions: Record<string, Permissions> | null,
    user: User | null
  ) => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initializing: true,
  loading: false,
  userFilter: '',
  userList: [],
  userCount: 0,
  paramsLoading: true,
  permissions: null,
  setParamsLoading: (loading: boolean) => {
    set({ paramsLoading: loading });
  },
  setUser: (user: User | null) => {
    set({ user });
  },
  login: async ({ email, password }: { email: string; password: string }) => {
    set({ loading: true });
    try {
      const response = await api.post(userEndpoint.LOGIN, { email, password });
      if (response.success) {
        const permissions = response.data?.role?.role_permissions?.reduce(
          (
            obj: Record<string, Permissions>,
            pr: Omit<Permissions, 'module'> & { module: Module }
          ) => {
            obj[pr.module?.name] = {
              can_edit: pr.can_edit,
              can_read: pr.can_read,
            };
            return obj;
          },
          {}
        );
        set({ user: response.data, loading: false, error: null, permissions });
        localStorage.setItem('user', JSON.stringify(response.data));
        document.cookie = `token=${response.data.token}; path=/;`;
        document.cookie = `role=${response.data?.role?.name}; path=/;`;
        document.cookie = `permissions=${encodeURIComponent(JSON.stringify(permissions))}; path=/;`;

        return response.data;
      }
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Login failed';
        set({ error: errorMessage, loading: false, permissions: null });
        throw new Error(errorMessage);
      }
      set({
        error: 'An unexpected error occurred',
        loading: false,
        permissions: null,
      });
      throw error;
    }
  },
  setPermissions: async (permissions: Record<string, Permissions> | null, user: User | null) => {
    set({ permissions, user });
  },
  setUserFilter: (filter: string) => {
    set({ userFilter: filter });
  },
  setUserListData: (count: number, list: UserData[]) => {
    set({ userList: list, userCount: count });
  },
  initializeAuth: () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        set({ user: JSON.parse(storedUser) });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        set({ user: null });
      }
    } else {
      document.cookie = 'token=; path=/;';
      document.cookie = 'role=; path=/;';
      document.cookie = 'permissions=; path=/;';
    }
    set({ initializing: false });
  },
  logout: () => {
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/;';
    set({ user: null, loading: false });
  },
}));
