
export type DateRange = {
  from: Date | undefined;
  to?: Date | undefined; // Optional
};

export interface StatusOption {
  value: string;
  label: string;
}