import { useState } from 'react';
import { useController } from 'react-hook-form';
import { MapPin, LocateFixed, Pencil } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { FieldProps } from '../fieldRegistry';

export interface LocationValue {
  lat: number;
  lng: number;
  source: 'GPS' | 'MANUAL';
}

export default function LocationField({ question, error, control }: FieldProps) {
  const { field } = useController({
    name: question.id,
    control: control as never,
    defaultValue: null,
  });

  const value = field.value as LocationValue | null;
  const [locating, setLocating] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [manualError, setManualError] = useState('');

  const handleGps = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        field.onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude, source: 'GPS' });
        setLocating(false);
        setShowManual(false);
      },
      () => { setLocating(false); setShowManual(true); },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  };

  const handleManual = () => {
    const la = parseFloat(manualLat);
    const lo = parseFloat(manualLng);
    if (isNaN(la) || la < -90 || la > 90) { setManualError('Latitude invalide (−90 à 90)'); return; }
    if (isNaN(lo) || lo < -180 || lo > 180) { setManualError('Longitude invalide (−180 à 180)'); return; }
    field.onChange({ lat: la, lng: lo, source: 'MANUAL' });
    setShowManual(false);
    setManualError('');
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-(--color-text)">
        {question.label}
        {question.required && <span className="text-red-400 ml-1">*</span>}
      </p>

      {value ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-theme border border-primary/30 bg-primary/5">
          <MapPin size={16} className="text-primary shrink-0" />
          <span className="text-sm text-(--color-text) flex-1">
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
            <span className="ml-2 text-xs text-muted">({value.source === 'GPS' ? 'GPS' : 'Manuel'})</span>
          </span>
          <button
            type="button"
            onClick={() => { field.onChange(null); setShowManual(false); }}
            className="p-1 text-muted hover:text-primary transition-colors"
            aria-label="Modifier"
          >
            <Pencil size={14} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleGps}
            disabled={locating}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-theme border text-sm font-medium transition-colors',
              'border-primary/40 text-primary hover:bg-primary/5',
              locating && 'opacity-60 cursor-wait',
            )}
          >
            <LocateFixed size={15} />
            {locating ? 'Localisation…' : 'Utiliser ma position'}
          </button>
          <button
            type="button"
            onClick={() => setShowManual((v) => !v)}
            className="px-4 py-2.5 rounded-theme border border-theme text-sm text-muted hover:text-(--color-text) transition-colors"
          >
            Saisir manuellement
          </button>
        </div>
      )}

      {showManual && !value && (
        <div className="space-y-3 p-4 rounded-theme border border-theme bg-surface">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted">Latitude</span>
              <input
                type="number" step="any" placeholder="ex. 14.6928"
                value={manualLat}
                onChange={(e) => { setManualLat(e.target.value); setManualError(''); }}
                className="rounded-theme border border-theme px-3 py-2 text-sm text-(--color-text) bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted">Longitude</span>
              <input
                type="number" step="any" placeholder="ex. −17.4467"
                value={manualLng}
                onChange={(e) => { setManualLng(e.target.value); setManualError(''); }}
                className="rounded-theme border border-theme px-3 py-2 text-sm text-(--color-text) bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
          </div>
          {manualError && <p className="text-xs text-red-500">{manualError}</p>}
          <button
            type="button"
            onClick={handleManual}
            className="w-full py-2 rounded-theme bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Confirmer
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
