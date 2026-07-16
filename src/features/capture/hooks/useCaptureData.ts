import { useQuery, useQueryClient } from '@tanstack/react-query';
import { db, type PendingObservation } from '@/features/offline/db';
import { useDeviceId } from '@/shared/lib/useDeviceId';
import { captureApi } from '../api/captureApi';
import { listUnlinkedInstantPhotos } from '../lib/instantPhotos';
import {
  cacheFormList,
  getCachedFormList,
  cacheFormDetail,
  getCachedFormDetail,
  listCachedFormIds,
} from '../lib/offlineForms';
import { publicFormApi } from '@/features/public-form/api/publicFormApi';
import type { PublicForm } from '@/shared/types';

/** Photos instantanées non associées (IndexedDB, hors‑ligne). */
export function useInstantPhotos() {
  return useQuery({
    queryKey: ['instant-photos'],
    queryFn: listUnlinkedInstantPhotos,
  });
}

/** Réponses locales de cet appareil (IndexedDB) — disponibles hors‑ligne. */
export function useLocalObservations() {
  return useQuery({
    queryKey: ['local-observations'],
    queryFn: async (): Promise<PendingObservation[]> => {
      const rows = await db.observations.where('status').notEqual('done').toArray();
      const anon = rows.filter((o) => o.anonymous);
      return anon.sort((a, b) => b.createdAt - a.createdAt);
    },
  });
}

/** Réponses de l'appareil côté serveur (statut de modération, vignettes). */
export function useDeviceResponses() {
  const deviceId = useDeviceId();
  return useQuery({
    queryKey: ['device-responses', deviceId],
    queryFn: () => captureApi.getDeviceResponses(deviceId),
    enabled: !!deviceId,
  });
}

/**
 * Formulaires publiés — online : fetch + mise en cache Dexie ; offline : Dexie.
 * `networkMode: 'always'` évite que react-query mette en pause la requête hors ligne.
 */
export function usePublishedForms() {
  return useQuery({
    queryKey: ['public-forms'],
    queryFn: async () => {
      try {
        const forms = await captureApi.listPublishedForms();
        await cacheFormList(forms);
        return forms;
      } catch {
        return getCachedFormList();
      }
    },
    networkMode: 'always',
    staleTime: 5 * 60 * 1000,
  });
}

/** IDs des formulaires dont le détail complet est disponible hors ligne. */
export function useCachedFormIds() {
  return useQuery({
    queryKey: ['cached-form-ids'],
    queryFn: listCachedFormIds,
    networkMode: 'always',
  });
}

/**
 * Détail complet d'un formulaire — online : fetch + mise en cache ; offline : Dexie.
 * Retourne aussi `fromCache: true` pour signaler à l'UI qu'on est en mode hors ligne.
 */
export function useFormDetail(formId: string | null) {
  return useQuery<PublicForm>({
    queryKey: ['public-form-id', formId],
    queryFn: async () => {
      try {
        const f = await publicFormApi.getById(formId!);
        await cacheFormDetail(f);
        return f;
      } catch {
        const cached = await getCachedFormDetail(formId!);
        if (cached) return cached;
        throw new Error('Formulaire non disponible hors ligne. Téléchargez-le d\'abord.');
      }
    },
    enabled: !!formId,
    networkMode: 'always',
  });
}

/** Télécharge et met en cache un formulaire pour usage hors ligne. */
export function useDownloadForm() {
  const qc = useQueryClient();
  return async (formId: string) => {
    const f = await publicFormApi.getById(formId);
    await cacheFormDetail(f);
    qc.setQueryData(['public-form-id', formId], f);
    await qc.invalidateQueries({ queryKey: ['cached-form-ids'] });
    return f;
  };
}

/** Invalide les données de capture après une mutation locale. */
export function useInvalidateCapture() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['instant-photos'] });
    qc.invalidateQueries({ queryKey: ['local-observations'] });
    qc.invalidateQueries({ queryKey: ['device-responses'] });
  };
}
