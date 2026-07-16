import Dexie, { type EntityTable } from 'dexie';

export interface PendingObservation {
  id: number;
  clientId: string;
  formId: string;
  answers: Record<string, unknown>;
  lat?: number;
  lng?: number;
  accuracyMeters?: number;
  locationSource?: 'GPS' | 'MANUAL';
  createdAt: number;
  status: 'pending' | 'syncing' | 'done' | 'error';
  error?: string;
  responseId?: string;
  /** Soumission anonyme (capture publique) → sync via endpoints /public/*. */
  anonymous?: boolean;
  /** Appareil anonyme à l'origine de la soumission (envoyé dans meta.deviceId). */
  deviceId?: string;
}

export interface PendingPhoto {
  id: number;
  clientId: string;
  blob: Blob;
  contentType: string;
  status: 'pending' | 'done' | 'error';
}

/**
 * Photo prise « à chaud » (caméra + géolocalisation au moment de la capture),
 * pas encore rattachée à un formulaire. Conservée hors ligne dans IndexedDB.
 */
export interface InstantPhoto {
  id: number;
  photoId: string;
  deviceId: string;
  blob: Blob;
  contentType: string;
  lat?: number;
  lng?: number;
  accuracyMeters?: number;
  locationSource?: 'GPS' | 'MANUAL';
  capturedAt: number;
  status: 'unlinked' | 'linked';
  /** clientId de la réponse à laquelle la photo a été rattachée. */
  responseClientId?: string;
}

/** Formulaire mis en cache pour usage hors ligne (D7) */
export interface CachedForm {
  id: string;
  communeId?: string;
  cachedAt: number;
  payload: unknown;
}

class GenFormDB extends Dexie {
  observations!: EntityTable<PendingObservation, 'id'>;
  photos!: EntityTable<PendingPhoto, 'id'>;
  cachedForms!: EntityTable<CachedForm, 'id'>;
  instantPhotos!: EntityTable<InstantPhoto, 'id'>;

  constructor() {
    super('gen-form-offline');
    this.version(1).stores({
      observations: '++id, &clientId, formId, status, createdAt',
      photos: '++id, clientId, status',
    });
    this.version(2).stores({
      observations: '++id, &clientId, formId, status, createdAt',
      photos: '++id, clientId, status',
      cachedForms: 'id, communeId, cachedAt',
    });
    this.version(3).stores({
      observations: '++id, &clientId, formId, status, createdAt',
      photos: '++id, clientId, status',
      cachedForms: 'id, communeId, cachedAt',
      instantPhotos: '++id, &photoId, deviceId, status, capturedAt',
    });
  }
}

export const db = new GenFormDB();
