import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Input';
import type { ContentBlock } from '@/shared/types';

interface Props {
  block: ContentBlock;
  onChange: (block: ContentBlock) => void;
  onDelete: () => void;
}

function setContent(block: ContentBlock, key: string, value: unknown): ContentBlock {
  return { ...block, content: { ...block.content, [key]: value } };
}

export function ContentBlockEditor({ block, onChange, onDelete }: Props) {
  const c = block.content;

  return (
    <div className="flex flex-col gap-3 p-3 rounded-[var(--radius-theme)] border border-[var(--color-border)]/60 border-dashed bg-[var(--color-surface)] group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
          Bloc {block.type.toLowerCase()}
        </span>
        <button
          type="button"
          onClick={onDelete}
          className="text-xs text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Supprimer
        </button>
      </div>

      {block.type === 'HEADING' && (
        <>
          <Input
            label="Texte du titre"
            value={(c.text as string) ?? ''}
            onChange={(e) => onChange(setContent(block, 'text', e.target.value))}
          />
          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--color-text-muted)]">Niveau</label>
            {[1, 2, 3, 4].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => onChange(setContent(block, 'level', l))}
                className={`text-xs px-2 py-1 rounded border transition-colors ${(c.level ?? 2) === l ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
              >
                H{l}
              </button>
            ))}
          </div>
        </>
      )}

      {block.type === 'TEXT' && (
        <Textarea
          label="Contenu"
          value={(c.text as string) ?? ''}
          onChange={(e) => onChange(setContent(block, 'text', e.target.value))}
          rows={3}
        />
      )}

      {block.type === 'IMAGE' && (
        <>
          <Input label="URL de l'image" value={(c.url as string) ?? ''} onChange={(e) => onChange(setContent(block, 'url', e.target.value))} />
          <Input label="Texte alternatif" value={(c.alt as string) ?? ''} onChange={(e) => onChange(setContent(block, 'alt', e.target.value))} />
          <Input label="Légende" value={(c.caption as string) ?? ''} onChange={(e) => onChange(setContent(block, 'caption', e.target.value))} />
        </>
      )}

      {block.type === 'EMBED' && (
        <Input label="URL d'intégration" value={(c.url as string) ?? ''} onChange={(e) => onChange(setContent(block, 'url', e.target.value))} />
      )}

      {block.type === 'DIVIDER' && (
        <p className="text-xs text-[var(--color-text-muted)] italic">Ligne de séparation horizontale</p>
      )}
    </div>
  );
}
