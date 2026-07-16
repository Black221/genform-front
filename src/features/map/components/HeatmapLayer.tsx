import { Source, Layer } from 'react-map-gl/maplibre';
import { heatmapLayer } from '../lib/layerSpecs';

interface Props {
  data: GeoJSON.FeatureCollection;
}

export function HeatmapLayer({ data }: Props) {
  return (
    <Source id="observations" type="geojson" data={data}>
      <Layer {...heatmapLayer} />
    </Source>
  );
}
