import { type HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  raised?: boolean;
  interactive?: boolean;
}

export function Card({ raised = false, interactive = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-(--radius-lg) p-5 transition-all duration-(--dur)',
        'border border-theme bg-surface',
        raised ? 'shadow-(--shadow-md)' : 'shadow-(--shadow-sm)',
        interactive && [
          'cursor-pointer',
          'hover:-translate-y-0.5 hover:shadow-(--shadow-md)',
          'hover:border-[color-mix(in_srgb,var(--color-primary)_40%,transparent)]',
        ],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
