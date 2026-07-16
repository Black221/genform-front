import { apiClient } from '@/shared/lib/apiClient';
import type { FormResponse } from '@/shared/types';

export interface MediaItem {
  id: string;
  questionId: string | null;
  filename: string | null;
  contentType: string | null;
  type: string;
  downloadUrl: string;
}

export interface ResponseListParams {
  status?: string;
  communeId?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export interface ResponseListResult {
  content: FormResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const responsesApi = {
  list: (formId: string, params: ResponseListParams = {}): Promise<ResponseListResult> =>
    apiClient
      .get<ResponseListResult>(`/forms/${formId}/responses`, { params })
      .then((r) => r.data),

  get: (formId: string, responseId: string): Promise<FormResponse> =>
    apiClient
      .get<FormResponse>(`/forms/${formId}/responses/${responseId}`)
      .then((r) => r.data),

  getMedia: (formId: string, responseId: string): Promise<MediaItem[]> =>
    apiClient
      .get<MediaItem[]>(`/forms/${formId}/responses/${responseId}/media`)
      .then((r) => r.data),

  validate: (formId: string, responseId: string): Promise<void> =>
    apiClient
      .post(`/forms/${formId}/responses/${responseId}/validate`)
      .then(() => undefined),

  reject: (formId: string, responseId: string, comment: string): Promise<void> =>
    apiClient
      .post(`/forms/${formId}/responses/${responseId}/reject`, { comment })
      .then(() => undefined),

  delete: (formId: string, responseId: string): Promise<void> =>
    apiClient
      .delete(`/forms/${formId}/responses/${responseId}`)
      .then(() => undefined),

  export: (formId: string, format: 'csv' | 'geojson', params: Omit<ResponseListParams, 'page' | 'size'> = {}): Promise<Blob> =>
    apiClient
      .get(`/forms/${formId}/export`, { params: { format, ...params }, responseType: 'blob' })
      .then((r) => r.data as Blob),
};
