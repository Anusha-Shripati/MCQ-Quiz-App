import { create } from 'zustand';
import { Module, Permissions } from '@/types/common.types';
import Cookies from 'js-cookie';
import { api, isAxiosError } from '@/lib/api';
import { platformAdminEndpoint } from '@/lib/endpoint';

interface PlatformAdmin {
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

interface PlatformAuthState {
  platformAdmin: PlatformAdmin | null;
  tenantType: 'PLATFORM';
  initializing: boolean;
  loading: boolean;
  error?: string | null;
  permissions: Record<string, Permissions> | null;
  
  login: (credentials: { email: string; password: string }) => Promise<void>;
  initializeAuth: () => void;
  logout: () => void;
  setPermissions: (permissions: Record<string, Permissions> | null, admin: PlatformAdmin | null) => Promise<void>;
  setPlatformAdmin: (admin: PlatformAdmin | null) => void;
  isAuthenticated: () => boolean;
  
  // Permission checkers
  hasPermissionTenantEdit: () => boolean;
  hasPermissionPlanEdit: () => boolean;
  hasPermissionAdminEdit: () => boolean;
  hasPermissionAnalyticsRead: () => boolean;
}

export const usePlatformAuthStore = create<PlatformAuthState>((set, get) => ({
  platformAdmin: null,
  tenantType: 'PLATFORM',
  initializing: true,
  loading: false,
  permissions: null,
  
  login: async ({ email, password }: { email: string; password: string }) => {
    console.log('1. Login function called');
    set({ loading: true });
    try {
      console.log('2. Making API call to:', platformAdminEndpoint.LOGIN);
      const response = await api.post(platformAdminEndpoint.LOGIN, { email, password });
      console.log('3. API response:', response);
      
      if (response.success) {
        console.log('4. Login successful');
        const permissions = response.data?.role?.role_permissions?.reduce(
          (obj: Record<string, Permissions>, pr: Omit<Permissions, 'module'> & { module: Module }) => {
            obj[pr.module?.name] = {
              can_edit: pr.can_edit,
              can_read: pr.can_read,
            };
            return obj;
          },
          {}
        );
        
        set({ platformAdmin: response.data, loading: false, error: null, permissions });
        localStorage.setItem('platformAdmin', JSON.stringify(response.data));
        document.cookie = `platformToken=${response.data.token}; path=/;`;
        document.cookie = `platformRole=${response.data?.role?.name}; path=/;`;
        document.cookie = `platformPermissions=${encodeURIComponent(JSON.stringify(permissions))}; path=/;`;
        
        return response.data;
      }
    } catch (error) {
      console.log('5. Error caught:', error);
      set({ error: 'Login failed', loading: false, permissions: null });
      if (isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Invalid credentials';
        console.log('6. Throwing error:', errorMessage);
        throw new Error(errorMessage);
      }
      throw new Error('An unexpected error occurred');
    }
  },
  
  setPermissions: async (permissions: Record<string, Permissions> | null, admin: PlatformAdmin | null) => {
    set({ permissions, platformAdmin: admin });
  },
  
  setPlatformAdmin: (admin: PlatformAdmin | null) => {
    set({ platformAdmin: admin });
    if (admin) {
      localStorage.setItem('platformAdmin', JSON.stringify(admin));
    }
  },
  
  initializeAuth: () => {
    const storedAdmin = localStorage.getItem('platformAdmin');
    if (storedAdmin) {
      try {
        set({ platformAdmin: JSON.parse(storedAdmin) });
      } catch (error) {
        console.error('Error parsing stored platform admin:', error);
        localStorage.removeItem('platformAdmin');
        set({ platformAdmin: null });
      }
    } else {
      document.cookie = 'platformToken=; path=/;';
      document.cookie = 'platformRole=; path=/;';
      document.cookie = 'platformPermissions=; path=/;';
    }
    set({ initializing: false });
  },
  
  logout: () => {
    localStorage.removeItem('platformAdmin');
    document.cookie = 'platformToken=; path=/;';
    document.cookie = 'platformRole=; path=/;';
    document.cookie = 'platformPermissions=; path=/;';
    set({ platformAdmin: null, loading: false, permissions: null });
  },
  
  isAuthenticated: () => {
    const storedAdmin = localStorage.getItem('platformAdmin');
    if (!storedAdmin) return false;
    try {
      const admin = JSON.parse(storedAdmin);
      const token = Cookies.get('platformToken');
      return !!admin && !!token;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      localStorage.removeItem('platformAdmin');
      return false;
    }
  },
  
  hasPermissionTenantEdit: (): boolean => {
    const { permissions } = get();
    if (!permissions) return false;
    return !!permissions.tenants && permissions.tenants.can_edit === true;
  },
  
  hasPermissionPlanEdit: (): boolean => {
    const { permissions } = get();
    if (!permissions) return false;
    return !!permissions.plans && permissions.plans.can_edit === true;
  },
  
  hasPermissionAdminEdit: (): boolean => {
    const { permissions } = get();
    if (!permissions) return false;
    return !!permissions.admins && permissions.admins.can_edit === true;
  },
  
  hasPermissionAnalyticsRead: (): boolean => {
    const { permissions } = get();
    if (!permissions) return false;
    return !!permissions.analytics && permissions.analytics.can_read === true;
  },
}));
