interface Props {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: Props) {
  const pct = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center">
      {/* Barre de progression */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'var(--color-border)' }}>
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, background: 'var(--color-primary)' }}
          role="progressbar"
          aria-valuenow={current + 1}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>
    </div>
  );
}
