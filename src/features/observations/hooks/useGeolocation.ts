import { useState, useCallback } from 'react';

export type GeoStatus = 'idle' | 'locating' | 'ok' | 'error' | 'denied';

export interface GeoState {
  status: GeoStatus;
  lat?: number;
  lng?: number;
  accuracy?: number;
  error?: string;
  source?: 'GPS' | 'MANUAL';
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ status: 'idle' });

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: 'error', error: 'Géolocalisation non supportée par ce navigateur' });
      return;
    }
    setState({ status: 'locating' });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState({
          status: 'ok',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          source: 'GPS',
        }),
      (err) => {
        if (err.code === 1 /* PERMISSION_DENIED */) {
          setState({ status: 'denied' });
        } else {
          setState({ status: 'error', error: err.message });
        }
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  }, []);

  const setManual = useCallback((lat: number, lng: number) => {
    setState({ status: 'ok', lat, lng, accuracy: undefined, source: 'MANUAL' });
  }, []);

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { ...state, locate, setManual, reset };
}
