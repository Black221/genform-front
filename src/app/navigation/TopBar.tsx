import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { SyncIndicator } from '@/features/offline/components/SyncIndicator';
import { cn } from '@/shared/lib/cn';

const ROLE_LABEL: Record<string, string> = {
  ADMIN:       'Admin',
  COORDINATOR: 'Coordinateur',
  OBSERVER:    'Observateur',
};

const ROLE_COLOR: Record<string, string> = {
  ADMIN:       'bg-(--color-primary-soft) text-primary',
  COORDINATOR: 'bg-(--color-accent-soft) text-accent',
  OBSERVER:    'bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] text-muted',
};

interface Props {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function TopBar({ onMenuClick, showMenuButton }: Props) {
  const { email, role, logout } = useAuth();
  const initials = email ? email[0].toUpperCase() : '?';

  return (
    <header className="h-14 shrink-0 flex items-center gap-3 px-4 bg-surface border-b border-theme">
      {/* Hamburger mobile */}
      {showMenuButton && (
        <button
          onClick={onMenuClick}
          aria-label="Menu"
          className={cn(
            'size-9 flex items-center justify-center rounded-md lg:hidden',
            'text-muted hover:text-(--color-text)',
            'hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]',
            'transition-colors duration-(--dur)',
          )}
        >
          <Menu size={18} />
        </button>
      )}

      {/* Indicateur de synchro */}
      <SyncIndicator />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Badge rôle */}
      <span
        className={cn(
          'hidden sm:inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-pill',
          ROLE_COLOR[role] ?? ROLE_COLOR.OBSERVER,
        )}
      >
        {ROLE_LABEL[role] ?? role}
      </span>

      {/* Avatar + email */}
      <div className="flex items-center gap-2.5">
        <div className="size-8 rounded-full bg-(--color-primary) text-white flex items-center justify-center text-sm font-semibold font-display select-none">
          {initials}
        </div>
        <span className="hidden md:block text-sm text-muted max-w-36 truncate">{email}</span>
      </div>

      {/* Déconnexion */}
      <button
        onClick={logout}
        aria-label="Se déconnecter"
        title="Se déconnecter"
        className={cn(
          'size-9 flex items-center justify-center rounded-md',
          'text-muted hover:text-danger hover:bg-(--color-danger-soft)',
          'transition-colors duration-(--dur)',
        )}
      >
        <LogOut size={16} />
      </button>
    </header>
  );
}
