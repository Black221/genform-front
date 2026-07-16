import { cn } from '@/shared/lib/cn';
import type { ResponseStatus } from '@/shared/types';

const CONFIG: Record<ResponseStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'En attente',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  VALIDATED: {
    label: 'Validée',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  REJECTED: {
    label: 'Rejetée',
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
};

interface Props {
  status: ResponseStatus;
  className?: string;
}

export function ResponseStatusBadge({ status, className }: Props) {
  const { label, className: badgeClass } = CONFIG[status] ?? CONFIG.PENDING;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border',
        badgeClass,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
