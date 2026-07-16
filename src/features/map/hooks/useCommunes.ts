import { useQuery } from '@tanstack/react-query';
import { mapApi, type CommuneProperties } from '../api/mapApi';

const EMPTY_FC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

/** Géométries des communes pilotes — quasi statiques (cache 24 h, aligné Cache-Control serveur). */
export function useCommunes() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['map-communes'],
    queryFn: mapApi.getCommunes,
    staleTime: 1000 * 60 * 5,   // 5 min — aligné sur Cache-Control serveur
    gcTime: 1000 * 60 * 60,    // 1 h
  });

  const fc = data ?? EMPTY_FC;
  if (import.meta.env.DEV) {
    console.log('[useCommunes]', fc.features.length, 'features', isError ? 'ERROR' : '');
  }

  const communes = fc.features
    .map((f) => f.properties as unknown as CommuneProperties)
    .filter(Boolean);

  return { data: fc, communes, isLoading, isError };
}
