import { useCallback, useEffect, useRef } from 'react';
import Map, {
  NavigationControl,
  type MapRef,
  type MapMouseEvent,
} from 'react-map-gl/maplibre';
import type { GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAP_STYLE, INITIAL_VIEW, PILOT_BOUNDS } from '../lib/mapStyle';
import { featureBbox } from '../lib/geo';
import { useMapStore } from '../store/mapStore';
import { CommuneLayer } from './CommuneLayer';
import { ObservationsLayer } from './ObservationsLayer';
import { HeatmapLayer } from './HeatmapLayer';
import { ChoroplethLayer } from './ChoroplethLayer';
import { CommuneTooltip, type CommuneTooltipHandle } from './CommuneTooltip';

interface Props {
  communes: GeoJSON.FeatureCollection;
  observations: GeoJSON.FeatureCollection;
}

/** Padding du fitBounds : laisse la place à la sidebar (desktop) / bottom sheet (mobile). */
function communePadding() {
  const desktop = typeof window !== 'undefined' && window.innerWidth >= 768;
  return desktop
    ? { top: 90, left: 40, bottom: 40, right: 420 }
    : { top: 80, left: 24, bottom: window.innerHeight * 0.45, right: 24 };
}

export function ObservatoryMap({ communes, observations }: Props) {
  const mapRef = useRef<MapRef>(null);
  const tooltipRef = useRef<CommuneTooltipHandle>(null);
  const hoveredCommuneRef = useRef<string | null>(null);
  const hoveredPointRef = useRef<string | number | null>(null);

  const view = useMapStore((s) => s.view);
  const selectedCommuneId = useMapStore((s) => s.selectedCommuneId);
  const selectedObservationId = useMapStore((s) => s.selectedObservationId);
  const hoveredObservationId = useMapStore((s) => s.hoveredObservationId);
  const displayMode = useMapStore((s) => s.displayMode);
  const selectCommune = useMapStore((s) => s.selectCommune);
  const selectObservation = useMapStore((s) => s.selectObservation);
  const setHoveredObservation = useMapStore((s) => s.setHoveredObservation);

  const showPoints = displayMode !== 'heatmap';
  const showChoropleth = displayMode === 'choropleth' && view === 'national';

  // ── feature-state communes : selected / dimmed ─────────────────────────────
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !map.getSource('communes')) return;
    for (const feature of communes.features) {
      const id = (feature.properties as { id?: string })?.id;
      if (!id) continue;
      map.setFeatureState(
        { source: 'communes', id },
        {
          selected: id === selectedCommuneId,
          dimmed: selectedCommuneId !== null && id !== selectedCommuneId,
        },
      );
    }
  }, [selectedCommuneId, communes]);

  // ── feature-state observations : highlight (hover liste) / selected ────────
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !map.getSource('observations')) return;
    if (hoveredPointRef.current !== null && hoveredPointRef.current !== hoveredObservationId) {
      map.setFeatureState(
        { source: 'observations', id: hoveredPointRef.current },
        { highlight: false },
      );
    }
    if (hoveredObservationId) {
      map.setFeatureState(
        { source: 'observations', id: hoveredObservationId },
        { highlight: true },
      );
    }
    hoveredPointRef.current = hoveredObservationId;
  }, [hoveredObservationId]);

  const prevSelectedObsRef = useRef<string | null>(null);
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !map.getSource('observations')) return;
    if (prevSelectedObsRef.current) {
      map.setFeatureState(
        { source: 'observations', id: prevSelectedObsRef.current },
        { selected: false },
      );
    }
    if (selectedObservationId) {
      map.setFeatureState(
        { source: 'observations', id: selectedObservationId },
        { selected: true },
      );
    }
    prevSelectedObsRef.current = selectedObservationId;
  }, [selectedObservationId, observations]);

  // ── flyTo : commune sélectionnée / retour national ──────────────────────────
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    if (view === 'commune' && selectedCommuneId) {
      const feature = communes.features.find(
        (f) => (f.properties as { id?: string })?.id === selectedCommuneId,
      );
      const bbox = feature ? featureBbox(feature) : null;
      if (bbox) {
        map.fitBounds(
          [[bbox[0], bbox[1]], [bbox[2], bbox[3]]],
          { padding: communePadding(), duration: 900 },
        );
      }
    } else if (view === 'national') {
      map.fitBounds(
        [[PILOT_BOUNDS[0], PILOT_BOUNDS[1]], [PILOT_BOUNDS[2], PILOT_BOUNDS[3]]],
        { padding: 40, duration: 700 },
      );
    }
  }, [view, selectedCommuneId, communes]);

  // ── Interactions ────────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: MapMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const layers: string[] = [];
    if (map.getLayer('communes-fill')) layers.push('communes-fill');
    if (map.getLayer('clusters')) layers.push('clusters');
    if (map.getLayer('points')) layers.push('points');
    if (!layers.length) return;
    const features = map.queryRenderedFeatures(e.point, { layers });

    const pointFeature = features.find((f) => f.layer.id === 'points' || f.layer.id === 'clusters');
    const communeFeature = features.find((f) => f.layer.id === 'communes-fill');

    map.getCanvas().style.cursor = pointFeature || communeFeature ? 'pointer' : '';

    // Tooltip + hover de commune uniquement en vue nationale
    const store = useMapStore.getState();
    const communeId = store.view === 'national' && communeFeature
      ? String((communeFeature.properties as { id?: string })?.id ?? '')
      : null;

    if (hoveredCommuneRef.current && hoveredCommuneRef.current !== communeId) {
      map.setFeatureState(
        { source: 'communes', id: hoveredCommuneRef.current },
        { hover: false },
      );
    }
    if (communeId && hoveredCommuneRef.current !== communeId) {
      map.setFeatureState({ source: 'communes', id: communeId }, { hover: true });
    }
    hoveredCommuneRef.current = communeId;

    if (communeId && communeFeature) {
      const props = communeFeature.properties as { name?: string; responseCount?: number };
      tooltipRef.current?.show(e.point.x, e.point.y, props.name ?? '', props.responseCount ?? 0);
    } else {
      tooltipRef.current?.hide();
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map && hoveredCommuneRef.current) {
      map.setFeatureState(
        { source: 'communes', id: hoveredCommuneRef.current },
        { hover: false },
      );
      hoveredCommuneRef.current = null;
    }
    tooltipRef.current?.hide();
  }, []);

  const handleClick = useCallback(async (e: MapMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // 1. Cluster → zoom expand
    if (map.getLayer('clusters')) {
      const clusters = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      if (clusters.length) {
        const clusterId = clusters[0].properties?.cluster_id as number;
        const source = map.getSource('observations') as GeoJSONSource;
        try {
          const zoom = await source.getClusterExpansionZoom(clusterId);
          const geom = clusters[0].geometry as GeoJSON.Point;
          map.easeTo({ center: geom.coordinates as [number, number], zoom });
        } catch { /* ignore */ }
        return;
      }
    }

    // 2. Point → ÉTAT 3 (détail)
    if (map.getLayer('points')) {
      const points = map.queryRenderedFeatures(e.point, { layers: ['points'] });
      if (points.length) {
        const id = (points[0].properties as { id?: string })?.id;
        if (id) selectObservation(id);
        return;
      }
    }

    // 3. Polygone commune (vue nationale uniquement — UC-M3) ; en vue commune,
    //    un clic ailleurs ne fait rien (évite les sorties accidentelles)
    if (useMapStore.getState().view === 'national' && map.getLayer('communes-fill')) {
      const communesHit = map.queryRenderedFeatures(e.point, { layers: ['communes-fill'] });
      if (communesHit.length) {
        const id = (communesHit[0].properties as { id?: string })?.id;
        if (id) {
          tooltipRef.current?.hide();
          if (hoveredCommuneRef.current) {
            map.setFeatureState(
              { source: 'communes', id: hoveredCommuneRef.current },
              { hover: false },
            );
            hoveredCommuneRef.current = null;
          }
          selectCommune(id);
        }
      }
    }
  }, [selectCommune, selectObservation]);

  return (
    <div className="absolute inset-0">
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        mapStyle={MAP_STYLE as never}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseOut={handleMouseLeave}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="bottom-left" />

        {showChoropleth && <ChoroplethLayer communes={communes} />}
        <CommuneLayer data={communes} />

        {displayMode === 'heatmap' && <HeatmapLayer data={observations} />}
        {showPoints && (
          <ObservationsLayer
            data={observations}
            onHoverPoint={setHoveredObservation}
          />
        )}
      </Map>
      <CommuneTooltip ref={tooltipRef} />
    </div>
  );
}
