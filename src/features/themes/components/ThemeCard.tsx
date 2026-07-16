import type { Theme } from '@/shared/types';
import { cn } from '@/shared/lib/cn';

interface Props {
  theme: Theme;
  onClick: () => void;
  onDelete?: () => void;
}

export function ThemeCard({ theme, onClick, onDelete }: Props) {
  const { primary, background, surface, surfaceRaised } = theme.palette;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={cn(
        'group relative flex flex-col rounded-theme border overflow-hidden transition-all cursor-pointer',
        'border-theme hover:border-(--color-primary)/60 hover:shadow-sm',
      )}
    >
      {/* Palette swatch preview */}
      <div className="h-28 relative" style={{ background }}>
        <div className="absolute inset-x-4 top-4 h-3 rounded-md" style={{ background: surfaceRaised }} />
        <div className="absolute inset-x-4 top-10 h-9 rounded-md" style={{ background: surface }}>
          <div className="absolute left-3 top-2.5 h-2 w-14 rounded-full" style={{ background: primary, opacity: 0.9 }} />
          <div className="absolute left-3 bottom-2.5 h-1.5 w-20 rounded-full" style={{ background: primary, opacity: 0.3 }} />
        </div>
        <div
          className="absolute bottom-4 right-4 px-3 py-1 rounded text-xs font-bold"
          style={{ background: primary, color: background }}
        >
          Aa
        </div>

        <span
          className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.35)', color: 'rgba(255,255,255,0.8)' }}
        >
          {theme.isSystem ? 'Système' : theme.isPublic ? 'Public' : 'Privé'}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1 bg-surface flex-1">
        <p className="font-display font-semibold text-sm text-(--color-text) truncate">{theme.name}</p>
        <div className="flex gap-1 mt-1 flex-wrap">
          {Object.entries(theme.palette).slice(0, 5).map(([key, color]) => (
            <span
              key={key}
              title={key}
              className="w-4 h-4 rounded-full border border-theme shrink-0"
              style={{ background: color }}
            />
          ))}
        </div>
        <p className="text-xs text-muted mt-1 capitalize">{theme.radius} · {theme.layout}</p>
      </div>

      {/* Delete action (hover, user themes only) */}
      {onDelete && !theme.isSystem && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-red-500/40 text-red-200 hover:bg-red-500/60 transition-all opacity-0 group-hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  );
}
