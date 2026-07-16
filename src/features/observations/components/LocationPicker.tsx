import { useState } from 'react';
import { cn } from '@/shared/lib/cn';

interface Props {
  onConfirm: (lat: number, lng: number) => void;
  onCancel?: () => void;
}

export function LocationPicker({ onConfirm, onCancel }: Props) {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    const la = parseFloat(lat);
    const lo = parseFloat(lng);
    if (isNaN(la) || la < -90 || la > 90) {
      setError('Latitude invalide (−90 à 90)');
      return;
    }
    if (isNaN(lo) || lo < -180 || lo > 180) {
      setError('Longitude invalide (−180 à 180)');
      return;
    }
    onConfirm(la, lo);
  };

  return (
    <div className="bg-white rounded-2xl border border-theme p-5 space-y-4 shadow-soft">
      <p className="text-sm font-semibold text-(--color-text)">Saisir les coordonnées</p>
      <p className="text-xs text-muted">
        Vous pouvez retrouver vos coordonnées GPS sur Google Maps en appuyant longuement sur un point.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted">Latitude</span>
          <input
            type="number"
            step="any"
            placeholder="ex. 14.6928"
            value={lat}
            onChange={(e) => { setLat(e.target.value); setError(''); }}
            className={cn(
              'rounded-xl border border-theme px-3 py-2 text-sm text-(--color-text) bg-white',
              'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
            )}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted">Longitude</span>
          <input
            type="number"
            step="any"
            placeholder="ex. −17.4467"
            value={lng}
            onChange={(e) => { setLng(e.target.value); setError(''); }}
            className={cn(
              'rounded-xl border border-theme px-3 py-2 text-sm text-(--color-text) bg-white',
              'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
            )}
          />
        </label>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl border border-theme text-sm text-muted hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
        )}
        <button
          onClick={handleConfirm}
          className="flex-1 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Confirmer
        </button>
      </div>
    </div>
  );
}
