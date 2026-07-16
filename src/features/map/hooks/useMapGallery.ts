import { useQuery } from '@tanstack/react-query';
import { mapApi, type MapFilters } from '../api/mapApi';

/** Galerie photos d'une zone / commune (réutilise les filtres carte). */
export function useMapGallery(filters: MapFilters, enabled = true) {
  return useQuery({
    queryKey: ['map-gallery', filters],
    queryFn: () => mapApi.getGallery(filters),
    enabled,
    staleTime: 30_000,
  });
}
