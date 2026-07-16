import { useCallback, useEffect, useRef, useState } from 'react';

export type GeoWatchStatus =
  | 'idle'        // en attente d'une action utilisateur (iOS : prompt sur geste)
  | 'locating'    // demande en cours
  | 'active'      // position obtenue
  | 'denied'      // permission refusée
  | 'unavailable' // API absente
  | 'insecure';   // contexte non sécurisé (HTTP) — bloqué par le navigateur

export interface GeoFix {
  lat: number;
  lng: number;
  accuracyMeters?: number;
}

/** Le navigateur autorise la géoloc uniquement en contexte sécurisé (HTTPS / localhost). */
function isSecure(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.isSecureContext) return true;
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1' || h === '::1';
}

/**
 * Active et maintient la géolocalisation pour la capture.
 *
 * Gère tous les cas (notamment iOS Safari) :
 *  - contexte non sécurisé (HTTP) → `insecure` (le navigateur bloque),
 *  - API absente → `unavailable`,
 *  - permission refusée → `denied` (bouton de réactivation),
 *  - iOS : pas d'auto-prompt fiable sans geste → `enable()` est appelable sur tap.
 *
 * `enable()` doit idéalement être déclenché par un geste utilisateur.
 */
export function useGeoWatch() {
  const [status, setStatus] = useState<GeoWatchStatus>('idle');
  const [fix, setFix] = useState<GeoFix | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  const clear = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const enable = useCallback(() => {
    if (!isSecure()) { setStatus('insecure'); return; }
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setStatus('unavailable');
      return;
    }
    startedRef.current = true;
    setStatus((s) => (s === 'active' ? s : 'locating'));
    clear();

    // 1) Position immédiate (déclenche le prompt sur geste iOS)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFix({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracyMeters: pos.coords.accuracy });
        setStatus('active');
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setStatus('denied');
        // POSITION_UNAVAILABLE / TIMEOUT → on laisse le watch retenter
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
    );

    // 2) Suivi continu → garde une position « chaude » prête au déclenchement
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setFix({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracyMeters: pos.coords.accuracy });
        setStatus('active');
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setStatus('denied');
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 },
    );
  }, [clear]);

  useEffect(() => {
    if (!isSecure()) { setStatus('insecure'); return clear; }

    // La Permissions API n'est pas fiable sur iOS — best effort.
    if (navigator.permissions?.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName })
        .then((res) => {
          if (res.state === 'granted') enable();
          else if (res.state === 'denied') setStatus('denied');
          else setStatus('idle'); // 'prompt' → attendre un geste
          res.onchange = () => {
            if (res.state === 'granted') enable();
            else if (res.state === 'denied') setStatus('denied');
          };
        })
        .catch(() => { if (!startedRef.current) enable(); }); // pas d'API → tente directement
    } else {
      // iOS Safari : tenter une fois ; si le prompt nécessite un geste, le bouton prendra le relais.
      enable();
    }

    return clear;
  }, [enable, clear]);

  return { status, fix, enable };
}
