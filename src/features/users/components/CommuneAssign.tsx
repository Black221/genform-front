import { useState } from 'react';
import type { User } from '@/shared/types';
import { Dialog } from '@/shared/ui/Dialog';
import { Button } from '@/shared/ui/Button';
import { useCommunes, useAssignCommunes } from '../hooks/useUsers';
import { cn } from '@/shared/lib/cn';

interface Props {
  user: User;
  open: boolean;
  onClose: () => void;
}

export function CommuneAssign({ user, open, onClose }: Props) {
  const { data: communes = [] } = useCommunes();
  const { mutateAsync, isPending } = useAssignCommunes();
  const [selected, setSelected] = useState<string[]>((user.communes ?? []).map((c) => c.id));

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSave() {
    await mutateAsync({ id: user.id, communeIds: selected });
    onClose();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title="Affecter des communes"
      description={`Communes assignées à ${user.email}`}
    >
      <div className="space-y-4">
        <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
          {communes.length === 0 && (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
              Aucune commune disponible
            </p>
          )}
          {communes.map((c) => (
            <label
              key={c.id}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-[var(--radius-theme)] cursor-pointer',
                'hover:bg-[color-mix(in_srgb,var(--color-primary)_6%,transparent)]',
                selected.includes(c.id) &&
                  'bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]',
              )}
            >
              <input
                type="checkbox"
                className="accent-[var(--color-primary)]"
                checked={selected.includes(c.id)}
                onChange={() => toggle(c.id)}
              />
              <span className="text-sm text-[var(--color-text)] flex-1">{c.name}</span>
              {c.code && (
                <span className="text-xs text-[var(--color-text-muted)]">{c.code}</span>
              )}
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-[var(--color-border)]">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button size="sm" loading={isPending} onClick={handleSave}>
            Enregistrer
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
