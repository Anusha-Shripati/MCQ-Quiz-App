import { create } from 'zustand';

export interface PlanLimits {
  candidates: number;
  assessments: number;
  questions: number;
  storage_mb: number;
  api_calls: number;
}

export interface PlanFeatures {
  custom_branding: boolean;
  api_access: boolean;
  priority_support: boolean;
  advanced_analytics: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  limits: PlanLimits;
  features: PlanFeatures;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  _count?: {
    tenants: number;
  };
}

interface PlatformPlanStore {
  plans: Plan[];
  totalPlans: number;
  searchQuery: string;
  activeFilter: 'all' | 'active' | 'inactive';

  setPlans: (plans: Plan[], total: number) => void;
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: 'all' | 'active' | 'inactive') => void;
}

export const usePlatformPlanStore = create<PlatformPlanStore>((set) => ({
  plans: [],
  totalPlans: 0,
  searchQuery: '',
  activeFilter: 'all',

  setPlans: (plans, total) => set({ plans, totalPlans: total }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
}));
