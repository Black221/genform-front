import { apiClient } from '@/shared/lib/apiClient';
import type { FormStatistics } from '@/shared/types';

export interface ObservatoryStats {
  totalObservations: number;
  publishedForms: number;
  activeObservers: number;
  byCommune: Record<string, number>;
  byCategory: Record<string, number>;
  recentSignalements: Array<{ id: string; formTitle: string; commune?: string; createdAt: string }>;
}

export const statisticsApi = {
  get: (formId: string) =>
    apiClient.get<FormStatistics>(`/forms/${formId}/statistics`).then((r) => r.data),
  exportCsv: (formId: string) =>
    apiClient.get(`/forms/${formId}/export`, { responseType: 'blob' }).then((r) => r.data as Blob),
  getObservatory: () =>
    apiClient.get<ObservatoryStats>('/statistics/observatory').then((r) => r.data),
};
