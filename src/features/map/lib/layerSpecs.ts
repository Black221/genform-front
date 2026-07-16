import type { LayerSpecification } from 'react-map-gl/maplibre';
import { CATEGORY_COLOR } from '@/shared/lib/formCategories';

/** Couleur de point par catégorie (expression match réutilisée points + légende). */
export const CATEGORY_MATCH_EXPRESSION = [
  'match', ['get', 'category'],
  'AIR', CATEGORY_COLOR.AIR,
  'EAU', CATEGORY_COLOR.EAU,
  'SOLS', CATEGORY_COLOR.SOLS,
  'SANTE', CATEGORY_COLOR.SANTE,
  'INONDATION', CATEGORY_COLOR.INONDATION,
  'POLLUTION', CATEGORY_COLOR.POLLUTION,
  'URBANISATION', CATEGORY_COLOR.URBANISATION,
  CATEGORY_COLOR.AUTRE,
] as unknown as string;

// ── Communes — hover/sélection via feature-state (zéro re-render React) ──────

export const communesFillLayer: LayerSpecification = {
  id: 'communes-fill',
  type: 'fill',
  source: 'communes',
  paint: {
    'fill-color': ['coalesce', ['get', 'color'], '#0B6E63'],
    'fill-opacity': [
      'case',
      ['boolean', ['feature-state', 'selected'], false], 0.08,
      ['boolean', ['feature-state', 'dimmed'], false], 0.05,
      ['boolean', ['feature-state', 'hover'], false], 0.45,
      0.25,
    ],
  },
};

export const communesLineLayer: LayerSpecification = {
  id: 'communes-line',
  type: 'line',
  source: 'communes',
  paint: {
    'line-color': ['coalesce', ['get', 'color'], '#0B6E63'],
    'line-width': [
      'case',
      ['boolean', ['feature-state', 'selected'], false], 4,
      ['boolean', ['feature-state', 'hover'], false], 3.5,
      2.5,
    ],
    'line-opacity': ['case', ['boolean', ['feature-state', 'dimmed'], false], 0.4, 1],
  },
};

/** Choroplèthe (vue nationale) : intensité = nb d'observations. Stops injectés dynamiquement. */
export function choroplethFillLayer(maxCount: number): LayerSpecification {
  const max = Math.max(maxCount, 1);
  return {
    id: 'communes-choropleth',
    type: 'fill',
    source: 'communes',
    paint: {
      'fill-color': [
        'interpolate', ['linear'], ['get', 'responseCount'],
        0, '#f1f5f4',
        max * 0.25, '#9ad0c8',
        max * 0.5, '#4da89b',
        max, '#0B6E63',
      ],
      'fill-opacity': 0.75,
    },
  };
}

// ── Observations — clustering natif MapLibre ─────────────────────────────────

export const clustersLayer: LayerSpecification = {
  id: 'clusters',
  type: 'circle',
  source: 'observations',
  filter: ['has', 'point_count'],
  paint: {
    'circle-radius': ['step', ['get', 'point_count'], 16, 25, 22, 100, 28],
    'circle-color': '#2563eb',
    'circle-opacity': 0.85,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#fff',
  },
};

export const clusterCountLayer: LayerSpecification = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'observations',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-size': 12,
  },
  paint: { 'text-color': '#fff' },
};

export const pointsLayer: LayerSpecification = {
  id: 'points',
  type: 'circle',
  source: 'observations',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': CATEGORY_MATCH_EXPRESSION as never,
    'circle-radius': [
      'case',
      ['boolean', ['feature-state', 'selected'], false], 10,
      ['boolean', ['feature-state', 'highlight'], false], 9,
      6,
    ],
    'circle-stroke-width': [
      'case',
      ['boolean', ['feature-state', 'selected'], false], 3,
      1.5,
    ],
    'circle-stroke-color': '#fff',
    'circle-opacity': 0.92,
  },
};

/** Halo du point sélectionné (ÉTAT 3). */
export const selectedHaloLayer: LayerSpecification = {
  id: 'selected-halo',
  type: 'circle',
  source: 'observations',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-radius': ['case', ['boolean', ['feature-state', 'selected'], false], 18, 0],
    'circle-color': '#2563eb',
    'circle-opacity': 0.2,
  },
};

// ── Heatmap (toggle, ÉTAT 1/2) ───────────────────────────────────────────────

export const heatmapLayer: LayerSpecification = {
  id: 'observations-heatmap',
  type: 'heatmap',
  source: 'observations',
  paint: {
    'heatmap-weight': 1,
    'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 6, 0.7, 14, 2],
    'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 6, 14, 14, 28],
    'heatmap-color': [
      'interpolate', ['linear'], ['heatmap-density'],
      0, 'rgba(11,110,99,0)',
      0.2, '#9ad0c8',
      0.45, '#facc15',
      0.7, '#E87722',
      1, '#E31B23',
    ],
    'heatmap-opacity': 0.8,
  },
};
