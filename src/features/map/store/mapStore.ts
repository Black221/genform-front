import { create } from 'zustand';
import type { MapFilters } from '../api/mapApi';

export type MapView = 'national' | 'commune';
export type DisplayMode = 'points' | 'heatmap' | 'choropleth';
/** Onglet du panneau commune : liste de réponses ou galerie photos. */
export type CommunePanel = 'list' | 'gallery';

interface MapState {
  view: MapView;
  selectedCommuneId: string | null;
  selectedObservationId: string | null;
  /** Observation survolée (liste ↔ carte, feature-state) */
  hoveredObservationId: string | null;
  displayMode: DisplayMode;
  /** Onglet actif du panneau commune (réponses / galerie) */
  communePanel: CommunePanel;
  filters: MapFilters;

  selectCommune: (communeId: string) => void;
  backToNational: () => void;
  selectObservation: (observationId: string | null) => void;
  setHoveredObservation: (observationId: string | null) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setCommunePanel: (panel: CommunePanel) => void;
  setFilters: (filters: MapFilters) => void;
  patchFilters: (patch: Partial<MapFilters>) => void;
}

export const useMapStore = create<MapState>((set) => ({
  view: 'national',
  selectedCommuneId: null,
  selectedObservationId: null,
  hoveredObservationId: null,
  displayMode: 'points',
  communePanel: 'list',
  filters: {},

  selectCommune: (communeId) =>
    set({ view: 'commune', selectedCommuneId: communeId, selectedObservationId: null }),

  backToNational: () =>
    set({
      view: 'national',
      selectedCommuneId: null,
      selectedObservationId: null,
      hoveredObservationId: null,
    }),

  selectObservation: (observationId) => set({ selectedObservationId: observationId }),
  setCommunePanel: (communePanel) => set({ communePanel }),
  setHoveredObservation: (observationId) => set({ hoveredObservationId: observationId }),
  setDisplayMode: (displayMode) => set({ displayMode }),
  setFilters: (filters) => set({ filters }),
  patchFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
}));
