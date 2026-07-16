import type { PresentationMode } from '@/shared/types';
import { cn } from '@/shared/lib/cn';

const modes: { value: PresentationMode; label: string; desc: string }[] = [
  { value: 'onepage', label: 'Une page', desc: 'Toutes les questions défilent' },
  { value: 'paginated', label: 'Pages', desc: 'Une section par page' },
  { value: 'single-question', label: 'Question par question', desc: 'Style Typeform' },
];

interface Props {
  value: PresentationMode;
  onChange: (mode: PresentationMode) => void;
}

export function PresentationModePicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Mode de présentation</p>
      <div className="grid grid-cols-3 gap-2">
        {modes.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => onChange(m.value)}
            className={cn(
              'flex flex-col items-start px-3 py-3 rounded-[var(--radius-sm)] border text-left transition-all',
              value === m.value
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/40 text-[var(--color-text-muted)]',
            )}
          >
            <span className="text-xs font-semibold">{m.label}</span>
            <span className="text-xs opacity-70 mt-0.5">{m.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
