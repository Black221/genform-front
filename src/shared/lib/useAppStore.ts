import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStore {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      darkMode: false,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    }),
    { name: 'gen-form-app' },
  ),
);
