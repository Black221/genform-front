import { apiClient } from '@/shared/lib/apiClient';
export type { FormCategory } from '@/shared/lib/formCategories';
export { CATEGORY_LABEL, CATEGORY_COLOR } from '@/shared/lib/formCategories';

export type ObservationStatus = 'PENDING' | 'VALIDATED' | 'REJECTED';

export interface MapFilters {
  formId?: string;
  communeId?: string;
  category?: string;
  status?: ObservationStatus;
  from?: string;
  to?: string;
  limit?: number;
}

/** Properties d'un polygone de commune (FeatureCollection /map/communes). */
export interface CommuneProperties {
  id: string;
  name: string;
  code?: string;
  color?: string;
  bbox?: [number, number, number, number];
  centroid?: [number, number];
  responseCount: number;
}

/** Properties d'un point observation (FeatureCollection /map/observations). */
export interface ObservationProperties {
  id: string;
  formId: string;
  formTitle?: string;
  communeId?: string;
  category?: string;
  status?: ObservationStatus;
  hasMedia: boolean;
  submittedAt: string;
}

export interface CommuneAggregate {
  communeId: string;
  name: string;
  total: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  last7Days: number;
  topForms: { formId: string; title: string; count: number }[];
}

export interface LabeledAnswer {
  questionId: string;
  label: string;
  type: string | null;
  value: unknown;
}

export interface ObservationMedia {
  id: string;
  questionId: string | null;
  filename: string | null;
  contentType: string | null;
  type: string | null;
  downloadUrl: string;
}

export interface ObservationDetail {
  id: string;
  formId: string;
  formTitle: string;
  category: string | null;
  status: ObservationStatus;
  submittedAt: string;
  reviewedAt: string | null;
  reviewComment: string | null;
  location: { lat: number; lng: number } | null;
  accuracyM: number | null;
  locationSource: 'GPS' | 'MANUAL' | null;
  communeId: string | null;
  communeName: string | null;
  answers: LabeledAnswer[];
  media: ObservationMedia[];
}

/** Une photo d'observation pour la galerie (liée à sa réponse). */
export interface GalleryItem {
  mediaId: string;
  downloadUrl: string;
  contentType: string | null;
  filename: string | null;
  responseId: string;
  formId: string;
  formTitle: string | null;
  category: string | null;
  status: ObservationStatus | null;
  communeId: string | null;
  communeName: string | null;
  submittedAt: string;
}

export const mapApi = {
  getCommunes: (): Promise<GeoJSON.FeatureCollection> =>
    apiClient.get('/map/communes').then((r) => r.data),

  getGallery: (filters?: MapFilters): Promise<GalleryItem[]> =>
    apiClient.get('/map/gallery', { params: filters }).then((r) => r.data),

  getCommuneAggregate: (communeId: string): Promise<CommuneAggregate> =>
    apiClient.get(`/map/communes/${communeId}/aggregate`).then((r) => r.data),

  getObservations: (filters?: MapFilters): Promise<GeoJSON.FeatureCollection> =>
    apiClient.get('/map/observations', { params: filters }).then((r) => r.data),

  getObservationDetail: (observationId: string): Promise<ObservationDetail> =>
    apiClient.get(`/map/observations/${observationId}`).then((r) => r.data),

  getFormObservations: (
    formId: string,
    filters?: MapFilters,
  ): Promise<GeoJSON.FeatureCollection> =>
    apiClient.get(`/forms/${formId}/map`, { params: filters }).then((r) => r.data),

  validateObservation: (formId: string, responseId: string) =>
    apiClient.post(`/forms/${formId}/responses/${responseId}/validate`).then((r) => r.data),

  rejectObservation: (formId: string, responseId: string, comment: string) =>
    apiClient.post(`/forms/${formId}/responses/${responseId}/reject`, { comment }).then((r) => r.data),
};
