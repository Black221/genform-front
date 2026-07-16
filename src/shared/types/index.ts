import type { AppTheme } from '@/design-system/tokens';

export type { AppTheme };

export type QuestionType =
  | 'TEXT'
  | 'LONG_TEXT'
  | 'SINGLE_CHOICE'
  | 'MULTI_CHOICE'
  | 'SCALE'
  | 'NUMBER'
  | 'DATE'
  | 'LOCATION'
  | 'PHOTO'
  | 'FILE';

export type FormAccess = 'PUBLIC' | 'OBSERVERS';

export type ContentBlockType = 'HEADING' | 'TEXT' | 'IMAGE' | 'DIVIDER' | 'EMBED';
export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'INACTIVE' | 'CLOSED';
export type PresentationMode = 'single-question' | 'paginated' | 'onepage';

export interface QuestionConfig {
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  format?: string;
  conditions?: Array<{ questionId: string; operator: string; value: unknown }>;
}

export interface Question {
  id: string;
  sectionId?: string;
  label: string;
  type: QuestionType;
  required: boolean;
  position: number;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  format?: string;
  conditions?: Array<{ questionId: string; operator: string; value: unknown }>;
}

export interface Section {
  id: string;
  title?: string;
  description?: string;
  position: number;
}

export interface ContentBlock {
  id: string;
  sectionId?: string;
  type: ContentBlockType;
  position: number;
  content: Record<string, unknown>;
}

export interface CoverBackground {
  type: 'none' | 'solid' | 'gradient' | 'image';
  value?: string;
  from?: string;
  to?: string;
  angle?: number;
}

export interface Cover {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  ctaLabel?: string;
  background?: CoverBackground;
}

export interface TemplateCover {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  background?: CoverBackground;
}

export interface Ending {
  message?: string;
  redirectUrl?: string;
}

export interface FormSummary {
  id: string;
  title: string;
  description?: string;
  status: FormStatus;
  slug?: string;
  questionCount: number;
  communeId?: string;
  category?: string;
  access?: FormAccess;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Form {
  id: string;
  /** Conservé pour la traçabilité (D2) — l'autorisation repose sur communeId + rôle */
  createdBy?: string;
  /** @deprecated Remplacé par createdBy ; peut encore arriver du backend V1 */
  ownerId?: string;
  templateId?: string;
  slug?: string;
  title: string;
  description?: string;
  status: FormStatus;
  presentation: PresentationMode;
  communeId?: string;
  category?: string;
  access?: FormAccess;
  geotagOnSubmit?: boolean;
  openAt?: string;
  closeAt?: string;
  maxResponses?: number;
  archived: boolean;
  theme: Record<string, unknown>;
  cover: Record<string, unknown>;
  ending: Record<string, unknown>;
  sections: Section[];
  questions: Question[];
  contentBlocks: ContentBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface FormVersion {
  id: string;
  formId: string;
  version: number;
  schema: Record<string, unknown>;
  publishedAt: string;
  publishedBy?: string;
}

/** Schéma enrichi retourné par l'API publique */
export interface SectionItem {
  kind: 'QUESTION' | 'CONTENT_BLOCK';
  position: number;
  id: string;
  label?: string;
  type?: string;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  format?: string;
  conditions?: Array<{ questionId: string; operator: string; value: unknown }>;
  content?: Record<string, unknown>;
}

export interface PublicSection {
  id: string;
  title?: string;
  description?: string;
  position: number;
  items: SectionItem[];
}

export interface PublicForm {
  id: string;
  slug: string;
  title: string;
  description?: string;
  presentation: PresentationMode;
  access?: FormAccess;
  geotagOnSubmit?: boolean;
  theme: Record<string, unknown>;
  cover: Record<string, unknown>;
  sections: PublicSection[];
  ending: Record<string, unknown>;
  ogTitle: string;
  ogImage?: string;
}

export type UserRole = 'ADMIN' | 'COORDINATOR' | 'OBSERVER';

export interface AuthResponse {
  token: string;
  email: string;
  userId: string;
  role?: UserRole;
  communes?: Commune[];
}

export interface Commune {
  id: string;
  name: string;
  code?: string;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  role: UserRole;
  /** ACTIVE | INVITED | DISABLED — retourné par le backend */
  status?: 'ACTIVE' | 'INVITED' | 'DISABLED';
  /** Alias de compatibilité (true si status === 'ACTIVE') */
  isActive?: boolean;
  communes?: Commune[];
  createdAt?: string;
}

export interface FormAnswer {
  id: string;
  questionId: string;
  value: string | number | string[] | null;
}

export type ResponseStatus = 'PENDING' | 'VALIDATED' | 'REJECTED';

export interface FormResponse {
  id: string;
  formId: string;
  submittedAt: string;
  meta?: Record<string, unknown>;
  answers: FormAnswer[];
  /** Présent dans le détail (ResponseDetailResponse) */
  lat?: number;
  lng?: number;
  /** Présent dans le résumé (ResponseSummaryResponse) */
  location?: { lat: number; lng: number };
  hasLocation?: boolean;
  accuracyMeters?: number;
  locationSource?: string;
  communeId?: string;
  respondentId?: string;
  clientId?: string;
  status: ResponseStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
  formVersion?: number;
  answerCount?: number;
}

export interface QuestionStat {
  questionId: string;
  questionLabel: string;
  questionType: QuestionType;
  fillRate: number;
  distributionByChoice?: Record<string, number>;
  distributionByMonth?: Record<string, number>;
  average?: number;
  median?: number;
  sampleAnswers?: string[];
}

export interface FormStatistics {
  totalResponses: number;
  completionRate: number;
  averageCompletionSeconds: number;
  questionStats: QuestionStat[];
  timeSeries: Record<string, number>;
  /** Ventilation par commune (D5) */
  byCommune?: Record<string, number>;
  /** Ventilation par catégorie/thématique (D5) */
  byCategory?: Record<string, number>;
}

export interface Template {
  id: string;
  ownerId?: string;
  name: string;
  description?: string;
  presentation: PresentationMode;
  sections: Section[];
  questions: Question[];
  contentBlocks: ContentBlock[];
  cover: TemplateCover;
  ending: Ending;
  category?: string;
  previewImage?: string;
  isPublic: boolean;
  isSystem: boolean;
  createdAt: string;
}

export interface Theme {
  id: string;
  ownerId?: string;
  name: string;
  palette: AppTheme['palette'];
  typography: AppTheme['typography'];
  radius: AppTheme['radius'];
  layout: AppTheme['layout'];
  background: AppTheme['background'];
  isPublic: boolean;
  isSystem: boolean;
  createdAt: string;
}
