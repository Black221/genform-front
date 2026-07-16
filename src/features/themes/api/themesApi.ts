import { apiClient } from '@/shared/lib/apiClient';
import type { Theme } from '@/shared/types';
import type { AppTheme } from '@/design-system/tokens';

export interface CreateThemePayload {
  name: string;
  palette: AppTheme['palette'];
  typography: AppTheme['typography'];
  radius: AppTheme['radius'];
  layout: AppTheme['layout'];
  background: AppTheme['background'];
  isPublic: boolean;
}

export const themesApi = {
  list: () => apiClient.get<Theme[]>('/themes').then((r) => r.data),
  get: (id: string) => apiClient.get<Theme>(`/themes/${id}`).then((r) => r.data),
  create: (payload: CreateThemePayload) =>
    apiClient.post<Theme>('/themes', payload).then((r) => r.data),
  update: (id: string, payload: Partial<CreateThemePayload>) =>
    apiClient.put<Theme>(`/themes/${id}`, payload).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/themes/${id}`),
};
