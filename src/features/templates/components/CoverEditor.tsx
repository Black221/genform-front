import type { TemplateCover, CoverBackground } from '@/shared/types';

interface Props {
  cover: TemplateCover;
  onChange: (cover: TemplateCover) => void;
}

const BG_TYPES: { value: CoverBackground['type']; label: string }[] = [
  { value: 'none',     label: 'Aucun' },
  { value: 'gradient', label: 'Dégradé' },
  { value: 'solid',    label: 'Couleur unie' },
  { value: 'image',    label: 'Image URL' },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium" style={{ color: '#576A65' }}>{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full bg-white border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6E63]/30 focus:border-[#0B6E63] transition-colors';

export function CoverEditor({ cover, onChange }: Props) {
  const bg = cover.background ?? { type: 'none' };

  const setBg = (patch: Partial<CoverBackground>) =>
    onChange({ ...cover, background: { ...bg, ...patch } });

  const bgType = bg.type ?? 'none';

  return (
    <div className="flex flex-col gap-5">

      {/* Texte */}
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#576A65' }}>
          Texte
        </h3>
        <Field label="Titre">
          <input
            className={inputCls}
            style={{ borderColor: '#D8E0DD', color: '#15211E' }}
            value={cover.title ?? ''}
            onChange={(e) => onChange({ ...cover, title: e.target.value })}
            placeholder="Titre principal de la couverture"
          />
        </Field>
        <Field label="Sous-titre">
          <input
            className={inputCls}
            style={{ borderColor: '#D8E0DD', color: '#15211E' }}
            value={cover.subtitle ?? ''}
            onChange={(e) => onChange({ ...cover, subtitle: e.target.value })}
            placeholder="Description courte"
          />
        </Field>
        <Field label="Texte du bouton">
          <input
            className={inputCls}
            style={{ borderColor: '#D8E0DD', color: '#15211E' }}
            value={cover.ctaLabel ?? ''}
            onChange={(e) => onChange({ ...cover, ctaLabel: e.target.value })}
            placeholder="Commencer"
          />
        </Field>
      </section>

      {/* Arrière-plan */}
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#576A65' }}>
          Arrière-plan
        </h3>

        {/* Type selector */}
        <div className="grid grid-cols-4 gap-1.5">
          {BG_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setBg({ type: value })}
              className="py-2 text-xs rounded-lg border font-medium transition-colors"
              style={{
                borderColor: bgType === value ? '#0B6E63' : '#D8E0DD',
                background: bgType === value ? '#DCEFEC' : 'white',
                color: bgType === value ? '#0B6E63' : '#576A65',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Gradient controls */}
        {bgType === 'gradient' && (
          <div className="flex flex-col gap-3 p-3 rounded-lg" style={{ background: '#F3F6F4', border: '1px solid #D8E0DD' }}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Couleur départ">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bg.from ?? '#0B6E63'}
                    onChange={(e) => setBg({ from: e.target.value })}
                    className="w-9 h-9 rounded-lg border cursor-pointer"
                    style={{ borderColor: '#D8E0DD' }}
                  />
                  <input
                    className="flex-1 bg-white border rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-[#0B6E63]"
                    style={{ borderColor: '#D8E0DD', color: '#15211E' }}
                    value={bg.from ?? '#0B6E63'}
                    onChange={(e) => setBg({ from: e.target.value })}
                  />
                </div>
              </Field>
              <Field label="Couleur fin">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bg.to ?? '#159AAE'}
                    onChange={(e) => setBg({ to: e.target.value })}
                    className="w-9 h-9 rounded-lg border cursor-pointer"
                    style={{ borderColor: '#D8E0DD' }}
                  />
                  <input
                    className="flex-1 bg-white border rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-[#0B6E63]"
                    style={{ borderColor: '#D8E0DD', color: '#15211E' }}
                    value={bg.to ?? '#159AAE'}
                    onChange={(e) => setBg({ to: e.target.value })}
                  />
                </div>
              </Field>
            </div>

            <Field label={`Angle — ${bg.angle ?? 135}°`}>
              <input
                type="range"
                min={0}
                max={360}
                value={bg.angle ?? 135}
                onChange={(e) => setBg({ angle: Number(e.target.value) })}
                className="w-full accent-[#0B6E63]"
              />
            </Field>

            {/* Live gradient preview strip */}
            <div
              className="h-8 rounded-lg"
              style={{
                background: `linear-gradient(${bg.angle ?? 135}deg, ${bg.from ?? '#0B6E63'}, ${bg.to ?? '#159AAE'})`,
              }}
            />
          </div>
        )}

        {/* Solid color */}
        {bgType === 'solid' && (
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#F3F6F4', border: '1px solid #D8E0DD' }}>
            <input
              type="color"
              value={bg.value ?? '#0B6E63'}
              onChange={(e) => setBg({ value: e.target.value })}
              className="w-10 h-10 rounded-lg border cursor-pointer"
              style={{ borderColor: '#D8E0DD' }}
            />
            <input
              className="flex-1 bg-white border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#0B6E63]"
              style={{ borderColor: '#D8E0DD', color: '#15211E' }}
              value={bg.value ?? '#0B6E63'}
              onChange={(e) => setBg({ value: e.target.value })}
            />
          </div>
        )}

        {/* Image URL */}
        {bgType === 'image' && (
          <div className="p-3 rounded-lg flex flex-col gap-2" style={{ background: '#F3F6F4', border: '1px solid #D8E0DD' }}>
            <input
              className={inputCls}
              style={{ borderColor: '#D8E0DD', color: '#15211E' }}
              value={bg.value ?? ''}
              onChange={(e) => setBg({ value: e.target.value })}
              placeholder="https://…"
            />
            {bg.value && (
              <div
                className="h-20 rounded-lg bg-cover bg-center"
                style={{ backgroundImage: `url(${bg.value})` }}
              />
            )}
          </div>
        )}
      </section>
    </div>
  );
}
