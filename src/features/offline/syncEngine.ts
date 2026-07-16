import { db } from './db';
import { useSyncStore } from './syncStore';
import { apiClient } from '@/shared/lib/apiClient';
import { observationsApi } from '@/features/observations/api/observationsApi';

interface SyncEntry {
  formId: string;
  clientId: string;
  answers: Array<{ questionId: string; value: unknown }>;
  meta: Record<string, unknown>;
  lat?: number;
  lng?: number;
  accuracyMeters?: number;
  locationSource?: string;
}

interface SyncResult {
  clientId: string;
  status: 'OK' | 'ERROR';
  responseId?: string;
  error?: string;
}

/** Rafraîchit le compteur de pendants dans le store. */
export async function refreshPendingCount() {
  const n = await db.observations.where('status').equals('pending').count();
  useSyncStore.getState().setPending(n);
}

/** Lance la synchronisation des observations en attente. */
export async function syncPendingObservations() {
  const { syncing, setSyncing, markSynced } = useSyncStore.getState();
  if (syncing || !navigator.onLine) return;

  const pending = await db.observations.where('status').equals('pending').toArray();
  if (!pending.length) { markSynced(); return; }

  setSyncing(true);

  // Soumissions anonymes (capture publique) ↔ chemin /public/* ;
  // soumissions d'observateurs authentifiés ↔ batch /sync/responses.
  const anonymous = pending.filter((o) => o.anonymous);
  const authed = pending.filter((o) => !o.anonymous);

  try {
    if (authed.length) await syncAuthedBatch(authed);
    for (const obs of anonymous) await syncAnonymousOne(obs);
  } finally {
    markSynced();
    await refreshPendingCount();
  }
}

/** Chemin observateur authentifié : batch idempotent /sync/responses. */
async function syncAuthedBatch(pending: { id: number; clientId: string; formId: string; answers: Record<string, unknown>; lat?: number; lng?: number; accuracyMeters?: number; locationSource?: string }[]) {
  await db.observations
    .where('clientId')
    .anyOf(pending.map((o) => o.clientId))
    .modify({ status: 'syncing' });

  const entries: SyncEntry[] = pending.map((o) => ({
    formId: o.formId,
    clientId: o.clientId,
    answers: Object.entries(o.answers).map(([questionId, value]) => ({ questionId, value })),
    meta: {},
    lat: o.lat,
    lng: o.lng,
    accuracyMeters: o.accuracyMeters,
    locationSource: o.locationSource,
  }));

  try {
    const { data: results } = await apiClient.post<SyncResult[]>('/sync/responses', entries);

    for (const result of results) {
      if (result.status === 'OK') {
        await db.observations
          .where('clientId').equals(result.clientId)
          .modify({ status: 'done', responseId: result.responseId });

        if (result.responseId) {
          const photos = await db.photos
            .where('clientId').equals(result.clientId)
            .and((p) => p.status === 'pending')
            .toArray();

          for (const photo of photos) {
            try {
              const { key, uploadUrl } = await observationsApi.getUploadUrl(photo.contentType);
              await observationsApi.uploadToStorage(uploadUrl, photo.blob, photo.contentType);
              await observationsApi.attachMedia(result.responseId!, key, photo.contentType);
              await db.photos.update(photo.id, { status: 'done' });
            } catch {
              await db.photos.update(photo.id, { status: 'error' });
            }
          }
        }
      } else {
        await db.observations
          .where('clientId').equals(result.clientId)
          .modify({ status: 'error', error: result.error });
      }
    }
  } catch {
    // Réseau KO — repasser syncing → pending pour réessayer
    await db.observations
      .where('status').equals('syncing')
      .modify({ status: 'pending' });
  }
}

/** Chemin anonyme : soumission publique + upload photos via /public/media/*. */
async function syncAnonymousOne(obs: { id: number; clientId: string; formId: string; answers: Record<string, unknown>; lat?: number; lng?: number; accuracyMeters?: number; locationSource?: string; deviceId?: string }) {
  await db.observations.update(obs.id, { status: 'syncing' });

  const body: Record<string, unknown> = {
    answers: Object.entries(obs.answers).map(([questionId, value]) => ({ questionId, value })),
    meta: obs.deviceId ? { deviceId: obs.deviceId } : {},
    clientId: obs.clientId,
  };
  if (obs.lat != null && obs.lng != null) {
    body.lat = obs.lat;
    body.lng = obs.lng;
    body.accuracyMeters = obs.accuracyMeters;
    body.locationSource = obs.locationSource ?? 'GPS';
  }

  try {
    const { data } = await apiClient.post<{ id: string }>(`/public/forms/${obs.formId}/responses`, body);
    const responseId = data.id;
    await db.observations.update(obs.id, { status: 'done', responseId });

    const photos = await db.photos
      .where('clientId').equals(obs.clientId)
      .and((p) => p.status === 'pending')
      .toArray();

    for (const photo of photos) {
      try {
        const { key, uploadUrl } = await observationsApi.getPublicUploadUrl(photo.contentType);
        await observationsApi.uploadToStorage(uploadUrl, photo.blob, photo.contentType);
        await observationsApi.attachPublicMedia(responseId, key, photo.contentType);
        await db.photos.update(photo.id, { status: 'done' });
      } catch {
        await db.photos.update(photo.id, { status: 'error' });
      }
    }
  } catch {
    await db.observations.update(obs.id, { status: 'pending' });
  }
}

/** Enregistre une observation dans Dexie (toujours, avant tentative réseau). */
export async function saveObservationLocally(payload: {
  clientId: string;
  formId: string;
  answers: Record<string, unknown>;
  lat?: number;
  lng?: number;
  accuracyMeters?: number;
  locationSource?: 'GPS' | 'MANUAL';
  anonymous?: boolean;
  deviceId?: string;
}) {
  await db.observations.add({
    ...payload,
    createdAt: Date.now(),
    status: 'pending',
  } as never);
  await refreshPendingCount();
}

/** Sauvegarde les photos d'une observation dans Dexie. */
export async function savePhotosLocally(
  clientId: string,
  photos: Array<{ blob: Blob; contentType: string }>,
) {
  for (const photo of photos) {
    await db.photos.add({ clientId, ...photo, status: 'pending' } as never);
  }
}

/**
 * Précharge les formulaires OBSERVERS des communes de l'observateur (D7).
 * À appeler à la connexion quand l'app est en ligne.
 */
export async function preloadFormsForObserver(communeIds: string[]) {
  if (!navigator.onLine || communeIds.length === 0) return;
  try {
    for (const communeId of communeIds) {
      const { data } = await apiClient.get('/forms', { params: { communeId, status: 'PUBLISHED' } });
      const forms = Array.isArray(data) ? data : [];
      for (const form of forms) {
        await db.cachedForms.put({ id: form.id, communeId, cachedAt: Date.now(), payload: form });
      }
    }
  } catch {
    // Silencieux — le préchargement est best-effort
  }
}

/** Initialise les listeners online/offline. Appeler une fois au démarrage. */
export function initSyncEngine() {
  refreshPendingCount();
  window.addEventListener('online', syncPendingObservations);
  if (navigator.onLine) syncPendingObservations();
}
