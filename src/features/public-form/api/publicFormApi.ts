import axios from 'axios';
import type { PublicForm } from '@/shared/types';

const publicClient = axios.create({ baseURL: '/' });

export interface FileUploadEntry {
  questionId: string;
  file: File;
}

export interface GeoData {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  locationSource: 'GPS' | 'MANUAL';
  communeId?: string;
}

export const publicFormApi = {
  getById: (id: string) =>
    publicClient.get<PublicForm>(`/api/v1/public/forms/${id}`).then((r) => r.data),

  getBySlug: (slug: string) =>
    publicClient.get<PublicForm>(`/api/v1/public/forms/slug/${slug}`).then((r) => r.data),

  /**
   * Soumet le formulaire. Si des fichiers sont fournis, envoie en multipart
   * (part "submission" = JSON, parts "file" = fichiers avec questionId encodé dans le nom).
   * Sinon envoie en JSON pur.
   * La géolocalisation (lat/lng/accuracyMeters/locationSource) est incluse si fournie.
   */
  submit: (
    formId: string,
    answers: Record<string, unknown>,
    fileEntries: FileUploadEntry[] = [],
    geo?: GeoData,
  ): Promise<{ id: string }> => {
    const payload: Record<string, unknown> = {
      answers: Object.entries(answers).map(([questionId, value]) => ({ questionId, value })),
    };

    if (geo) {
      payload.lat = geo.lat;
      payload.lng = geo.lng;
      if (geo.accuracyMeters !== undefined) payload.accuracyMeters = geo.accuracyMeters;
      payload.locationSource = geo.locationSource;
      if (geo.communeId) payload.communeId = geo.communeId;
    }

    if (fileEntries.length === 0) {
      return publicClient
        .post<{ id: string }>(`/api/v1/public/forms/${formId}/responses`, payload)
        .then((r) => r.data);
    }

    const formData = new FormData();
    formData.append(
      'submission',
      new Blob([JSON.stringify(payload)], { type: 'application/json' }),
    );
    for (const entry of fileEntries) {
      // Encode questionId dans le nom : "{questionId}|{nomFichier}"
      formData.append('file', entry.file, `${entry.questionId}|${entry.file.name}`);
    }

    return publicClient
      .post<{ id: string }>(`/api/v1/public/forms/${formId}/responses`, formData)
      .then((r) => r.data);
  },
};

