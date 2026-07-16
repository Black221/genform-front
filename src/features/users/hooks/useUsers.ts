import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, type InviteUserPayload } from '../api/usersApi';
import type { UserRole } from '@/shared/types';

const KEYS = {
  users: (params?: object) => ['users', params] as const,
  communes: () => ['communes'] as const,
};

export function useUsers(params?: { communeId?: string; role?: UserRole }) {
  return useQuery({
    queryKey: KEYS.users(params),
    queryFn: () => usersApi.list(params),
    staleTime: 30_000,
  });
}

export function useCommunes() {
  return useQuery({
    queryKey: KEYS.communes(),
    queryFn: usersApi.listCommunes,
    staleTime: 5 * 60_000,
  });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteUserPayload) => usersApi.invite(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      usersApi.updateRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useAssignCommunes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, communeIds }: { id: string; communeIds: string[] }) =>
      usersApi.assignCommunes(id, communeIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useToggleActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? usersApi.activate(id) : usersApi.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
