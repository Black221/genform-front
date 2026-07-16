import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Camera, MapPin, MapPinOff, Trash2, Check, ArrowRight, Loader2, LocateFixed, Loader } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useInstantCapture } from '../hooks/useInstantCapture';
import { useGeoWatch } from '../hooks/useGeoWatch';
import { useInstantPhotos, useInvalidateCapture } from '../hooks/useCaptureData';
import { deleteInstantPhoto } from '../lib/instantPhotos';
import type { InstantPhoto } from '@/features/offline/db';

function PhotoThumb({ photo, selected, onToggle, onDelete }: {
  photo: InstantPhoto; selected: boolean; onToggle: () => void; onDelete: () => void;
}) {
  const url = URL.createObjectURL(photo.blob);
  const hasGeo = photo.lat != null && photo.lng != null;
  return (
    <div className="relative aspect-square rounded-xl overflow-hidden bg-border/20 group">
      <button type="button" onClick={onToggle} className="absolute inset-0">
        <img src={url} alt="" className="w-full h-full object-cover" onLoad={() => URL.revokeObjectURL(url)} />
      </button>
      {/* Sélection */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'absolute top-1.5 left-1.5 size-6 rounded-full flex items-center justify-center border-2 transition-colors',
          selected ? 'bg-primary border-primary text-white' : 'bg-black/30 border-white/80 text-transparent',
        )}
        aria-label={selected ? 'Désélectionner' : 'Sélectionner'}
      >
        <Check className="size-3.5" />
      </button>
      {/* Badge geo */}
      <span className="absolute bottom-1.5 left-1.5 text-white drop-shadow" title={hasGeo ? 'Géolocalisée' : 'Sans position'}>
        {hasGeo ? <MapPin className="size-3.5" /> : <MapPinOff className="size-3.5 opacity-70" />}
      </span>
      {/* Suppression */}
      <button
        type="button"
        onClick={onDelete}
        className="absolute top-1.5 right-1.5 size-6 rounded-full bg-black/40 text-white flex items-center justify-center
                   opacity-0 group-hover:opacity-100 transition-opacity hover:bg-(--color-danger)"
        aria-label="Supprimer"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

export default function CapturePage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const invalidate = useInvalidateCapture();
  const { data: photos = [] } = useInstantPhotos();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Localisation active dès l'ouverture de l'écran (position chaude prête)
  const { status: geoStatus, fix, enable } = useGeoWatch();

  const { status, geoDenied, handleFile, reset } = useInstantCapture(() => {
    invalidate();
    setTimeout(reset, 2500);
  });

  // iOS : la demande de géoloc doit partir d'un geste utilisateur → on (ré)active
  // au tap, dans le même geste, avant d'ouvrir la caméra.
  const takePhoto = () => {
    if (geoStatus !== 'active') enable();
    inputRef.current?.click();
  };

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const f of files) await handleFile(f, fix);
    e.target.value = '';
  };

  const toggle = (photoId: string) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(photoId) ? next.delete(photoId) : next.add(photoId);
      return next;
    });

  const remove = async (photoId: string) => {
    await deleteInstantPhoto(photoId);
    setSelected((s) => { const n = new Set(s); n.delete(photoId); return n; });
    invalidate();
  };

  const associate = () => {
    navigate('/capture/associate', { state: { photoIds: [...selected] } });
  };

  return (
    <div className="p-4 pb-28 space-y-6">
      {/* Capture */}
      <section className="text-center pt-6">
        <input ref={inputRef} type="file" accept="image/*" capture="environment" multiple hidden onChange={onFiles} />

        {/* Bouton caméra */}
        <button
          onClick={takePhoto}
          disabled={status === 'capturing'}
          aria-label="Prendre une photo"
          className="group relative mx-auto flex items-center justify-center size-44 rounded-full
                     bg-hero text-white shadow-lift ring-8 ring-(--color-primary-soft)
                     active:scale-95 transition-all
                     disabled:opacity-70 disabled:active:scale-100"
        >
          <span className="flex flex-col items-center justify-center gap-2.5">
            {status === 'capturing'
              ? <Loader2 className="size-12 animate-spin" />
              : <Camera className="size-12" strokeWidth={1.75} />}
            <span className="font-display font-semibold text-base tracking-tight">
              {status === 'capturing' ? 'Capture…' : 'Prendre une photo'}
            </span>
          </span>
        </button>

        <p className="text-sm text-muted mt-5 max-w-xs mx-auto">
          La photo et votre position sont enregistrées, même hors connexion.
        </p>

        {/* Statut de la localisation */}
        <div className="mt-3 flex justify-center min-h-7">
          {geoStatus === 'active' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success bg-(--color-success-soft) rounded-full px-3 py-1.5">
              <LocateFixed className="size-3.5" />
              Localisation active{fix?.accuracyMeters != null && ` · ±${Math.round(fix.accuracyMeters)} m`}
            </span>
          )}
          {geoStatus === 'locating' && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted bg-surface-raised rounded-full px-3 py-1.5">
              <Loader className="size-3.5 animate-spin" />
              Activation de la localisation…
            </span>
          )}
          {(geoStatus === 'idle' || geoStatus === 'denied') && (
            <button
              onClick={enable}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8a5a00] bg-gold-soft rounded-full px-3 py-1.5 hover:opacity-90 active:scale-95 transition-all"
            >
              <MapPin className="size-3.5" />
              {geoStatus === 'denied' ? 'Localisation refusée — réactiver' : 'Activer la localisation'}
            </button>
          )}
          {geoStatus === 'insecure' && (
            <span className="inline-flex items-center gap-1.5 text-xs text-[#8a5a00] bg-gold-soft rounded-full px-3 py-1.5">
              <MapPinOff className="size-3.5" />
              Localisation indisponible (connexion non sécurisée)
            </span>
          )}
          {geoStatus === 'unavailable' && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <MapPinOff className="size-3.5" />
              Localisation non disponible
            </span>
          )}
        </div>

        {status === 'saved' && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-success">
            <Check className="size-4" />
            Photo enregistrée {geoDenied ? '(sans position)' : 'avec la position'}
          </p>
        )}
        {status === 'error' && (
          <p className="mt-3 text-sm text-danger">Échec de la capture. Réessayez.</p>
        )}
      </section>

      {/* Bibliothèque de photos à associer */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-sm text-(--color-text)">
            Photos à associer
          </h2>
          {photos.length > 0 && (
            <span className="text-xs text-muted">{photos.length}</span>
          )}
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-theme text-muted text-sm">
            Aucune photo en attente. Prenez une photo pour commencer.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <PhotoThumb
                key={p.photoId}
                photo={p}
                selected={selected.has(p.photoId)}
                onToggle={() => toggle(p.photoId)}
                onDelete={() => remove(p.photoId)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Barre d'action sélection */}
      {selected.size > 0 && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-2rem)] max-w-md">
          <button
            onClick={associate}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-primary text-white
                       font-semibold shadow-lift hover:opacity-95 transition-opacity"
          >
            Associer à un formulaire ({selected.size})
            <ArrowRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
