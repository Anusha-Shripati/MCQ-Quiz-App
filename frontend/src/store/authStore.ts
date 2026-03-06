import { create } from 'zustand';
import { Module, Permissions, UserData } from '@/types/common.types';
import { api, isAxiosError } from '@/lib/api';
import { userEndpoint } from '@/lib/endpoint';
import Cookies from 'js-cookie';
import { getTenantContext } from '@/lib/tenant-utils';

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

interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan?: {
    id: string;
    name: string;
  };
}

interface AuthState {
  user: User | null;
  tenant: TenantInfo | null;
  tenantType: 'PLATFORM' | 'TENANT' | null;
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
  setTenant: (tenant: TenantInfo | null) => void;
  setTenantType: (type: 'PLATFORM' | 'TENANT' | null) => void;
  isAuthenticated: () => boolean;
  hasPermissionCandidateEdit: () => boolean;
  hasPermissionQuestionEdit: () => boolean;
  hasPermissionAssessmentEdit: () => boolean;
  hasPermissionUserEdit: () => boolean;
  hasPermissionResultEdit: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tenant: null,
  tenantType: null,
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
  setTenant: (tenant: TenantInfo | null) => {
    set({ tenant });
  },
  setTenantType: (type: 'PLATFORM' | 'TENANT' | null) => {
    set({ tenantType: type });
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
    // Extract tenant from current URL using tenant-utils
    if (typeof window !== 'undefined') {
      const tenantContext = getTenantContext(window.location.hostname);

      if (tenantContext.type === 'TENANT' && tenantContext.slug) {
        set({
          tenant: {
            id: '',
            name: '',
            slug: tenantContext.slug,
            status: '',
          },
          tenantType: 'TENANT',
        });
      } else if (tenantContext.type === 'PLATFORM') {
        set({ tenant: null, tenantType: 'PLATFORM' });
      }
    }

    // Initialize user from localStorage
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
  isAuthenticated: () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return false;
    try {
      const user = JSON.parse(storedUser);
      const token = Cookies.get('token');
      return !!user && !!token;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      localStorage.removeItem('user');
      return false;
    }
  },
  hasPermissionCandidateEdit: (): boolean => {
    const { permissions } = get();
    if (!permissions) return false;
    return !!permissions.candidates && permissions.candidates.can_edit === true;
  },

  hasPermissionQuestionEdit: (): boolean => {
    const { permissions } = get();
    if (!permissions) return false;
    return !!permissions.questions && permissions.questions.can_edit === true;
  },

  hasPermissionAssessmentEdit: (): boolean => {
    const { permissions } = get();
    if (!permissions) return false;
    return !!permissions.assessments && permissions.assessments.can_edit === true;
  },

  hasPermissionUserEdit: (): boolean => {
    const { permissions } = get();
    if (!permissions) return false;
    return !!permissions.users && permissions.users.can_edit === true;
  },

  hasPermissionResultEdit: (): boolean => {
    const { permissions } = get();
    if (!permissions) return false;
    return !!permissions.results && permissions.results.can_edit === true;
  },
}));
