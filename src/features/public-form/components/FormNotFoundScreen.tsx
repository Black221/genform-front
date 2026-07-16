export function FormNotFoundScreen() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="absolute inset-0 topo-pattern" style={{ opacity: 0.3 }} />
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm animate-rise">
        <div
          className="size-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--color-danger-soft, #FBEAE9)' }}
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" strokeWidth={1.8}
               stroke="var(--color-danger, #C2453B)">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            Formulaire introuvable
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Ce lien n'est plus valide ou le formulaire a été clôturé.
          </p>
        </div>
      </div>
    </div>
  );
}
