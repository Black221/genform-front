import { useEffect, useRef, useState } from 'react';
import { useMapStore } from '../../store/mapStore';
import { ObservationItem } from './ObservationItem';

const PAGE_SIZE = 30;

interface Props {
  features: GeoJSON.Feature[];
}

export function ObservationList({ features }: Props) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const selectedObservationId = useMapStore((s) => s.selectedObservationId);
  const hoveredObservationId = useMapStore((s) => s.hoveredObservationId);
  const selectObservation = useMapStore((s) => s.selectObservation);
  const setHoveredObservation = useMapStore((s) => s.setHoveredObservation);

  // Reset page when features change (filter change)
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [features]);

  // IntersectionObserver to load more
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisibleCount((n) => n + PAGE_SIZE); },
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const visible = features.slice(0, visibleCount);

  if (!features.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <svg viewBox="0 0 48 48" className="size-10 text-muted/40 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="24" cy="24" r="18" />
          <path d="M24 16v8M24 32h.01" strokeLinecap="round" />
        </svg>
        <p className="text-sm text-muted">Aucune observation dans cette zone</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto flex-1">
      {visible.map((feature) => {
        const id = (feature.properties as { id?: string })?.id ?? '';
        return (
          <ObservationItem
            key={id}
            feature={feature}
            selected={id === selectedObservationId}
            hovered={id === hoveredObservationId}
            onClick={() => selectObservation(id)}
            onMouseEnter={() => setHoveredObservation(id)}
            onMouseLeave={() => setHoveredObservation(null)}
          />
        );
      })}
      {visibleCount < features.length && (
        <div ref={sentinelRef} className="h-8 flex items-center justify-center">
          <span className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}
