import { create } from 'zustand';
import { Module, Permissions } from '@/types/common.types';
import Cookies from 'js-cookie';

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
    set({ loading: true });
    try {
      // TODO: Replace with actual platform API endpoint when backend is ready
      // const response = await api.post('/platform/auth/login', { email, password });
      
      // Mock response for now
      const mockResponse = {
        success: true,
        data: {
          id: '1',
          name: 'Platform Admin',
          email,
          password: '',
          role: {
            id: '1',
            name: 'Super Admin',
            role_permissions: [
              { module: { name: 'tenants' }, can_edit: true, can_read: true },
              { module: { name: 'plans' }, can_edit: true, can_read: true },
              { module: { name: 'admins' }, can_edit: true, can_read: true },
              { module: { name: 'analytics' }, can_edit: false, can_read: true },
            ],
          },
          token: 'mock-platform-token',
        },
      };
      
      if (mockResponse.success) {
        const permissions = mockResponse.data?.role?.role_permissions?.reduce(
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
        
        set({ platformAdmin: mockResponse.data, loading: false, error: null, permissions });
        localStorage.setItem('platformAdmin', JSON.stringify(mockResponse.data));
        document.cookie = `platformToken=${mockResponse.data.token}; path=/;`;
        document.cookie = `platformRole=${mockResponse.data?.role?.name}; path=/;`;
        document.cookie = `platformPermissions=${encodeURIComponent(JSON.stringify(permissions))}; path=/;`;
      }
    } catch (error) {
      const errorMessage = 'Login failed';
      set({ error: errorMessage, loading: false, permissions: null });
      throw new Error(errorMessage);
    }
  },
  
  setPermissions: async (permissions: Record<string, Permissions> | null, admin: PlatformAdmin | null) => {
    set({ permissions, platformAdmin: admin });
  },
  
  setPlatformAdmin: (admin: PlatformAdmin | null) => {
    set({ platformAdmin: admin });
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
