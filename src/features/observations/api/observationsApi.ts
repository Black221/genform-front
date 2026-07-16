import { apiClient } from '@/shared/lib/apiClient';
import { generateId } from '@/shared/lib/generateId';
import type { GeoState } from '../hooks/useGeolocation';

export interface SubmitObservationPayload {
  formId: string;
  answers: Record<string, unknown>;
  geo?: GeoState;
  clientId?: string;
}

export interface ObservationResponse {
  id: string;
  clientId: string;
}

export interface UploadTarget {
  key: string;
  uploadUrl: string;
}

export const observationsApi = {
  submit: (payload: SubmitObservationPayload): Promise<ObservationResponse> => {
    const clientId = payload.clientId ?? generateId();
    return apiClient
      .post<ObservationResponse>(`/public/forms/${payload.formId}/responses`, {
        answers: Object.entries(payload.answers).map(([questionId, value]) => ({
          questionId,
          value,
        })),
        meta: {},
        ...(payload.geo?.status === 'ok' && {
          lat: payload.geo.lat,
          lng: payload.geo.lng,
          accuracyMeters: payload.geo.accuracy,
          locationSource: payload.geo.source ?? 'GPS',
        }),
        clientId,
      })
      .then((r) => ({ ...r.data, clientId }));
  },

  getUploadUrl: (contentType: string) =>
    apiClient
      .post<UploadTarget>('/media/upload-url', { contentType })
      .then((r) => r.data),

  attachMedia: (responseId: string, key: string, contentType: string) =>
    apiClient.post('/media/attach', { responseId, key, contentType }),

  // ── Variantes publiques (capture anonyme, sans authentification) ──────────────
  getPublicUploadUrl: (contentType: string) =>
    apiClient
      .post<UploadTarget>('/public/media/upload-url', { contentType })
      .then((r) => r.data),

  attachPublicMedia: (responseId: string, key: string, contentType: string, filename?: string) =>
    apiClient.post('/public/media/attach', { responseId, key, contentType, filename }),

  uploadToStorage: (uploadUrl: string, blob: Blob, contentType: string) =>
    fetch(uploadUrl, {
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': contentType },
    }),
};
