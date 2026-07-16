import { useQuery } from '@tanstack/react-query';
import { mapApi } from '../api/mapApi';

export function useObservationDetail(observationId: string | null) {
  return useQuery({
    queryKey: ['map-observation-detail', observationId],
    queryFn: () => mapApi.getObservationDetail(observationId!),
    enabled: !!observationId,
    staleTime: 60_000,
  });
}
