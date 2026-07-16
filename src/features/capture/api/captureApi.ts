import { apiClient } from '@/shared/lib/apiClient';

export type DeviceResponseStatus = 'PENDING' | 'VALIDATED' | 'REJECTED';

/** Résumé serveur d'une réponse d'un appareil anonyme. */
export interface DeviceResponseSummary {
  responseId: string;
  formId: string;
  formTitle: string;
  status: DeviceResponseStatus;
  submittedAt: string;
  lat: number | null;
  lng: number | null;
  thumbnailUrl: string | null;
}

/** Formulaire public minimal pour l'étape « choisir un formulaire ». */
export interface PublicFormCard {
  id: string;
  title: string;
  description?: string;
  questionCount?: number;
}

export const captureApi = {
  /** Historique serveur des réponses de l'appareil (deviceId dans meta). */
  getDeviceResponses: (deviceId: string): Promise<DeviceResponseSummary[]> =>
    apiClient.get('/public/responses', { params: { deviceId } }).then((r) => r.data),

  /** Formulaires publiés disponibles pour rattachement (endpoint public). */
  listPublishedForms: (): Promise<PublicFormCard[]> =>
    apiClient
      .get('/public/forms')
      .then((r) => (Array.isArray(r.data) ? r.data : [])),
};
