import { CalendarX } from 'lucide-react';

export function FormUnavailableScreen() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="absolute inset-0 topo-pattern" style={{ opacity: 0.3 }} />
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm animate-rise">
        <div
          className="size-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
        >
          <CalendarX size={28} style={{ color: 'var(--color-primary)' }} />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            Formulaire non disponible
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            La période de collecte est terminée ou le quota de réponses a été atteint.
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)', opacity: 0.65 }}>
            Contactez l'organisateur si vous pensez que c'est une erreur.
          </p>
        </div>
      </div>
    </div>
  );
}
