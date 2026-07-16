import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/shared/lib/apiClient';
import { preloadFormsForObserver } from '@/features/offline/syncEngine';
import type { AuthResponse, Commune, UserRole } from '@/shared/types';

interface AuthState {
  token: string | null;
  userId: string | null;
  email: string | null;
  role: UserRole;
  communes: Commune[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

function applyAuth(set: (s: Partial<AuthState>) => void, data: AuthResponse) {
  localStorage.setItem('token', data.token);
  const communes = data.communes ?? [];
  set({ token: data.token, userId: data.userId, email: data.email, role: data.role ?? 'OBSERVER', communes, isAuthenticated: true });
  preloadFormsForObserver(communes.map((c) => c.id)).catch(() => {});
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      email: null,
      role: 'OBSERVER' as UserRole,
      communes: [],
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
        applyAuth(set, data);
      },

      register: async (email, password) => {
        const { data } = await apiClient.post<AuthResponse>('/auth/register', { email, password });
        applyAuth(set, data);
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, userId: null, email: null, role: 'OBSERVER', communes: [], isAuthenticated: false });
      },
    }),
    {
      name: 'auth-store',
      partialize: (s) => ({
        token: s.token,
        userId: s.userId,
        email: s.email,
        role: s.role,
        communes: s.communes,
        isAuthenticated: s.isAuthenticated,
      }),
    },
  ),
);
