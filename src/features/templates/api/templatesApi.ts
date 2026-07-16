import { apiClient } from '@/shared/lib/apiClient';
import type { Form, Template, Section, Question, ContentBlock, TemplateCover, Ending, PresentationMode } from '@/shared/types';

export interface CreateTemplatePayload {
  name: string;
  description?: string;
  category?: string;
  previewImage?: string;
  presentation: PresentationMode;
  sections: Section[];
  questions: Question[];
  contentBlocks: ContentBlock[];
  cover: TemplateCover;
  ending: Ending;
  isPublic: boolean;
}

export type TemplateScope = 'system' | 'mine' | 'public';

export interface TemplateListParams {
  scope?: TemplateScope;
  category?: string;
  q?: string;
}

export const templatesApi = {
  list: (params?: TemplateListParams) =>
    apiClient.get<Template[]>('/templates', { params }).then((r) => r.data),
  get: (id: string) => apiClient.get<Template>(`/templates/${id}`).then((r) => r.data),
  create: (payload: CreateTemplatePayload) =>
    apiClient.post<Template>('/templates', payload).then((r) => r.data),
  update: (id: string, payload: Partial<CreateTemplatePayload>) =>
    apiClient.put<Template>(`/templates/${id}`, payload).then((r) => r.data),
  /** UC-T3 — crée un formulaire DRAFT pré-rempli depuis le template. */
  createForm: (id: string, payload?: { title?: string; themeId?: string }) =>
    apiClient.post<Form>(`/templates/${id}/create-form`, payload ?? {}).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/templates/${id}`),
};
