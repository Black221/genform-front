import { useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { cn } from '@/shared/lib/cn';
import { UserTable } from '../components/UserTable';
import { InviteUserDialog } from '../components/InviteUserDialog';

const ROLE_FILTERS = [
  { value: '', label: 'Tous' },
  { value: 'OBSERVER', label: 'Observateurs' },
  { value: 'COORDINATOR', label: 'Coordinateurs' },
  { value: 'ADMIN', label: 'Admins' },
];

export default function UsersPage() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const currentRole = useAuth((s) => s.role);
  const canInvite = currentRole === 'COORDINATOR' || currentRole === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-(--color-text)">Réseau d'observateurs</h1>
          <p className="text-sm text-muted mt-1">
            Gérez les membres, leurs rôles et leurs communes d'affectation.
          </p>
        </div>
        {canInvite && (
          <Button onClick={() => setInviteOpen(true)}>
            + Inviter un observateur
          </Button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filtre par rôle (pill tabs) */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]">
          {ROLE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setRoleFilter(f.value)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-[calc(var(--radius-lg)-2px)] font-display font-medium transition-all',
                roleFilter === f.value
                  ? 'bg-surface text-(--color-text) shadow-soft'
                  : 'text-muted hover:text-(--color-text)',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Recherche par email */}
        <input
          type="search"
          placeholder="Rechercher par email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            'text-sm px-3 py-2 rounded-theme',
            'border border-theme bg-surface text-(--color-text)',
            'placeholder-(--color-text-muted)',
            'focus:outline-none focus:border-(--color-primary)',
            'focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]',
          )}
        />
      </div>

      {/* Tableau */}
      <Card className="p-0 overflow-hidden">
        <UserTable roleFilter={roleFilter} search={search} />
      </Card>

      {/* Dialog invitation */}
      <InviteUserDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
