
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
  createEdit: boolean;
  view: boolean;
  delete: boolean
}
export interface Roles {
  name: string,
  permissions: Record<string, Permissions>
}