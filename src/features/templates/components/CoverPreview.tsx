import type { TemplateCover, CoverBackground } from '@/shared/types';

function coverCss(bg?: CoverBackground): string {
  if (!bg || bg.type === 'none') return '#F3F6F4';
  if (bg.type === 'solid') return bg.value ?? '#0B6E63';
  if (bg.type === 'gradient')
    return `linear-gradient(${bg.angle ?? 135}deg, ${bg.from ?? '#0B6E63'}, ${bg.to ?? '#159AAE'})`;
  if (bg.type === 'image') return `url(${bg.value}) center/cover no-repeat`;
  return '#F3F6F4';
}

function isLight(hex?: string): boolean {
  if (!hex || !hex.startsWith('#')) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

function coverTextColor(bg?: CoverBackground): string {
  if (!bg || bg.type === 'none') return '#15211E';
  if (bg.type === 'solid') return isLight(bg.value) ? '#15211E' : '#FFFFFF';
  if (bg.type === 'gradient') return isLight(bg.from) && isLight(bg.to) ? '#15211E' : '#FFFFFF';
  return '#FFFFFF';
}

interface Props {
  cover: TemplateCover;
}

export function CoverPreview({ cover }: Props) {
  const bg = cover.background;
  const textColor = coverTextColor(bg);
  const hasBg = bg && bg.type !== 'none';

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-xl"
        style={{ border: '1px solid #D8E0DD' }}
      >
        {/* Cover hero */}
        <div
          className="px-10 py-16 flex flex-col items-center text-center gap-4"
          style={{ background: coverCss(bg) }}
        >
          {hasBg && (
            <div
              className="absolute inset-0 opacity-10"
              style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,.15) 39px,rgba(255,255,255,.15) 40px)' }}
            />
          )}
          <div className="relative z-10 flex flex-col items-center gap-3">
            <h1
              className="text-3xl font-bold leading-tight"
              style={{ color: textColor, fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              {cover.title || 'Titre de couverture'}
            </h1>
            {cover.subtitle && (
              <p className="text-sm max-w-sm leading-relaxed" style={{ color: textColor, opacity: 0.8 }}>
                {cover.subtitle}
              </p>
            )}
            <button
              className="mt-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors"
              style={{
                background: hasBg ? 'rgba(255,255,255,0.2)' : '#0B6E63',
                color: hasBg ? textColor : '#FFFFFF',
                border: hasBg ? `1px solid ${textColor}40` : 'none',
                backdropFilter: hasBg ? 'blur(8px)' : undefined,
              }}
            >
              {cover.ctaLabel || 'Commencer'}
            </button>
          </div>
        </div>

        {/* Simulated form body */}
        <div className="px-8 py-6 flex flex-col gap-3" style={{ background: '#FFFFFF' }}>
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="h-3 rounded" style={{ background: '#ECF1EF', width: i === 1 ? '60%' : '45%' }} />
              <div className="h-9 rounded-lg border" style={{ background: '#F3F6F4', borderColor: '#D8E0DD' }} />
            </div>
          ))}
          <div
            className="mt-2 h-10 rounded-lg flex items-center justify-center text-sm font-medium text-white"
            style={{ background: '#0B6E63' }}
          >
            Envoyer
          </div>
        </div>
      </div>
    </div>
  );
}
