
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
  name: number
}

export interface Permissions {
  // createEdit: boolean;
  edit: boolean;
  view: boolean;
  // delete: boolean
}
export interface Roles {
  id?: string
  name: string,
  permissions: Record<string, Permissions>
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