import type { ContentBlockType } from '@/shared/types';

const types: { value: ContentBlockType; label: string; icon: string }[] = [
  { value: 'HEADING', label: 'Titre', icon: 'H' },
  { value: 'TEXT', label: 'Texte', icon: '¶' },
  { value: 'IMAGE', label: 'Image', icon: '🖼' },
  { value: 'DIVIDER', label: 'Séparateur', icon: '—' },
  { value: 'EMBED', label: 'Embed', icon: '<>' },
];

interface Props {
  onSelect: (type: ContentBlockType) => void;
}

export function BlockTypePicker({ onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2 p-2">
      {types.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onSelect(t.value)}
          className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/60 hover:bg-[var(--color-primary)]/5 transition-all"
        >
          <span className="text-lg">{t.icon}</span>
          <span className="text-xs text-[var(--color-text-muted)]">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
