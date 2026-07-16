import { useState } from 'react';
import type { User, UserRole } from '@/shared/types';
import { useUsers, useUpdateRole, useToggleActive } from '../hooks/useUsers';
import { useAuth } from '@/features/auth/useAuth';
import { RoleBadge, RoleSelect } from './RoleSelect';
import { CommuneAssign } from './CommuneAssign';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';

const ROLE_WEIGHT: Record<UserRole, number> = { OBSERVER: 0, COORDINATOR: 1, ADMIN: 2 };

interface RowProps {
  user: User;
  currentRole: UserRole;
  currentUserId: string | null;
}

function UserRow({ user, currentRole, currentUserId }: RowProps) {
  const [assignOpen, setAssignOpen] = useState(false);
  const { mutate: updateRole, isPending: updatingRole } = useUpdateRole();
  const { mutate: toggleActive, isPending: togglingActive } = useToggleActive();

  const isCurrentUser = user.id === currentUserId;
  const canEditRole = ROLE_WEIGHT[currentRole] >= ROLE_WEIGHT['ADMIN'] && !isCurrentUser;
  const canToggleActive = ROLE_WEIGHT[currentRole] >= ROLE_WEIGHT['COORDINATOR'] && !isCurrentUser;
  const canAssignCommunes = ROLE_WEIGHT[currentRole] >= ROLE_WEIGHT['COORDINATOR'];

  return (
    <>
      <tr
        className={cn(
          'border-b border-[var(--color-border)] last:border-0 transition-opacity',
          !user.isActive && 'opacity-50',
        )}
      >
        {/* Utilisateur */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] flex items-center justify-center text-sm font-semibold text-[var(--color-primary)] shrink-0">
              {user.email[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--color-text)] truncate">{user.email}</p>
              {isCurrentUser && (
                <p className="text-xs text-[var(--color-text-muted)]">Vous</p>
              )}
            </div>
          </div>
        </td>

        {/* Rôle */}
        <td className="py-3 px-4">
          {canEditRole ? (
            <RoleSelect
              value={user.role}
              onChange={(role) => updateRole({ id: user.id, role })}
              disabled={updatingRole}
            />
          ) : (
            <RoleBadge role={user.role} />
          )}
        </td>

        {/* Communes */}
        <td className="py-3 px-4">
          <div className="flex flex-wrap gap-1">
            {(user.communes ?? []).length > 0 ? (
              (user.communes ?? []).map((c) => (
                <span
                  key={c.id}
                  className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)]"
                >
                  {c.name}
                </span>
              ))
            ) : (
              <span className="text-xs text-[var(--color-text-muted)]">—</span>
            )}
          </div>
        </td>

        {/* Inscription */}
        <td className="py-3 px-4 text-sm text-[var(--color-text-muted)]">
          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—'}
        </td>

        {/* Statut */}
        <td className="py-3 px-4">
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full border',
              user.isActive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
            )}
          >
            {user.isActive ? 'Actif' : 'Inactif'}
          </span>
        </td>

        {/* Actions */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-2 justify-end">
            {canAssignCommunes && (
              <Button variant="ghost" size="sm" onClick={() => setAssignOpen(true)}>
                Communes
              </Button>
            )}
            {canToggleActive && (
              <Button
                variant={user.isActive ? 'danger' : 'secondary'}
                size="sm"
                loading={togglingActive}
                onClick={() => toggleActive({ id: user.id, active: !user.isActive })}
              >
                {user.isActive ? 'Désactiver' : 'Activer'}
              </Button>
            )}
          </div>
        </td>
      </tr>

      {assignOpen && (
        <CommuneAssign user={user} open={assignOpen} onClose={() => setAssignOpen(false)} />
      )}
    </>
  );
}

interface Props {
  roleFilter: string;
  search: string;
}

export function UserTable({ roleFilter, search }: Props) {
  const { data: users = [], isLoading, isError } = useUsers(
    roleFilter ? { role: roleFilter as UserRole } : undefined,
  );
  const currentRole = useAuth((s) => s.role);
  const currentUserId = useAuth((s) => s.userId);

  const filtered = search
    ? users.filter((u) => u.email.toLowerCase().includes(search.toLowerCase()))
    : users;

  if (isLoading) {
    return (
      <div className="text-center py-12 text-sm text-[var(--color-text-muted)]">
        Chargement des observateurs…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-sm text-[var(--brand-red)]">
        Erreur lors du chargement. Veuillez réessayer.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left">
            {['Utilisateur', 'Rôle', 'Communes', 'Inscription', 'Statut', ''].map((col) => (
              <th
                key={col}
                className="py-3 px-4 text-xs font-display font-semibold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-12 text-[var(--color-text-muted)]">
                Aucun utilisateur trouvé.
              </td>
            </tr>
          ) : (
            filtered.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                currentRole={currentRole}
                currentUserId={currentUserId}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
