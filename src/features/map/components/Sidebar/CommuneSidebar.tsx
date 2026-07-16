import { ListChecks, Images } from 'lucide-react';
import { useMapStore } from '../../store/mapStore';
import { useCommuneAggregate } from '../../hooks/useCommuneAggregate';
import { ObservationList } from './ObservationList';
import { GalleryGrid } from './GalleryGrid';
import type { CommuneProperties } from '../../api/mapApi';
import { CATEGORY_LABEL } from '@/shared/lib/formCategories';
import { cn } from '@/shared/lib/cn';

interface Props {
  communeFeature: GeoJSON.Feature | undefined;
  observations: GeoJSON.FeatureCollection;
}

export function CommuneSidebar({ communeFeature, observations }: Props) {
  const selectedCommuneId = useMapStore((s) => s.selectedCommuneId);
  const backToNational = useMapStore((s) => s.backToNational);
  const communePanel = useMapStore((s) => s.communePanel);
  const setCommunePanel = useMapStore((s) => s.setCommunePanel);
  const filters = useMapStore((s) => s.filters);

  const { data: aggregate } = useCommuneAggregate(selectedCommuneId);
  const commune = communeFeature?.properties as CommuneProperties | undefined;

  // Filter observations to this commune
  const communeObs = observations.features.filter(
    (f) => (f.properties as { communeId?: string })?.communeId === selectedCommuneId,
  );

  const galleryFilters = { ...filters, communeId: selectedCommuneId ?? undefined };

  return (
    <aside
      className="absolute right-3 top-20 bottom-3 z-10 w-95 bg-white/75 backdrop-blur-xl
                 border border-white/60 rounded-2xl shadow-[0_10px_40px_-12px_rgba(21,37,46,0.4)]
                 hidden md:flex md:flex-col overflow-hidden"
    >
      {/* Bandeau couleur de la commune */}
      <div className="h-1 shrink-0" style={{ backgroundColor: commune?.color ?? 'var(--color-primary)' }} />

      {/* Header commune */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 shrink-0">
        <button
          onClick={backToNational}
          className="p-1 rounded-md hover:bg-border/30 transition-colors text-muted hover:text-(--color-text)"
          aria-label="Retour vue nationale"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-(--color-text) truncate">
            {commune?.name ?? 'Commune'}
          </h2>
          {aggregate && (
            <p className="text-xs text-muted">
              {aggregate.total} observation{aggregate.total !== 1 ? 's' : ''}
              {aggregate.last7Days > 0 && ` · ${aggregate.last7Days} ce mois`}
            </p>
          )}
        </div>
      </div>

      {/* Tabs : Réponses / Galerie */}
      <div className="flex gap-0.5 mx-3 my-2 p-0.5 rounded-xl bg-black/5 shrink-0">
        <PanelTab
          active={communePanel === 'list'}
          onClick={() => setCommunePanel('list')}
          icon={<ListChecks className="size-3.5" />}
          label="Réponses"
        />
        <PanelTab
          active={communePanel === 'gallery'}
          onClick={() => setCommunePanel('gallery')}
          icon={<Images className="size-3.5" />}
          label="Galerie"
        />
      </div>

      {communePanel === 'gallery' ? (
        <GalleryGrid filters={galleryFilters} />
      ) : (
        <>
          {/* Aggregate stats */}
          {aggregate && (
            <div className="px-4 py-3 border-b border-border/40 space-y-2 shrink-0">
              {/* Top forms */}
              {aggregate.topForms.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-muted uppercase tracking-wide mb-1.5">
                    Formulaires principaux
                  </p>
                  <ul className="space-y-1">
                    {aggregate.topForms.slice(0, 3).map((f) => (
                      <li key={f.formId} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-(--color-text) truncate">{f.title}</span>
                        <span className="text-xs font-mono text-muted shrink-0">{f.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Categories */}
              {Object.keys(aggregate.byCategory).length > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-muted uppercase tracking-wide mb-1.5">
                    Par catégorie
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(aggregate.byCategory).map(([cat, count]) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 text-[11px] text-muted bg-border/30 rounded-full px-2 py-0.5"
                      >
                        {CATEGORY_LABEL[cat as keyof typeof CATEGORY_LABEL] ?? cat}
                        <span className="font-mono">{count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Observation list */}
          <div className="flex flex-col min-h-0 flex-1">
            <div className="px-4 py-2 border-b border-border/40 shrink-0">
              <p className="text-xs text-muted">
                {communeObs.length} observation{communeObs.length !== 1 ? 's' : ''} dans la zone
              </p>
            </div>
            <ObservationList features={communeObs} />
          </div>
        </>
      )}
    </aside>
  );
}

function PanelTab({
  active, onClick, icon, label,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium transition-all',
        active
          ? 'bg-white text-primary shadow-sm'
          : 'text-muted hover:text-(--color-text)',
      )}
    >
      {icon}
      {label}
    </button>
  );
}
