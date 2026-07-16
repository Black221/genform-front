import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { mapApi, type MapFilters } from '../api/mapApi';

const EMPTY_FC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

/**
 * Observations GeoJSON filtrées. keepPreviousData évite le clignotement
 * de la carte au changement de filtre/commune.
 */
export function useMapObservations(filters: MapFilters) {
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['map-observations', filters],
    queryFn: () => mapApi.getObservations(filters),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
  return { data: data ?? EMPTY_FC, isLoading, isFetching, isError };
}
