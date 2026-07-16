import { Layer } from 'react-map-gl/maplibre';
import { choroplethFillLayer } from '../lib/layerSpecs';

interface Props {
  communes: GeoJSON.FeatureCollection;
}

/** Couche choroplèthe sur la source "communes" (déjà montée par CommuneLayer). */
export function ChoroplethLayer({ communes }: Props) {
  const maxCount = Math.max(
    ...communes.features.map((f) => Number((f.properties as Record<string, unknown>)?.responseCount ?? 0)),
    1,
  );
  return <Layer {...choroplethFillLayer(maxCount)} />;
}
