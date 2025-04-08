
export type DateRange = {
  from: Date | undefined;
  to?: Date | undefined; // Optional
};

export interface StatusOption {
  value: string;
  label: string;
}

export interface User {
  id: number;
  name?: number;
  email?: number;
}

export interface Permissions {
  id?:string;
  can_edit: boolean;
  can_read: boolean;
  module_id?: string;
  module?: Module | null
}
export interface Module{
  id?:string;
  name:string;
}
export interface Role {
  id?: string
  name: string,
  permissions: Permissions[]
}


export interface UserData {
  id: string,
  email: string,
  name: string,
  role: {
    id: string
    name: string
  } | null
}

export interface RoleData {
  id: string
  name: string,
  role_permissions: Permissions[]
}