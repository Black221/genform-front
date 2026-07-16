import { apiClient } from '@/shared/lib/apiClient';
import type { Form, FormSummary, FormAccess, FormVersion, Template } from '@/shared/types';

export interface SaveAsTemplatePayload {
  name: string;
  description?: string;
  category?: string;
  isPublic: boolean;
}

export interface CreateFormPayload {
  title: string;
  description?: string;
  templateId?: string;
  presentation?: string;
  communeId?: string;
  category?: string;
  access?: FormAccess;
  geotagOnSubmit?: boolean;
  openAt?: string;
  closeAt?: string;
  maxResponses?: number;
  sections?: unknown[];
  questions?: unknown[];
  contentBlocks?: unknown[];
  theme?: Record<string, unknown>;
  cover?: Record<string, unknown>;
  ending?: Record<string, unknown>;
}

export interface FormListParams {
  communeId?: string;
  category?: string;
  status?: string;
  archived?: boolean;
}

export const formsApi = {
  list: (params?: FormListParams) =>
    apiClient.get<FormSummary[]>('/forms', { params }).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Form>(`/forms/${id}`).then((r) => r.data),

  create: (payload: CreateFormPayload) =>
    apiClient.post<Form>('/forms', payload).then((r) => r.data),

  update: (id: string, payload: Partial<CreateFormPayload>) =>
    apiClient.put<Form>(`/forms/${id}`, payload).then((r) => r.data),

  publish: (id: string) =>
    apiClient.post<Form>(`/forms/${id}/publish`).then((r) => r.data),

  deactivate: (id: string) =>
    apiClient.post<Form>(`/forms/${id}/deactivate`).then((r) => r.data),

  close: (id: string) =>
    apiClient.post<Form>(`/forms/${id}/close`).then((r) => r.data),

  duplicate: (id: string) =>
    apiClient.post<Form>(`/forms/${id}/duplicate`).then((r) => r.data),

  archive: (id: string) =>
    apiClient.post<Form>(`/forms/${id}/archive`).then((r) => r.data),

  unarchive: (id: string) =>
    apiClient.post<Form>(`/forms/${id}/unarchive`).then((r) => r.data),

  /** UC-T4 — snapshot du schéma courant en template personnel. */
  saveAsTemplate: (id: string, payload: SaveAsTemplatePayload) =>
    apiClient.post<Template>(`/forms/${id}/save-as-template`, payload).then((r) => r.data),

  getVersions: (id: string) =>
    apiClient.get<FormVersion[]>(`/forms/${id}/versions`).then((r) => r.data),

  getVersion: (id: string, version: number) =>
    apiClient.get<FormVersion>(`/forms/${id}/versions/${version}`).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/forms/${id}`),

  exportCsv: (id: string) =>
    apiClient.get(`/forms/${id}/export`, { responseType: 'blob' }).then((r) => r.data),
};
