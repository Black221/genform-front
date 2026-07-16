export interface CaptureGeo {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  locationSource: 'GPS';
}

/**
 * Capture la position GPS au moment de la prise de vue.
 * Fonctionne hors ligne (le GPS ne nécessite pas le réseau). Résout `null`
 * si la géolocalisation est indisponible ou refusée — la photo est tout de
 * même conservée.
 */
export function captureGps(timeoutMs = 12_000): Promise<CaptureGeo | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy,
          locationSource: 'GPS',
        }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 },
    );
  });
}
