import { useCallback, useState } from 'react';
import { compressImage } from '@/shared/lib/image';
import { captureGps } from '../lib/captureGps';
import { addInstantPhoto } from '../lib/instantPhotos';
import type { GeoFix } from './useGeoWatch';

export type CaptureStatus = 'idle' | 'capturing' | 'saved' | 'error';

/**
 * Capture une photo (caméra) + la géolocalisation au même instant, puis
 * l'enregistre hors‑ligne. Utilise en priorité la position « chaude » fournie
 * par le suivi (`useGeoWatch`) pour un géotag immédiat ; à défaut, demande une
 * position ponctuelle. La photo est sauvegardée même sans position.
 */
export function useInstantCapture(onSaved?: (photoId: string) => void) {
  const [status, setStatus] = useState<CaptureStatus>('idle');
  const [geoDenied, setGeoDenied] = useState(false);

  const handleFile = useCallback(async (file: File, warmFix?: GeoFix | null) => {
    setStatus('capturing');
    setGeoDenied(false);
    try {
      // Position chaude immédiate, sinon demande ponctuelle — en parallèle de la compression
      const [geo, blob] = await Promise.all([
        warmFix ? Promise.resolve(warmFix) : captureGps(),
        compressImage(file),
      ]);
      if (!geo) setGeoDenied(true);
      const photoId = await addInstantPhoto({
        blob,
        contentType: 'image/jpeg',
        lat: geo?.lat,
        lng: geo?.lng,
        accuracyMeters: geo?.accuracyMeters,
        locationSource: geo ? 'GPS' : undefined,
      });
      setStatus('saved');
      onSaved?.(photoId);
    } catch {
      setStatus('error');
    }
  }, [onSaved]);

  const reset = useCallback(() => setStatus('idle'), []);

  return { status, geoDenied, handleFile, reset };
}
