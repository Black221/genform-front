import type { Ending } from '@/shared/types';

interface Props {
  ending: Ending;
}

export function EndingScreen({ ending }: Props) {
  if (ending.redirectUrl) {
    window.location.href = ending.redirectUrl;
    return null;
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Fond décoratif */}
      <div className="absolute inset-0 topo-pattern" style={{ opacity: 0.3 }} />
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl"
        style={{ background: 'var(--color-primary)', opacity: 0.07 }}
      />

      <div className="relative z-10 w-full max-w-md mx-auto px-6 py-16 flex flex-col items-center text-center gap-8 animate-rise">

        {/* Icône succès animée */}
        <div className="relative">
          <div
            className="size-24 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-primary-soft, #DCEFEC)' }}
          >
            <svg className="size-11" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={30}
                strokeDashoffset={30}
                style={{ animation: 'draw-line 0.55s cubic-bezier(.16,1,.3,1) 0.15s forwards' }}
              />
            </svg>
          </div>
          {/* Anneau pulsé */}
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: 'var(--color-primary)', opacity: 0.12 }}
          />
        </div>

        {/* Texte */}
        <div className="flex flex-col gap-3">
          <h2
            className="font-display font-bold"
            style={{ fontSize: '2.5rem', color: 'var(--color-text)', letterSpacing: '-0.02em' }}
          >
            Merci !
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {ending.message || 'Votre réponse a bien été enregistrée. Merci pour votre participation.'}
          </p>
        </div>

        {/* Card info */}
        <div
          className="w-full px-6 py-4 rounded-2xl border flex items-center gap-3"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.8}
               stroke="var(--color-text-muted)" className="shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Vous pouvez fermer cette fenêtre en toute sécurité.
          </p>
        </div>
      </div>

      {/* Signature */}
      <div
        className="absolute bottom-5 right-6 text-xs tracking-wide"
        style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}
      >
        Propulsé par Gen·Form
      </div>
    </div>
  );
}
