import { db, type InstantPhoto } from '@/features/offline/db';
import { generateId } from '@/shared/lib/generateId';
import { getDeviceId } from '@/shared/lib/useDeviceId';
import { saveObservationLocally, syncPendingObservations } from '@/features/offline/syncEngine';

interface NewInstantPhoto {
  blob: Blob;
  contentType: string;
  lat?: number;
  lng?: number;
  accuracyMeters?: number;
  locationSource?: 'GPS' | 'MANUAL';
}

/** Enregistre une photo instantanée (caméra + géoloc) dans IndexedDB. */
export async function addInstantPhoto(p: NewInstantPhoto): Promise<string> {
  const photoId = generateId();
  await db.instantPhotos.add({
    photoId,
    deviceId: getDeviceId(),
    status: 'unlinked',
    capturedAt: Date.now(),
    ...p,
  } as never);
  return photoId;
}

/** Photos instantanées non encore associées (les plus récentes d'abord). */
export async function listUnlinkedInstantPhotos(): Promise<InstantPhoto[]> {
  const rows = await db.instantPhotos.where('status').equals('unlinked').toArray();
  return rows.sort((a, b) => b.capturedAt - a.capturedAt);
}

export function countUnlinkedInstantPhotos(): Promise<number> {
  return db.instantPhotos.where('status').equals('unlinked').count();
}

/** Supprime une photo instantanée non associée. */
export async function deleteInstantPhoto(photoId: string): Promise<void> {
  await db.instantPhotos.where('photoId').equals(photoId).delete();
}

interface PhotoEntryLike { id: string; blob: Blob; contentType: string }

/**
 * Crée une réponse (anonyme, hors‑ligne) à partir d'un formulaire rempli +
 * des photos instantanées sélectionnées. La géolocalisation de la réponse
 * provient de la 1ʳᵉ photo géolocalisée. Déclenche la synchro si en ligne.
 */
export async function associatePhotosToForm(opts: {
  formId: string;
  answers: Record<string, unknown>;
  photoIds: string[];
}): Promise<string> {
  const clientId = generateId();
  const deviceId = getDeviceId();

  // Extraire d'éventuelles photos saisies dans le formulaire (PhotoField)
  const formPhotos: PhotoEntryLike[] = [];
  const cleanAnswers: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(opts.answers)) {
    if (Array.isArray(value) && (value[0] as PhotoEntryLike)?.blob instanceof Blob) {
      formPhotos.push(...(value as PhotoEntryLike[]));
      cleanAnswers[key] = (value as PhotoEntryLike[]).map((p) => p.id);
    } else {
      cleanAnswers[key] = value;
    }
  }

  // Photos instantanées sélectionnées
  const selected = await db.instantPhotos.where('photoId').anyOf(opts.photoIds).toArray();
  const geoPhoto = selected.find((p) => p.lat != null && p.lng != null);

  await saveObservationLocally({
    clientId,
    formId: opts.formId,
    answers: cleanAnswers,
    anonymous: true,
    deviceId,
    lat: geoPhoto?.lat,
    lng: geoPhoto?.lng,
    accuracyMeters: geoPhoto?.accuracyMeters,
    locationSource: geoPhoto?.locationSource,
  });

  // Copier les blobs (instantanées + formulaire) dans la file d'upload
  for (const p of selected) {
    await db.photos.add({ clientId, blob: p.blob, contentType: p.contentType, status: 'pending' } as never);
    await db.instantPhotos.update(p.id, { status: 'linked', responseClientId: clientId });
  }
  for (const p of formPhotos) {
    await db.photos.add({ clientId, blob: p.blob, contentType: p.contentType, status: 'pending' } as never);
  }

  void syncPendingObservations();
  return clientId;
}
