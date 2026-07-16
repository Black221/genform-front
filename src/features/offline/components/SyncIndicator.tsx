import { cn } from '@/shared/lib/cn';
import { useSyncStore } from '../syncStore';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { syncPendingObservations } from '../syncEngine';

export function SyncIndicator() {
  const isOnline = useOnlineStatus();
  const { pendingCount, syncing } = useSyncStore();

  if (!isOnline) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium select-none">
        <span className="size-2 rounded-full bg-gray-400 shrink-0" />
        Hors ligne
        {pendingCount > 0 && (
          <span className="ml-0.5 bg-gray-300 text-gray-600 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
            {pendingCount}
          </span>
        )}
      </div>
    );
  }

  if (syncing) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-medium select-none">
        <span className="size-2 rounded-full border border-orange-400 border-t-transparent animate-spin shrink-0" />
        Synchro…
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <button
        onClick={syncPendingObservations}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-medium hover:bg-orange-100 transition-colors"
        title="Cliquer pour synchroniser"
      >
        <span className="size-2 rounded-full bg-orange-400 shrink-0 animate-pulse" />
        {pendingCount} en attente
      </button>
    );
  }

  return (
    <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-(--brand-green-light) text-(--brand-green-dark) text-xs font-medium select-none')}>
      <span className="size-2 rounded-full bg-primary shrink-0" />
      En ligne
    </div>
  );
}
