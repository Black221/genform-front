import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Dialog({ open, onOpenChange, trigger, title, description, children, className }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in" />
        <DialogPrimitive.Content
          style={{ transform: 'translate(-50%, -50%)' }}
          className={cn(
            'fixed left-1/2 top-1/2 z-50',
            'w-full max-w-lg bg-surface border border-theme',
            'rounded-(--radius-lg) p-6 shadow-(--shadow-lift)',
            'animate-scale-in',
            className,
          )}
        >
          <DialogPrimitive.Title className="font-display text-lg font-semibold text-(--color-text) mb-1">
            {title}
          </DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description className="text-sm text-muted mb-5">
              {description}
            </DialogPrimitive.Description>
          )}
          {children}
          <DialogPrimitive.Close
            className={cn(
              'absolute top-4 right-4 size-7 rounded-md',
              'flex items-center justify-center',
              'text-muted hover:text-(--color-text)',
              'hover:bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]',
              'transition-all duration-(--dur)',
            )}
            aria-label="Fermer"
          >
            <X size={15} />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
