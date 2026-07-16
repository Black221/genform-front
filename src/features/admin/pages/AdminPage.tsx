import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Users, Plus, Pencil } from 'lucide-react';
import { usersApi } from '@/features/users/api/usersApi';
import { UserTable } from '@/features/users/components/UserTable';
import { InviteUserDialog } from '@/features/users/components/InviteUserDialog';
import { useCommunes } from '@/features/users/hooks/useUsers';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Dialog } from '@/shared/ui/Dialog';
import { Input } from '@/shared/ui/Input';
import { useToast } from '@/shared/ui/Toast';
import { useAuth } from '@/features/auth/useAuth';
import { cn } from '@/shared/lib/cn';

/* ── Onglet Communes ──────────────────────────────────────── */

function CommunesTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const { data: communes = [], isLoading } = useCommunes();

  const createMutation = useMutation({
    mutationFn: () => usersApi.createCommune(name.trim(), code.trim() || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['communes'] });
      setShowCreate(false);
      setName('');
      setCode('');
      toast('Commune créée avec succès', 'success');
    },
    onError: () => toast('Erreur lors de la création', 'error'),
  });

  const filtered = communes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.code ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <Dialog
        open={showCreate}
        onOpenChange={setShowCreate}
        title="Nouvelle commune"
        description="Créez une commune accessible aux coordinateurs et observateurs."
      >
        <form
          onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
          className="space-y-4 mt-1"
        >
          <Input
            label="Nom *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex. Dakar Plateau"
            autoFocus
          />
          <Input
            label="Code (optionnel)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="ex. DK-01"
          />
          <div className="flex justify-end gap-3 pt-2 border-t border-theme">
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowCreate(false)}>
              Annuler
            </Button>
            <Button size="sm" type="submit" loading={createMutation.isPending} disabled={!name.trim()}>
              Créer la commune
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="search"
          placeholder="Rechercher une commune…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            'text-sm px-3 py-2 rounded-theme flex-1 min-w-48 max-w-xs',
            'border border-theme bg-surface text-(--color-text)',
            'placeholder:text-muted',
            'focus:outline-none focus:border-primary',
            'focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]',
          )}
        />
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={15} className="mr-1.5" />
          Nouvelle commune
        </Button>
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-sm text-muted">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted">
            {search ? 'Aucune commune ne correspond.' : 'Aucune commune enregistrée. Créez-en une !'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-theme text-left">
                  {['Nom', 'Code', 'Identifiant', ''].map((col) => (
                    <th
                      key={col}
                      className="py-3 px-4 text-xs font-display font-semibold text-muted uppercase tracking-wider whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-theme last:border-0 hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] flex items-center justify-center shrink-0">
                          <Building2 size={14} className="text-primary" />
                        </div>
                        <span className="font-medium text-(--color-text)">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {c.code
                        ? <span className="text-xs font-mono px-2 py-0.5 rounded bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] text-muted">{c.code}</span>
                        : <span className="text-muted">—</span>
                      }
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono text-muted opacity-60 select-all">{c.id}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" disabled>
                        <Pencil size={13} className="mr-1.5" />
                        Modifier
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <p className="mt-3 text-xs text-muted">
        {filtered.length} commune{filtered.length !== 1 ? 's' : ''}
        {search && ` correspondant à "${search}"`}
      </p>
    </>
  );
}

/* ── Onglet Observateurs ──────────────────────────────────── */

const ROLE_FILTERS = [
  { value: '',            label: 'Tous' },
  { value: 'OBSERVER',   label: 'Observateurs' },
  { value: 'COORDINATOR',label: 'Coordinateurs' },
  { value: 'ADMIN',      label: 'Admins' },
];

function ObservateursTab() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const currentRole = useAuth((s) => s.role);
  const canInvite = currentRole === 'ADMIN' || currentRole === 'COORDINATOR';

  return (
    <>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <p className="text-sm text-muted">
          Gérez les membres, leurs rôles et leurs communes d'affectation.
        </p>
        {canInvite && (
          <Button onClick={() => setInviteOpen(true)}>
            <Plus size={15} className="mr-1.5" />
            Inviter un observateur
          </Button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
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

        <input
          type="search"
          placeholder="Rechercher par email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            'text-sm px-3 py-2 rounded-theme',
            'border border-theme bg-surface text-(--color-text)',
            'placeholder:text-muted',
            'focus:outline-none focus:border-primary',
            'focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]',
          )}
        />
      </div>

      <Card className="p-0 overflow-hidden">
        <UserTable roleFilter={roleFilter} search={search} />
      </Card>

      <InviteUserDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}

/* ── Page principale ──────────────────────────────────────── */

type Tab = 'communes' | 'observateurs';

const TABS: { key: Tab; label: string; icon: typeof Building2 }[] = [
  { key: 'communes',     label: 'Communes',     icon: Building2 },
  { key: 'observateurs', label: 'Observateurs', icon: Users },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('communes');

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-(--color-text)">Administration</h1>
          <p className="text-sm text-muted mt-1">
            Gestion des communes et du réseau d'observateurs.
          </p>
        </div>
      </div>

      {/* Onglets — même style pill que UsersPage */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'inline-flex items-center gap-2 text-xs px-4 py-2 rounded-[calc(var(--radius-lg)-2px)] font-display font-medium transition-all',
              tab === key
                ? 'bg-surface text-(--color-text) shadow-soft'
                : 'text-muted hover:text-(--color-text)',
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      {tab === 'communes'     && <CommunesTab />}
      {tab === 'observateurs' && <ObservateursTab />}
    </div>
  );
}
