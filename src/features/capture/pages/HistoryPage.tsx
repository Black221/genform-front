import { Clock, CheckCircle2, XCircle, WifiOff, Camera, ImageOff } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { useOnlineStatus } from '@/features/offline/hooks/useOnlineStatus';
import { useLocalObservations, useDeviceResponses } from '../hooks/useCaptureData';
import type { DeviceResponseStatus } from '../api/captureApi';

const STATUS: Record<DeviceResponseStatus, { label: string; cls: string; Icon: typeof Clock }> = {
  PENDING:   { label: 'En attente', cls: 'bg-(--color-gold-soft) text-[#8a5a00]', Icon: Clock },
  VALIDATED: { label: 'Validée',    cls: 'bg-(--color-success-soft) text-success', Icon: CheckCircle2 },
  REJECTED:  { label: 'Rejetée',    cls: 'bg-(--color-danger-soft) text-danger',   Icon: XCircle },
};

function fmtDate(iso: string | number) {
  return new Date(iso).toLocaleDateString('fr-SN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function HistoryPage() {
  const online = useOnlineStatus();
  const { data: localPending = [] } = useLocalObservations();
  const { data: serverResponses = [], isLoading } = useDeviceResponses();

  const isEmpty = localPending.length === 0 && serverResponses.length === 0;

  return (
    <div className="p-4 pb-24 space-y-6">
      <div>
        <h1 className="font-display text-lg font-bold text-(--color-text)">Mes réponses</h1>
        <p className="text-sm text-muted mt-0.5">Vos signalements sur cet appareil</p>
      </div>

      {!online && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-(--color-gold-soft) text-[#8a5a00] text-xs">
          <WifiOff className="size-4 shrink-0" />
          Hors ligne — vos réponses seront synchronisées à la reconnexion.
        </div>
      )}

      {/* En attente de synchro (local) */}
      {localPending.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted">En attente de synchronisation</h2>
          {localPending.map((o) => (
            <div key={o.clientId} className="flex items-center gap-3 p-3 rounded-2xl bg-surface border border-theme">
              <span className="flex items-center justify-center size-10 rounded-xl bg-(--color-gold-soft) text-[#8a5a00] shrink-0">
                <Clock className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-(--color-text)">Réponse à synchroniser</p>
                <p className="text-xs text-muted">{fmtDate(o.createdAt)}{o.lat != null && ' · géolocalisée'}</p>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-(--color-gold-soft) text-[#8a5a00]">
                {o.status === 'syncing' ? 'Envoi…' : 'En attente'}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* Synchronisées (serveur) */}
      <section className="space-y-2">
        {serverResponses.length > 0 && (
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted">Synchronisées</h2>
        )}

        {isLoading && online ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-16 rounded-2xl bg-surface border border-theme animate-pulse" />)}
          </div>
        ) : (
          serverResponses.map((r) => {
            const s = STATUS[r.status];
            const Icon = s.Icon;
            return (
              <div key={r.responseId} className="flex items-center gap-3 p-3 rounded-2xl bg-surface border border-theme">
                <span className="size-12 rounded-xl overflow-hidden bg-border/20 shrink-0 flex items-center justify-center">
                  {r.thumbnailUrl
                    ? <img src={r.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    : <ImageOff className="size-5 text-muted/50" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-(--color-text) truncate">{r.formTitle}</p>
                  <p className="text-xs text-muted">{fmtDate(r.submittedAt)}</p>
                </div>
                <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full', s.cls)}>
                  <Icon className="size-3" />
                  {s.label}
                </span>
              </div>
            );
          })
        )}
      </section>

      {isEmpty && !isLoading && (
        <div className="text-center py-16 px-4 text-muted">
          <Camera className="size-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Aucune réponse pour l'instant.</p>
          <Link to="/capture" className="inline-block mt-3 text-sm font-semibold text-primary hover:underline">
            Prendre une photo
          </Link>
        </div>
      )}
    </div>
  );
}
