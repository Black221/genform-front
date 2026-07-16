import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** Icône lucide placée à gauche du label */
  icon?: React.ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 font-display font-semibold ' +
  'transition-all duration-[var(--dur)] ease-[var(--ease)] ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ' +
  'disabled:pointer-events-none disabled:opacity-40 select-none active:scale-[0.97]';

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--color-primary)] text-[#fff] shadow-[var(--shadow-sm)] ' +
    'hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-md)] hover:-translate-y-px',
  secondary:
    'bg-[var(--color-surface)] text-[var(--color-primary)] ' +
    'border border-[var(--color-border)] ' +
    'hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]',
  ghost:
    'text-[var(--color-text-muted)] hover:text-[var(--color-text)] ' +
    'hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]',
  accent:
    'bg-[var(--color-accent)] text-[#fff] shadow-[var(--shadow-sm)] ' +
    'hover:opacity-90 hover:shadow-[var(--shadow-md)] hover:-translate-y-px',
  danger:
    'bg-[var(--color-danger-soft)] text-[var(--color-danger)] ' +
    'border border-[color-mix(in_srgb,var(--color-danger)_20%,transparent)] ' +
    'hover:bg-[color-mix(in_srgb,var(--color-danger)_14%,var(--color-surface))]',
};

const sizes: Record<Size, string> = {
  sm: 'h-8  px-3   text-xs  rounded-[var(--radius-md)]',
  md: 'h-10 px-4.5 text-sm  rounded-[var(--radius-md)]',
  lg: 'h-12 px-6   text-base rounded-[var(--radius-lg)]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading
        ? <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        : icon && <span className="size-4 shrink-0">{icon}</span>
      }
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
