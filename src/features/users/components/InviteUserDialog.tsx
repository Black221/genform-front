import { useState } from 'react';
import { Dialog } from '@/shared/ui/Dialog';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { RoleSelect } from './RoleSelect';
import { useInviteUser, useCommunes } from '../hooks/useUsers';
import type { UserRole } from '@/shared/types';
import { cn } from '@/shared/lib/cn';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function InviteUserDialog({ open, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('OBSERVER');
  const [communeIds, setCommuneIds] = useState<string[]>([]);
  const { data: communes = [] } = useCommunes();
  const { mutateAsync, isPending, error, reset } = useInviteUser();

  function toggleCommune(id: string) {
    setCommuneIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleClose() {
    reset();
    setEmail('');
    setRole('OBSERVER');
    setCommuneIds([]);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await mutateAsync({ email, role, communeIds });
      handleClose();
    } catch {
      // error state visible via `error`
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => !v && handleClose()}
      title="Inviter un observateur"
      description="Un email sera envoyé pour créer le compte."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Adresse e-mail"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="observateur@exemple.sn"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-display font-medium text-[var(--color-text)]">Rôle</label>
          <RoleSelect value={role} onChange={setRole} />
        </div>

        {communes.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-display font-medium text-[var(--color-text)]">
              Communes{' '}
              <span className="text-[var(--color-text-muted)] font-normal">(optionnel)</span>
            </label>
            <div className="max-h-40 overflow-y-auto border border-[var(--color-border)] rounded-[var(--radius-theme)] p-2 space-y-1">
              {communes.map((c) => (
                <label
                  key={c.id}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-sm',
                    'hover:bg-[color-mix(in_srgb,var(--color-primary)_6%,transparent)]',
                  )}
                >
                  <input
                    type="checkbox"
                    className="accent-[var(--color-primary)]"
                    checked={communeIds.includes(c.id)}
                    onChange={() => toggleCommune(c.id)}
                  />
                  <span className="text-[var(--color-text)]">{c.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-[var(--brand-red)] font-medium">
            {(error as Error).message || 'Une erreur est survenue'}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-[var(--color-border)]">
          <Button variant="ghost" size="sm" type="button" onClick={handleClose}>
            Annuler
          </Button>
          <Button size="sm" loading={isPending} type="submit">
            Inviter
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
