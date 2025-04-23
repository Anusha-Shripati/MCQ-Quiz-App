import { RoleData } from '@/types/common.types';
import { create } from 'zustand';

interface RoleStore {
  rolesFilter: string;
  rolesCount: number;
  rolesList: RoleData[];
  setRolesFilter: (filter: string) => void;
  setRolesListData: (count: number, list: RoleData[]) => void;
}

export const useRoleStore = create<RoleStore>((set) => ({
  rolesFilter: '',
  rolesCount: 0,
  rolesList: [],
  setRolesFilter: (filter: string) => {
    set({ rolesFilter: filter });
  },
  setRolesListData: (count: number, list: RoleData[]) => {
    set({ rolesList: list, rolesCount: count });
  },
}));
