import { Source, Layer } from 'react-map-gl/maplibre';
import { communesFillLayer, communesLineLayer } from '../lib/layerSpecs';

interface Props {
  data: GeoJSON.FeatureCollection;
}

/**
 * Polygones des communes pilotes. Le hover/sélection passe par feature-state
 * (géré imperativement dans ObservatoryMap — aucun re-render React sur mousemove).
 */
export function CommuneLayer({ data }: Props) {
  return (
    <Source id="communes" type="geojson" data={data} promoteId="id">
      <Layer {...communesFillLayer} />
      <Layer {...communesLineLayer} />
    </Source>
  );
}
