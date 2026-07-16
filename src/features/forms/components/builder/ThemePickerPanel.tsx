import { useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { themesApi } from '@/features/themes/api/themesApi';
import { ThemeCard } from '@/features/themes/components/ThemeCard';
import type { Theme } from '@/shared/types';

interface Props {
  currentThemeName?: string;
  onChange: (theme: Record<string, unknown> | null) => void;
  locked?: boolean;
}

function themeToMap(t: Theme): Record<string, unknown> {
  return {
    name: t.name,
    palette: t.palette,
    typography: t.typography,
    radius: t.radius,
    layout: t.layout,
    background: t.background,
  };
}

export function ThemePickerPanel({ currentThemeName, onChange, locked }: Props) {
  const { data: themes = [], isLoading } = useQuery({
    queryKey: ['themes'],
    queryFn: themesApi.list,
  });

  const systemThemes = themes.filter((t) => t.isSystem);
  const myThemes     = themes.filter((t) => !t.isSystem);
  const isDefault    = !currentThemeName;

  return (
    <div className="flex flex-col gap-8">

      {/* Option : thème par défaut */}
      <button
        type="button"
        disabled={locked}
        onClick={() => onChange(null)}
        className="flex items-center gap-4 p-4 rounded-theme border text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          borderColor: isDefault ? 'var(--color-primary)' : 'var(--color-border)',
          background:  isDefault ? 'var(--color-primary-soft, #DCEFEC)' : 'var(--color-surface)',
        }}
      >
        <div
          className="size-10 rounded-full border-2 shrink-0 flex items-center justify-center"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-raised)' }}
        >
          {isDefault && <Check size={16} style={{ color: 'var(--color-primary)' }} />}
        </div>
        <div>
          <p className="text-sm font-display font-semibold" style={{ color: 'var(--color-text)' }}>
            Thème par défaut
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Aucun thème appliqué — utilise les couleurs standard
          </p>
        </div>
        {isDefault && (
          <span
            className="ml-auto text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: 'var(--color-primary)', color: 'white' }}
          >
            Actif
          </span>
        )}
      </button>

      {/* Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 rounded-theme bg-surface border border-theme animate-pulse" />
          ))}
        </div>
      )}

      {/* Thèmes intégrés */}
      {systemThemes.length > 0 && (
        <section>
          <p className="text-xs font-display font-semibold text-muted uppercase tracking-wider mb-3">
            Thèmes intégrés
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {systemThemes.map((t) => (
              <ThemeSelectionWrapper
                key={t.id}
                selected={currentThemeName === t.name}
                locked={locked}
              >
                <ThemeCard theme={t} onClick={() => !locked && onChange(themeToMap(t))} />
              </ThemeSelectionWrapper>
            ))}
          </div>
        </section>
      )}

      {/* Mes thèmes */}
      {myThemes.length > 0 && (
        <section>
          <p className="text-xs font-display font-semibold text-muted uppercase tracking-wider mb-3">
            Mes thèmes
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {myThemes.map((t) => (
              <ThemeSelectionWrapper
                key={t.id}
                selected={currentThemeName === t.name}
                locked={locked}
              >
                <ThemeCard theme={t} onClick={() => !locked && onChange(themeToMap(t))} />
              </ThemeSelectionWrapper>
            ))}
          </div>
        </section>
      )}

      {!isLoading && themes.length === 0 && (
        <div className="text-center py-12 text-muted text-sm">
          Aucun thème disponible.
        </div>
      )}
    </div>
  );
}

function ThemeSelectionWrapper({
  selected,
  locked,
  children,
}: {
  selected: boolean;
  locked?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative rounded-theme overflow-hidden transition-all"
      style={{
        outline: selected ? '2px solid var(--color-primary)' : '2px solid transparent',
        outlineOffset: '2px',
        opacity: locked ? 0.5 : 1,
        pointerEvents: locked ? 'none' : 'auto',
      }}
    >
      {selected && (
        <div
          className="absolute top-2 right-2 z-10 size-6 rounded-full flex items-center justify-center"
          style={{ background: 'var(--color-primary)' }}
        >
          <Check size={13} color="white" />
        </div>
      )}
      {children}
    </div>
  );
}
