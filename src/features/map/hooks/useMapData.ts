import { useQuery } from '@tanstack/react-query';
import { mapApi, type MapFilters } from '../api/mapApi';

const EMPTY_FC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

export function useMapData(filters?: MapFilters) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['map-observations', filters],
    queryFn: () => mapApi.getObservations(filters),
    staleTime: 30_000,
    placeholderData: EMPTY_FC,
  });
  return { data: data ?? EMPTY_FC, isLoading, isError };
}
