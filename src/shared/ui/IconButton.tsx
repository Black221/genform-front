import { forwardRef, type ButtonHTMLAttributes } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@/shared/lib/cn';

type Variant = 'default' | 'danger';
type Size    = 'sm' | 'md';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;          // aria-label + tooltip content
  variant?: Variant;
  size?: Size;
  tooltip?: boolean;      // default true
}

const base =
  'inline-flex items-center justify-center rounded-[var(--radius-md)] ' +
  'transition-all duration-[var(--dur)] ease-[var(--ease)] ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ' +
  'disabled:opacity-40 disabled:pointer-events-none active:scale-95 shrink-0';

const variants: Record<Variant, string> = {
  default:
    'text-[var(--color-text-muted)] hover:text-[var(--color-text)] ' +
    'hover:bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]',
  danger:
    'text-[var(--color-text-muted)] hover:text-[var(--color-danger)] ' +
    'hover:bg-[var(--color-danger-soft)]',
};

const sizes: Record<Size, string> = {
  sm: 'size-7  [&>svg]:size-3.5',
  md: 'size-9  [&>svg]:size-4',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, variant = 'default', size = 'md', tooltip = true, className, children, ...props }, ref) => {
    const btn = (
      <button
        ref={ref}
        aria-label={label}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );

    if (!tooltip) return btn;

    return (
      <Tooltip.Provider delayDuration={400}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>{btn}</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="top"
              className={cn(
                'px-2 py-1 text-xs font-medium rounded-[var(--radius-md)] z-50',
                'bg-[var(--color-text)] text-[var(--color-surface)]',
                'animate-fade-in',
              )}
              sideOffset={4}
            >
              {label}
              <Tooltip.Arrow className="fill-[var(--color-text)]" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    );
  },
);
IconButton.displayName = 'IconButton';
