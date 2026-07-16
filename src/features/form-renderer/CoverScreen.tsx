import { ArrowRight } from 'lucide-react';
import type { Cover } from '@/shared/types';

interface Props {
  cover: Cover;
  onStart: () => void;
}

function getCoverStyle(bg?: Cover['background'], imageUrl?: string): React.CSSProperties {
  if (!bg || bg.type === 'none') return {};
  if (bg.type === 'solid' && bg.value) return { background: bg.value };
  if (bg.type === 'gradient' && bg.from && bg.to)
    return { background: `linear-gradient(${bg.angle ?? 135}deg, ${bg.from}, ${bg.to})` };
  if (bg.type === 'image' && bg.value)
    return { backgroundImage: `url(${bg.value})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  if (imageUrl)
    return { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  return {};
}

export function CoverScreen({ cover, onStart }: Props) {
  const hasImage = cover.background?.type === 'image' || !!cover.imageUrl;
  const hasColor = cover.background?.type === 'solid' || cover.background?.type === 'gradient';
  const darkBg = hasImage || hasColor;

  const textColor = darkBg ? 'white' : 'var(--color-text)';
  const mutedColor = darkBg ? 'rgba(255,255,255,0.72)' : 'var(--color-text-muted)';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={getCoverStyle(cover.background, cover.imageUrl)}
    >
      {/* Fond par défaut quand pas de bg custom */}
      {!darkBg && (
        <div className="absolute inset-0" style={{ background: 'var(--color-bg)' }}>
          <div className="absolute inset-0 topo-pattern" style={{ opacity: 0.35 }} />
          <div
            className="absolute -top-40 -right-40 w-150 h-150 rounded-full blur-3xl"
            style={{ background: 'var(--color-primary)', opacity: 0.07 }}
          />
          <div
            className="absolute -bottom-32 -left-32 w-125 h-125 rounded-full blur-3xl"
            style={{ background: 'var(--color-accent, #E08A2B)', opacity: 0.05 }}
          />
        </div>
      )}

      {/* Overlay image */}
      {hasImage && (
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,.6) 100%)' }}
        />
      )}

      {/* Contenu centré */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-8 animate-rise">

        {/* Icon */}
        <div
          className="size-16 rounded-2xl flex items-center justify-center"
          style={{
            background: darkBg ? 'rgba(255,255,255,0.15)' : 'var(--color-primary-soft, #DCEFEC)',
            backdropFilter: darkBg ? 'blur(8px)' : undefined,
            border: darkBg ? '1px solid rgba(255,255,255,0.2)' : 'none',
          }}
        >
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24" strokeWidth={1.8}
               stroke={darkBg ? 'white' : 'var(--color-primary)'}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        {/* Titre + sous-titre */}
        <div className="flex flex-col gap-4">
          <h1
            className="font-display font-bold leading-tight tracking-tight"
            style={{ fontSize: 'clamp(2.2rem, 6vw, 3.8rem)', color: textColor }}
          >
            {cover.title}
          </h1>
          {cover.subtitle && (
            <p
              className="text-lg leading-relaxed max-w-lg mx-auto"
              style={{ color: mutedColor }}
            >
              {cover.subtitle}
            </p>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          className="group flex items-center gap-3 px-8 py-4 rounded-2xl font-display font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
          style={{
            background: darkBg ? 'white' : 'var(--color-primary)',
            color: darkBg ? 'var(--color-primary)' : 'white',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}
        >
          {cover.ctaLabel || 'Commencer'}
          <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>

      {/* Signature */}
      <div
        className="absolute bottom-5 right-6 text-xs tracking-wide"
        style={{ color: darkBg ? 'rgba(255,255,255,0.35)' : 'var(--color-text-muted)', opacity: 0.7 }}
      >
        Propulsé par Gen·Form
      </div>
    </div>
  );
}
