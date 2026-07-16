import type { UserRole } from '@/shared/types';
import { cn } from '@/shared/lib/cn';

export const ROLE_LABEL: Record<UserRole, string> = {
  OBSERVER: 'Observateur',
  COORDINATOR: 'Coordinateur',
  ADMIN: 'Admin',
};

const ROLE_COLOR: Record<UserRole, string> = {
  OBSERVER: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  COORDINATOR: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  ADMIN: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

interface RoleBadgeProps {
  role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span className={cn('text-xs px-2 py-0.5 rounded-full border', ROLE_COLOR[role])}>
      {ROLE_LABEL[role]}
    </span>
  );
}

interface RoleSelectProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
}

export function RoleSelect({ value, onChange, disabled }: RoleSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as UserRole)}
      disabled={disabled}
      className={cn(
        'text-sm px-2.5 py-1.5 rounded-[var(--radius-theme)]',
        'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]',
        'focus:outline-none focus:border-[var(--color-primary)]',
        'disabled:opacity-50 disabled:pointer-events-none',
      )}
    >
      <option value="OBSERVER">Observateur</option>
      <option value="COORDINATOR">Coordinateur</option>
      <option value="ADMIN">Admin</option>
    </select>
  );
}
