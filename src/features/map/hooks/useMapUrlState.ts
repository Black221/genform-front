import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { useMapStore, type DisplayMode } from '../store/mapStore';
import type { MapFilters, ObservationStatus } from '../api/mapApi';

const DISPLAY_MODES: DisplayMode[] = ['points', 'heatmap', 'choropleth'];

/**
 * Synchronisation URL ↔ mapStore (deep-linking UC-M9) :
 * lecture au mount (/map?commune=…&obs=…&form=…&category=…&status=…&from=…&to=…&mode=…),
 * écriture debouncée (replace, pas de pollution de l'historique).
 */
export function useMapUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialized = useRef(false);

  // ── Lecture initiale URL → store ──────────────────────────────────────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const commune = searchParams.get('commune');
    const obs = searchParams.get('obs');
    const mode = searchParams.get('mode') as DisplayMode | null;

    const filters: MapFilters = {};
    const form = searchParams.get('form');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (form) filters.formId = form;
    if (category) filters.category = category;
    if (status) filters.status = status as ObservationStatus;
    if (from) filters.from = from;
    if (to) filters.to = to;

    const store = useMapStore.getState();
    if (Object.keys(filters).length) store.setFilters(filters);
    if (mode && DISPLAY_MODES.includes(mode)) store.setDisplayMode(mode);
    if (commune) store.selectCommune(commune);
    if (obs) store.selectObservation(obs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Écriture store → URL (debounce 300 ms) ────────────────────────────────
  const selectedCommuneId = useMapStore((s) => s.selectedCommuneId);
  const selectedObservationId = useMapStore((s) => s.selectedObservationId);
  const displayMode = useMapStore((s) => s.displayMode);
  const filters = useMapStore((s) => s.filters);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (selectedCommuneId) params.set('commune', selectedCommuneId);
      if (selectedObservationId) params.set('obs', selectedObservationId);
      if (displayMode !== 'points') params.set('mode', displayMode);
      if (filters.formId) params.set('form', filters.formId);
      if (filters.category) params.set('category', filters.category);
      if (filters.status) params.set('status', filters.status);
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);
      setSearchParams(params, { replace: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedCommuneId, selectedObservationId, displayMode, filters, setSearchParams]);
}
