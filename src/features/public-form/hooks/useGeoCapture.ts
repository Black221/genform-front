import { useState, useEffect } from 'react';

export interface GeoData {
  lat: number;
  lng: number;
  accuracyMeters: number;
  locationSource: 'GPS' | 'MANUAL';
}

// iOS Safari ne compte pas le timeout pendant que le dialogue de permission est affiché.
// Ce délai JS garantit que loading revient à false quoi qu'il arrive.
const FALLBACK_TIMEOUT_MS = 12_000;

export function useGeoCapture(enabled: boolean) {
  const [geo, setGeo] = useState<GeoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!enabled || !navigator.geolocation) return;
    let cancelled = false;
    setLoading(true);
    setFailed(false);

    const fallback = setTimeout(() => {
      if (!cancelled) {
        setFailed(true);
        setLoading(false);
      }
    }, FALLBACK_TIMEOUT_MS);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(fallback);
        if (cancelled) return;
        setGeo({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy,
          locationSource: 'GPS',
        });
        setLoading(false);
      },
      () => {
        clearTimeout(fallback);
        if (cancelled) return;
        setFailed(true);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 },
    );

    return () => {
      cancelled = true;
      clearTimeout(fallback);
    };
  }, [enabled]);

  return { geo, loading, failed };
}
