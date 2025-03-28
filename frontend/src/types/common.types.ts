
export type DateRange = {
  from: Date | undefined;
  to?: Date | undefined; // Optional
};

export interface StatusOption {
  value: string;
  label: string;
}

export interface User{
  id:number;
  name:number
}