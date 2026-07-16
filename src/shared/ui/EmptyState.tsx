import { cn } from '@/shared/lib/cn';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  icon?: React.ReactNode;
  className?: string;
}

/** Motif courbes de niveau discret — élément signature de l'identité */
function TopoLines() {
  return (
    <svg
      aria-hidden
      className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
      viewBox="0 0 400 200"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      {[20, 45, 70, 95, 120].map((r, i) => (
        <ellipse
          key={r}
          cx="200" cy="100"
          rx={r * 1.8} ry={r}
          stroke="var(--color-primary)"
          strokeWidth="0.8"
          strokeOpacity={0.25 - i * 0.04}
          fill="none"
        />
      ))}
    </svg>
  );
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center gap-4',
        'rounded-(--radius-lg) border border-dashed border-theme',
        'py-16 px-8 text-center overflow-hidden',
        className,
      )}
    >
      <TopoLines />

      {icon && (
        <div className="relative z-10 size-12 rounded-full bg-primary-soft flex items-center justify-center text-(--color-primary)">
          {icon}
        </div>
      )}

      <div className="relative z-10 space-y-1">
        <p className="font-display font-semibold text-(--color-text)">{title}</p>
        {description && (
          <p className="text-sm text-muted max-w-xs">{description}</p>
        )}
      </div>

      {action && (
        <div className="relative z-10">
          <Button variant="secondary" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
