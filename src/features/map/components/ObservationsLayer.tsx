import { useEffect, useRef } from 'react';
import { Source, Layer, useMap } from 'react-map-gl/maplibre';
import {
  clustersLayer,
  clusterCountLayer,
  pointsLayer,
  selectedHaloLayer,
} from '../lib/layerSpecs';

interface Props {
  data: GeoJSON.FeatureCollection;
  /** Hover carte → liste (feature-state highlight côté liste). */
  onHoverPoint: (observationId: string | null) => void;
}

/** Points d'observations clusterisés (clustering GPU MapLibre, cluster:true). */
export function ObservationsLayer({ data, onHoverPoint }: Props) {
  const { current: map } = useMap();
  const hoveredRef = useRef<string | null>(null);

  // Hover point → synchronise l'item de liste (mousemove sur le layer points uniquement)
  useEffect(() => {
    const m = map?.getMap();
    if (!m) return;

    const onMove = (e: maplibregl.MapLayerMouseEvent) => {
      const id = e.features?.[0]?.properties?.id as string | undefined;
      if (id && id !== hoveredRef.current) {
        hoveredRef.current = id;
        onHoverPoint(id);
      }
    };
    const onLeave = () => {
      if (hoveredRef.current) {
        hoveredRef.current = null;
        onHoverPoint(null);
      }
    };

    m.on('mousemove', 'points', onMove);
    m.on('mouseleave', 'points', onLeave);
    return () => {
      m.off('mousemove', 'points', onMove);
      m.off('mouseleave', 'points', onLeave);
    };
  }, [map, onHoverPoint]);

  return (
    <Source
      id="observations"
      type="geojson"
      data={data}
      promoteId="id"
      cluster
      clusterMaxZoom={14}
      clusterRadius={48}
    >
      <Layer {...selectedHaloLayer} />
      <Layer {...clustersLayer} />
      <Layer {...clusterCountLayer} />
      <Layer {...pointsLayer} />
    </Source>
  );
}
