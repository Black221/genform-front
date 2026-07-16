import { MapPinned, Globe } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useMapStore } from '../store/mapStore';
import type { CommuneProperties } from '../api/mapApi';

interface Props {
  communes: GeoJSON.FeatureCollection;
}

/**
 * Carte flottante listant les communes pilotes — navigation directe entre communes.
 * Visible en vue nationale ET en vue commune (permet de sauter d'une commune à l'autre).
 */
export function CommunePickerCard({ communes }: Props) {
  const selectedCommuneId = useMapStore((s) => s.selectedCommuneId);
  const selectCommune = useMapStore((s) => s.selectCommune);
  const backToNational = useMapStore((s) => s.backToNational);

  const items = communes.features
    .map((f) => f.properties as CommuneProperties)
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  if (!items.length) return null;

  return (
    <div
      className="absolute left-3 top-20 z-10 w-56 flex flex-col max-h-[min(60vh,440px)]
                 bg-white/75 backdrop-blur-xl rounded-2xl border border-white/60
                 shadow-[0_10px_40px_-12px_rgba(21,37,46,0.4)] overflow-hidden"
    >
      {/* En-tête */}
      <div className="px-3 py-2.5 border-b border-border/40 flex items-center gap-2 shrink-0">
        <MapPinned className="size-3.5 text-primary shrink-0" />
        <span className="text-xs font-display font-semibold text-(--color-text)">Communes</span>
      </div>

      {/* Bouton « Toutes les communes » — toujours visible et accessible
          dès qu'une commune est sélectionnée (retour vue nationale) */}
      {selectedCommuneId && (
        <div className="p-1.5 pb-0 shrink-0">
          <button
            onClick={backToNational}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold
                       text-primary bg-primary/10 hover:bg-primary/15 transition-colors
                       focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <Globe className="size-4 shrink-0" />
            Toutes les communes
          </button>
        </div>
      )}

      {/* Liste */}
      <ul className="overflow-y-auto p-1.5 space-y-0.5">
        {items.map((commune) => {
          const active = commune.id === selectedCommuneId;
          return (
            <li key={commune.id}>
              <button
                type="button"
                onClick={() => selectCommune(commune.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors',
                  active
                    ? 'bg-primary/10'
                    : 'hover:bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]',
                )}
              >
                {/* Indicateur couleur */}
                <span
                  className={cn(
                    'size-2.5 rounded-full shrink-0 transition-transform ring-2 ring-white',
                    active && 'scale-125',
                  )}
                  style={{ backgroundColor: commune.color ?? 'var(--color-primary)' }}
                />

                {/* Nom */}
                <span
                  className={cn(
                    'flex-1 min-w-0 block text-xs truncate',
                    active ? 'font-semibold text-(--color-text)' : 'text-muted',
                  )}
                >
                  {commune.name}
                </span>

                {/* Compteur — pill */}
                <span
                  className={cn(
                    'text-[10px] font-mono font-medium shrink-0 px-1.5 py-0.5 rounded-full',
                    active ? 'bg-primary text-white' : 'bg-black/5 text-muted',
                  )}
                >
                  {commune.responseCount ?? 0}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
