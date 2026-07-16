import { Input } from '@/shared/ui/Input';
import type { Cover, CoverBackground } from '@/shared/types';

type BgType = CoverBackground['type'];

const BG_TYPES: { value: BgType; label: string }[] = [
  { value: 'none', label: 'Aucun' },
  { value: 'solid', label: 'Couleur' },
  { value: 'gradient', label: 'Dégradé' },
  { value: 'image', label: 'Image' },
];

function coverCssPreview(bg: CoverBackground): string {
  if (bg.type === 'solid') return bg.value ?? '#0B6E63';
  if (bg.type === 'gradient')
    return `linear-gradient(${bg.angle ?? 135}deg, ${bg.from ?? '#0B6E63'}, ${bg.to ?? '#159AAE'})`;
  if (bg.type === 'image' && bg.value) return `url(${bg.value}) center/cover no-repeat`;
  return 'transparent';
}

interface Props {
  cover: Cover;
  onChange: (cover: Cover) => void;
}

export function CoverEditor({ cover, onChange }: Props) {
  const set = <K extends keyof Cover>(key: K, val: Cover[K]) => onChange({ ...cover, [key]: val });

  const bg: CoverBackground = cover.background ?? { type: 'none' };
  const setBg = (patch: Partial<CoverBackground>) =>
    onChange({ ...cover, background: { ...bg, ...patch } });

  const bgType = bg.type;

  return (
    <div className="flex flex-col gap-5 p-4 rounded-theme border border-theme bg-surface">
      <p className="text-xs font-semibold text-muted uppercase tracking-wide">
        Écran de couverture
      </p>

      {/* Textes */}
      <Input label="Titre" value={cover.title ?? ''} onChange={(e) => set('title', e.target.value)} placeholder="Bienvenue !" />
      <Input label="Sous-titre" value={cover.subtitle ?? ''} onChange={(e) => set('subtitle', e.target.value)} placeholder="Description courte…" />
      <Input label="Texte du bouton" value={cover.ctaLabel ?? ''} onChange={(e) => set('ctaLabel', e.target.value)} placeholder="Commencer" />

      {/* Fond */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-muted">Arrière-plan</p>

        {/* Sélecteur de type */}
        <div className="grid grid-cols-4 gap-1.5">
          {BG_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setBg({ type: value })}
              className={`text-xs py-1.5 rounded-md border transition-colors ${
                bgType === value
                  ? 'bg-primary/10 text-primary border-primary/30 font-semibold'
                  : 'border-theme text-muted hover:border-primary/20 hover:text-(--color-text)'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Aperçu du fond */}
        {bgType !== 'none' && (
          <div
            className="h-10 rounded-md border border-theme"
            style={{ background: coverCssPreview(bg) }}
          />
        )}

        {/* Couleur unie */}
        {bgType === 'solid' && (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={bg.value ?? '#0B6E63'}
              onChange={(e) => setBg({ value: e.target.value })}
              className="h-9 w-14 cursor-pointer rounded border border-theme bg-transparent p-0.5"
            />
            <Input label="" value={bg.value ?? '#0B6E63'} onChange={(e) => setBg({ value: e.target.value })} placeholder="#0B6E63" className="flex-1" />
          </div>
        )}

        {/* Dégradé */}
        {bgType === 'gradient' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-xs text-muted">Couleur de départ</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bg.from ?? '#0B6E63'}
                    onChange={(e) => setBg({ from: e.target.value })}
                    className="h-8 w-10 cursor-pointer rounded border border-theme bg-transparent p-0.5 shrink-0"
                  />
                  <Input label="" value={bg.from ?? '#0B6E63'} onChange={(e) => setBg({ from: e.target.value })} placeholder="#0B6E63" />
                </div>
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-xs text-muted">Couleur d'arrivée</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bg.to ?? '#159AAE'}
                    onChange={(e) => setBg({ to: e.target.value })}
                    className="h-8 w-10 cursor-pointer rounded border border-theme bg-transparent p-0.5 shrink-0"
                  />
                  <Input label="" value={bg.to ?? '#159AAE'} onChange={(e) => setBg({ to: e.target.value })} placeholder="#159AAE" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Angle</span>
                <span className="text-xs font-mono text-muted">{bg.angle ?? 135}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={bg.angle ?? 135}
                onChange={(e) => setBg({ angle: Number(e.target.value) })}
                className="w-full accent-(--color-primary)"
              />
            </div>
          </div>
        )}

        {/* Image */}
        {bgType === 'image' && (
          <Input
            label="URL de l'image"
            value={bg.value ?? cover.imageUrl ?? ''}
            onChange={(e) => setBg({ value: e.target.value })}
            placeholder="https://…"
          />
        )}
      </div>
    </div>
  );
}
