import { useState, useCallback, useRef } from 'react';
import Map, {
  Source,
  Layer,
  NavigationControl,
  GeolocateControl,
  type MapRef,
  type MapMouseEvent,
  type LayerSpecification,
} from 'react-map-gl/maplibre';
import type { GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ObservationPopup, type PopupInfo } from './ObservationPopup';
import { CATEGORY_COLOR } from '../api/mapApi';

// ── Free OSM raster style (no API key) ───────────────────────────────────────
const MAP_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  },
  layers: [{ id: 'osm-tiles', type: 'raster' as const, source: 'osm' }],
};

// ── Layer specs ───────────────────────────────────────────────────────────────
const clusterLayer: LayerSpecification = {
  id: 'clusters',
  type: 'circle',
  source: 'observations',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': ['step', ['get', 'point_count'], '#00853F', 10, '#E87722', 50, '#E31B23'],
    'circle-radius': ['step', ['get', 'point_count'], 20, 10, 28, 50, 36],
    'circle-opacity': 0.88,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#fff',
  },
};

const clusterCountLayer: LayerSpecification = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'observations',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-size': 12,
    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
  },
  paint: { 'text-color': '#fff' },
};

const unclusteredPointLayer: LayerSpecification = {
  id: 'unclustered-point',
  type: 'circle',
  source: 'observations',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': [
      'match',
      ['get', 'category'],
      'AIR', CATEGORY_COLOR.AIR,
      'EAU', CATEGORY_COLOR.EAU,
      'SOLS', CATEGORY_COLOR.SOLS,
      'SANTE', CATEGORY_COLOR.SANTE,
      'INONDATION', CATEGORY_COLOR.INONDATION,
      'POLLUTION', CATEGORY_COLOR.POLLUTION,
      'URBANISATION', CATEGORY_COLOR.URBANISATION,
      '#6B7570',
    ],
    'circle-radius': 8,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#fff',
    'circle-opacity': 0.92,
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  data: GeoJSON.FeatureCollection;
  loading?: boolean;
}

const INITIAL_VIEW = { longitude: -14.5, latitude: 14.5, zoom: 7 };

export function ObservationsMap({ data, loading }: Props) {
  const mapRef = useRef<MapRef>(null);
  const [popup, setPopup] = useState<PopupInfo | null>(null);

  const handleClick = useCallback(async (e: MapMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Cluster click → expand
    const clusterFeatures = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
    if (clusterFeatures.length > 0) {
      const clusterId = clusterFeatures[0].properties?.cluster_id as number;
      const source = map.getSource('observations') as GeoJSONSource;
      try {
        const zoom = await source.getClusterExpansionZoom(clusterId);
        const geom = clusterFeatures[0].geometry as GeoJSON.Point;
        map.easeTo({ center: geom.coordinates as [number, number], zoom });
      } catch { /* ignore */ }
      return;
    }

    // Individual point click → popup
    const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] });
    if (!features.length) { setPopup(null); return; }

    const geom = features[0].geometry as GeoJSON.Point;
    setPopup({
      longitude: geom.coordinates[0],
      latitude: geom.coordinates[1],
      properties: features[0].properties ?? {},
    });
  }, []);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-theme">
      {loading && (
        <div className="absolute inset-0 z-10 bg-white/60 flex items-center justify-center rounded-2xl">
          <div className="size-8 rounded-full border-2 border-(--color-primary) border-t-transparent animate-spin" />
        </div>
      )}

      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        mapStyle={MAP_STYLE as never}
        onClick={handleClick}
        style={{ width: '100%', height: '100%' }}
        interactiveLayerIds={['clusters', 'unclustered-point']}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" trackUserLocation />

        <Source
          id="observations"
          type="geojson"
          data={data}
          cluster
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>

        {popup && <ObservationPopup info={popup} onClose={() => setPopup(null)} />}
      </Map>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-xs space-y-1 shadow-soft border border-theme pointer-events-none">
        <p className="font-semibold text-(--color-text) mb-1">Clusters</p>
        {[
          { color: '#00853F', label: '< 10' },
          { color: '#E87722', label: '10 – 50' },
          { color: '#E31B23', label: '> 50' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
