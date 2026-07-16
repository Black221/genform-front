import { apiClient } from '@/shared/lib/apiClient';
import type { User, UserRole, Commune } from '@/shared/types';

export type UserStatus = 'ACTIVE' | 'INVITED' | 'DISABLED';

export interface InviteUserPayload {
  email: string;
  role: UserRole;
  displayName?: string;
  communeIds?: string[];
}

export const usersApi = {
  list: (params?: { communeId?: string; role?: UserRole }) =>
    apiClient.get<User[]>('/users', { params }).then((r) => r.data),

  getUser: (id: string) =>
    apiClient.get<User>(`/users/${id}`).then((r) => r.data),

  invite: (payload: InviteUserPayload) =>
    apiClient.post<User>('/users/invite', payload).then((r) => r.data),

  // Backend: PUT /users/{id}/role
  updateRole: (id: string, role: UserRole) =>
    apiClient.put<void>(`/users/${id}/role`, { role }).then((r) => r.data),

  assignCommunes: (id: string, communeIds: string[]) =>
    apiClient.put<void>(`/users/${id}/communes`, { communeIds }).then((r) => r.data),

  // Backend: PUT /users/{id}/status  { status: 'ACTIVE' | 'INVITED' | 'DISABLED' }
  setStatus: (id: string, status: UserStatus) =>
    apiClient.put<void>(`/users/${id}/status`, { status }).then((r) => r.data),

  activate: (id: string) => usersApi.setStatus(id, 'ACTIVE'),
  deactivate: (id: string) => usersApi.setStatus(id, 'DISABLED'),

  listCommunes: () =>
    apiClient.get<Commune[]>('/communes').then((r) => r.data),

  createCommune: (name: string, code?: string) =>
    apiClient.post<Commune>('/communes', { name, code }).then((r) => r.data),
};
