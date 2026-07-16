import { ImageOff, Images } from 'lucide-react';
import { useMapGallery } from '../../hooks/useMapGallery';
import { useMapStore } from '../../store/mapStore';
import type { MapFilters } from '../../api/mapApi';

interface Props {
  filters: MapFilters;
}

/**
 * Galerie photos d'une commune. Chaque vignette ouvre le détail de
 * l'observation porteuse (clic → selectObservation → modal).
 */
export function GalleryGrid({ filters }: Props) {
  const { data: items = [], isLoading, isError } = useMapGallery(filters);
  const selectObservation = useMapStore((s) => s.selectObservation);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-1.5 p-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-border/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-muted">
        <ImageOff className="size-9 mb-3 opacity-40" />
        <p className="text-sm">Impossible de charger la galerie.</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <Images className="size-10 text-muted/40 mb-3" />
        <p className="text-sm text-muted">Aucune photo dans cette zone</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto flex-1">
      <div className="px-4 py-2 border-b border-border/40 shrink-0">
        <p className="text-xs text-muted">
          {items.length} photo{items.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-1 p-1">
        {items.map((item) => (
          <button
            key={item.mediaId}
            type="button"
            onClick={() => selectObservation(item.responseId)}
            title={item.formTitle ?? 'Voir la réponse'}
            className="group relative aspect-square overflow-hidden rounded-md bg-border/20
                       focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <img
              src={item.downloadUrl}
              alt={item.filename ?? item.formTitle ?? 'Photo'}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            {/* Overlay au survol — titre du formulaire */}
            <span
              className="absolute inset-x-0 bottom-0 p-1.5 text-[10px] leading-tight text-white text-left
                         bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100
                         transition-opacity line-clamp-2"
            >
              {item.formTitle ?? 'Réponse'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
