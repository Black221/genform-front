import { useEffect, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { useGeolocation } from '../hooks/useGeolocation';
import { LocationPicker } from './LocationPicker';

interface Props {
  onContinue: (geo: ReturnType<typeof useGeolocation>) => void;
}

export function GeotagStep({ onContinue }: Props) {
  const geo = useGeolocation();
  const [showManual, setShowManual] = useState(false);

  // Auto-start GPS on mount
  useEffect(() => {
    geo.locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canContinue = geo.status === 'ok' || geo.status === 'idle' || geo.status === 'error' || geo.status === 'denied';

  return (
    <div className="flex flex-col min-h-full bg-app">
      {/* Hero */}
      <div className="bg-hero wax-pattern px-6 pt-10 pb-8 text-white rounded-b-3xl">
        <div className="size-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
          <IconPin className="size-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Géolocalisation</h1>
        <p className="text-sm text-white/80 mt-1">
          Localisez votre observation pour l'ajouter à la carte
        </p>
      </div>

      {/* Status card */}
      <div className="flex-1 px-4 py-6 space-y-4">
        {geo.status === 'idle' && (
          <StatusCard color="gray" icon={<IconPin className="size-5" />} title="Prêt à localiser">
            La localisation démarre automatiquement.
          </StatusCard>
        )}

        {geo.status === 'locating' && (
          <StatusCard color="blue" icon={<Spinner />} title="Localisation en cours…">
            Recherche du signal GPS, veuillez patienter.
          </StatusCard>
        )}

        {geo.status === 'ok' && (
          <StatusCard color="green" icon={<IconCheck className="size-5" />} title="Position capturée">
            <span className="font-mono text-xs">
              {geo.lat?.toFixed(6)}, {geo.lng?.toFixed(6)}
            </span>
            {geo.accuracy && (
              <span className="text-xs text-muted ml-2">±{Math.round(geo.accuracy)} m</span>
            )}
          </StatusCard>
        )}

        {(geo.status === 'error' || geo.status === 'denied') && (
          <StatusCard color="orange" icon={<IconWarn className="size-5" />} title={
            geo.status === 'denied' ? 'Accès refusé' : 'Impossible de localiser'
          }>
            {geo.status === 'denied'
              ? "Accès à la localisation refusé. Activez-le dans les paramètres de votre navigateur."
              : geo.error}
          </StatusCard>
        )}

        {/* Manual picker */}
        {(geo.status === 'error' || geo.status === 'denied') && !showManual && (
          <button
            onClick={() => setShowManual(true)}
            className="w-full py-3 rounded-xl border border-theme text-sm font-medium text-(--color-text) hover:bg-primary/5 transition-colors"
          >
            Saisir les coordonnées manuellement
          </button>
        )}

        {showManual && (
          <LocationPicker
            onConfirm={(lat, lng) => { geo.setManual(lat, lng); setShowManual(false); }}
            onCancel={() => setShowManual(false)}
          />
        )}

        {/* Retry */}
        {(geo.status === 'error') && !showManual && (
          <button
            onClick={() => geo.locate()}
            className="w-full py-3 rounded-xl border border-theme text-sm font-medium text-muted hover:bg-primary/5 transition-colors"
          >
            Réessayer
          </button>
        )}
      </div>

      {/* Actions */}
      <div className={cn('px-4 pb-8 space-y-3', !canContinue && 'opacity-60 pointer-events-none')}>
        <button
          onClick={() => onContinue(geo)}
          disabled={!canContinue}
          className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-warm"
        >
          Continuer
        </button>
        {geo.status !== 'ok' && canContinue && (
          <button
            onClick={() => onContinue({ ...geo, status: 'idle' })}
            className="w-full py-2.5 text-sm text-muted hover:text-(--color-text) transition-colors"
          >
            Continuer sans géolocaliser
          </button>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusCard({
  color,
  icon,
  title,
  children,
}: {
  color: 'gray' | 'blue' | 'green' | 'orange';
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}) {
  const palette = {
    gray: 'bg-gray-50 border-gray-200 text-gray-600',
    blue: 'bg-sky-50 border-sky-200 text-sky-700',
    green: 'bg-(--brand-green-light) border-(--brand-green) text-(--brand-green-dark)',
    orange: 'bg-(--brand-teranga-light) border-(--brand-teranga) text-teranga',
  };
  return (
    <div className={cn('flex gap-3 p-4 rounded-2xl border', palette[color])}>
      <span className="shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="font-semibold text-sm">{title}</p>
        {children && <div className="text-xs mt-0.5 opacity-90">{children}</div>}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span className="size-5 rounded-full border-2 border-sky-400 border-t-transparent animate-spin inline-block" />
  );
}

function IconPin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconWarn({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
