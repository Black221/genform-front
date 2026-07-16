/** Helpers géo du module carte. */

export type Bbox = [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]

/** bbox d'une commune depuis ses properties (fallback : calcul sur la géométrie). */
export function featureBbox(feature: GeoJSON.Feature): Bbox | null {
  const fromProps = (feature.properties as { bbox?: Bbox } | null)?.bbox;
  if (fromProps && fromProps.length === 4) return fromProps;
  if (!feature.geometry || feature.geometry.type === 'GeometryCollection') return null;

  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  const visit = (coords: unknown): void => {
    if (typeof (coords as number[])[0] === 'number') {
      const [lng, lat] = coords as [number, number];
      minLng = Math.min(minLng, lng); maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
    } else {
      (coords as unknown[]).forEach(visit);
    }
  };
  visit((feature.geometry as GeoJSON.Polygon).coordinates);
  return Number.isFinite(minLng) ? [minLng, minLat, maxLng, maxLat] : null;
}

/** Formatage "14.72083, -17.17861" → affichage panneau détail. */
export function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
