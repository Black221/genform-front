/** Fond de carte OSM raster — gratuit, sans clé API. */
export const MAP_STYLE = {
  version: 8,
  // glyphs requis pour les layers symbol (compteurs de clusters, labels communes)
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
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

/** Emprise des 5 communes pilotes (zone Dakar/Diamniadio). */
export const PILOT_BOUNDS: [number, number, number, number] = [-17.45, 14.52, -16.88, 14.92];
/** Conservé pour référence géographique complète ; la vue "nationale" utilise PILOT_BOUNDS. */
export const SENEGAL_BOUNDS: [number, number, number, number] = [-17.65, 12.2, -11.3, 16.75];
/** Vue initiale : zone Dakar/Diamniadio centrée sur les 5 communes pilotes. */
export const INITIAL_VIEW = { longitude: -17.17, latitude: 14.71, zoom: 10.5 };
