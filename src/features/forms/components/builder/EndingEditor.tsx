import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Input';
import type { Ending } from '@/shared/types';

interface Props {
  ending: Ending;
  onChange: (ending: Ending) => void;
}

export function EndingEditor({ ending, onChange }: Props) {
  const set = <K extends keyof Ending>(key: K, val: Ending[K]) => onChange({ ...ending, [key]: val });
  return (
    <div className="flex flex-col gap-4 p-4 rounded-[var(--radius-theme)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Écran de fin</p>
      <Textarea label="Message de remerciement" value={ending.message ?? ''} onChange={(e) => set('message', e.target.value)} placeholder="Merci pour votre participation !" rows={3} />
      <Input label="Redirection (URL optionnelle)" value={ending.redirectUrl ?? ''} onChange={(e) => set('redirectUrl', e.target.value)} placeholder="https://…" />
    </div>
  );
}
