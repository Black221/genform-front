import { useQuery } from '@tanstack/react-query';
import { mapApi } from '../api/mapApi';

export function useCommuneAggregate(communeId: string | null) {
  return useQuery({
    queryKey: ['map-commune-aggregate', communeId],
    queryFn: () => mapApi.getCommuneAggregate(communeId!),
    enabled: !!communeId,
    staleTime: 60_000,
  });
}
