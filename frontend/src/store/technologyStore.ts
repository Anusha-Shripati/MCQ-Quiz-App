import { create } from 'zustand';
import { fetchTechnologies, isAxiosError } from '@/lib/api';

interface Technology {
  id: string;
  name: string;
}

interface TechnologyState {
  technologies: Technology[];
  loading: boolean;
  error: string | null;
  fetchTechnologiesList: () => Promise<void>;
}

export const useTechnologyStore = create<TechnologyState>((set) => ({
  technologies: [],
  loading: false,
  error: null,
  fetchTechnologiesList: async () => {
    set({ loading: true });
    try {
      const data = await fetchTechnologies();
      set({ technologies: data?.list, loading: false, error: null });
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || "Failed to fetch technologies";
        set({ error: errorMessage, loading: false });
        throw new Error(errorMessage);
      }
      set({ error: 'Failed to fetch technologies', loading: false });
    }
  },
}));