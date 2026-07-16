import { useParams, useNavigate, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { formsApi } from '@/features/forms/api/formsApi';
import { publicFormApi } from '@/features/public-form/api/publicFormApi';
import { FormExperience } from '@/features/form-renderer/FormExperience';
import { observationsApi } from '../api/observationsApi';
import {
  saveObservationLocally,
  savePhotosLocally,
  syncPendingObservations,
} from '@/features/offline/syncEngine';
import { useOnlineStatus } from '@/features/offline/hooks/useOnlineStatus';
import type { GeoState } from '../hooks/useGeolocation';
import type { PhotoEntry } from '@/features/form-renderer/fields/PhotoField';
import type { LocationValue } from '@/features/form-renderer/fields/LocationField';
import { ChevronRight, CheckCircle, WifiOff } from 'lucide-react';
import { generateId } from '@/shared/lib/generateId';

// ── Form selector (no formId) ─────────────────────────────────────────────────
function FormSelector() {
  const { data: forms, isLoading } = useQuery({
    queryKey: ['forms'],
    queryFn: () => formsApi.list(),
  });

  const published = forms?.filter((f) => f.status === 'PUBLISHED') ?? [];

  return (
    <div className="p-4 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-(--color-text)">Choisir un formulaire</h2>
        <p className="text-sm text-muted mt-0.5">Sélectionnez l'observation à collecter</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white animate-pulse border border-theme" />
          ))}
        </div>
      ) : published.length === 0 ? (
        <div className="text-center py-16 text-muted text-sm">
          Aucun formulaire publié disponible.
        </div>
      ) : (
        <div className="space-y-3">
          {published.map((form) => (
            <Link
              key={form.id}
              to={`/collect/${form.id}`}
              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-theme shadow-soft hover:border-primary/40 hover:shadow-warm transition-all"
            >
              <div>
                <p className="font-semibold text-sm text-(--color-text)">{form.title}</p>
                {form.description && (
                  <p className="text-xs text-muted mt-0.5 line-clamp-1">{form.description}</p>
                )}
                <p className="text-xs text-muted mt-1">
                  {form.questionCount} question{form.questionCount !== 1 ? 's' : ''}
                </p>
              </div>
              <ChevronRight size={18} className="text-primary shrink-0 ml-3" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Capture GPS silencieuse (geotagOnSubmit) ──────────────────────────────────
function captureGps(): Promise<{ lat: number; lng: number; accuracy?: number; source: 'GPS' } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, source: 'GPS' }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 },
    );
  });
}

// ── Collection flow ───────────────────────────────────────────────────────────
function CollectionFlow({ formId }: { formId: string }) {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

  const { data: form, isLoading } = useQuery({
    queryKey: ['public-form-id', formId],
    queryFn: () => publicFormApi.getById(formId),
    enabled: !!formId,
  });

  const handleSubmit = async (answers: Record<string, unknown>) => {
    const clientId = generateId();

    // Extraire les photos des réponses (PhotoField values) avant d'envoyer
    const photos: PhotoEntry[] = [];
    const cleanAnswers: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(answers)) {
      if (Array.isArray(value) && value[0]?.blob instanceof Blob) {
        photos.push(...(value as PhotoEntry[]));
        cleanAnswers[key] = value.map((p: PhotoEntry) => p.id);
      } else {
        cleanAnswers[key] = value;
      }
    }

    // Extraire la coordonnée principale (LocationField ou geotagOnSubmit)
    let geoFields: { lat?: number; lng?: number; accuracyMeters?: number; locationSource?: 'GPS' | 'MANUAL' } = {};

    // Cherche un champ LOCATION explicite dans les réponses
    const explicitLocation = Object.values(answers).find(
      (v) => v && typeof v === 'object' && 'lat' in (v as object) && 'lng' in (v as object),
    ) as LocationValue | undefined;

    if (explicitLocation) {
      geoFields = { lat: explicitLocation.lat, lng: explicitLocation.lng, locationSource: explicitLocation.source };
    } else if (form?.geotagOnSubmit) {
      const gps = await captureGps();
      if (gps) geoFields = { lat: gps.lat, lng: gps.lng, accuracyMeters: gps.accuracy, locationSource: gps.source };
    }

    await saveObservationLocally({ clientId, formId, answers: cleanAnswers, ...geoFields });
    if (photos.length > 0) {
      await savePhotosLocally(clientId, photos.map((p) => ({ blob: p.blob, contentType: p.contentType })));
    }

    if (!isOnline) return; // syncEngine prendra en charge à la reconnexion

    try {
      const geo: GeoState | undefined =
        geoFields.lat !== undefined && geoFields.lng !== undefined
          ? { status: 'ok', lat: geoFields.lat, lng: geoFields.lng, accuracy: geoFields.accuracyMeters, source: geoFields.locationSource }
          : undefined;
      const result = await observationsApi.submit({ formId, answers: cleanAnswers, geo, clientId });
      if (photos.length > 0) uploadPhotos(result.id, photos).catch(console.error);
    } catch {
      syncPendingObservations();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="size-8 rounded-full border-2 border-(--color-primary) border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
        <p className="text-sm text-muted">Formulaire introuvable.</p>
        <button onClick={() => navigate('/collect')} className="text-sm text-primary font-medium">
          ← Retour
        </button>
      </div>
    );
  }

  return (
    <FormExperience
      form={form}
      onSubmit={handleSubmit}
    />
  );
}

// ── Done screen (used by FormExperience EndingScreen — kept for offline banner) ─
export function CollectDoneScreen({ savedOffline, onNew }: { savedOffline: boolean; onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-16 text-center gap-6">
      <div className={`size-16 rounded-full flex items-center justify-center ${savedOffline ? 'bg-orange-100' : 'bg-(--brand-green-light)'}`}>
        {savedOffline
          ? <WifiOff size={28} className="text-orange-500" />
          : <CheckCircle size={28} className="text-primary" />}
      </div>
      <div>
        <h2 className="text-xl font-bold text-(--color-text)">
          {savedOffline ? 'Sauvegardé hors ligne' : 'Observation envoyée !'}
        </h2>
        <p className="text-sm text-muted mt-1">
          {savedOffline ? 'Sera synchronisé automatiquement à la reconnexion.' : ''}
        </p>
      </div>
      <button
        onClick={onNew}
        className="px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-warm"
      >
        Nouvelle observation
      </button>
    </div>
  );
}

// ── Photo upload helper ───────────────────────────────────────────────────────
async function uploadPhotos(responseId: string, photos: PhotoEntry[]) {
  for (const photo of photos) {
    try {
      const { key, uploadUrl } = await observationsApi.getUploadUrl(photo.contentType);
      await observationsApi.uploadToStorage(uploadUrl, photo.blob, photo.contentType);
      await observationsApi.attachMedia(responseId, key, photo.contentType);
    } catch (err) {
      console.error('Failed to upload photo', err);
    }
  }
}

// ── Root page ─────────────────────────────────────────────────────────────────
export default function CollectPage() {
  const { formId } = useParams<{ formId?: string }>();
  return formId ? <CollectionFlow formId={formId} /> : <FormSelector />;
}
