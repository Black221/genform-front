import { ListChecks, Images } from 'lucide-react';
import { useMapStore } from '../../store/mapStore';
import { ObservationList } from './ObservationList';
import { GalleryGrid } from './GalleryGrid';
import { cn } from '@/shared/lib/cn';

interface Props {
  observations: GeoJSON.FeatureCollection;
}

/** Contenu du bottom-sheet mobile : onglets Réponses / Galerie. */
export function MobileCommunePanel({ observations }: Props) {
  const selectedCommuneId = useMapStore((s) => s.selectedCommuneId);
  const communePanel = useMapStore((s) => s.communePanel);
  const setCommunePanel = useMapStore((s) => s.setCommunePanel);
  const filters = useMapStore((s) => s.filters);

  const communeObs = observations.features.filter(
    (f) => (f.properties as { communeId?: string })?.communeId === selectedCommuneId,
  );
  const galleryFilters = { ...filters, communeId: selectedCommuneId ?? undefined };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex gap-0.5 mx-3 mb-2 p-0.5 rounded-xl bg-black/5 shrink-0">
        <button
          onClick={() => setCommunePanel('list')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium transition-all',
            communePanel === 'list' ? 'bg-white text-primary shadow-sm' : 'text-muted',
          )}
        >
          <ListChecks className="size-3.5" /> Réponses
        </button>
        <button
          onClick={() => setCommunePanel('gallery')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium transition-all',
            communePanel === 'gallery' ? 'bg-white text-primary shadow-sm' : 'text-muted',
          )}
        >
          <Images className="size-3.5" /> Galerie
        </button>
      </div>

      {communePanel === 'gallery'
        ? <GalleryGrid filters={galleryFilters} />
        : <ObservationList features={communeObs} />}
    </div>
  );
}
