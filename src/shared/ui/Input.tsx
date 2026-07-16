import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const fieldBase =
  'w-full px-4 py-2.5 rounded-[var(--radius-theme)] bg-[var(--color-surface)] ' +
  'border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] ' +
  'text-sm transition-all duration-150 ' +
  'focus:outline-none focus:border-[var(--color-primary)] ' +
  'focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-display font-medium text-[var(--color-text)]"
          >
            {label}
            {props.required && <span className="text-[var(--brand-red)] ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            fieldBase,
            error &&
              'border-[var(--brand-red)] focus:border-[var(--brand-red)] focus:ring-[color-mix(in_srgb,var(--brand-red)_14%,transparent)]',
            className,
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>}
        {error && <p className="text-xs text-[var(--brand-red)] font-medium">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-display font-medium text-[var(--color-text)]">
            {label}
            {props.required && <span className="text-[var(--brand-red)] ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={4}
          className={cn(fieldBase, 'resize-y', error && 'border-[var(--brand-red)]', className)}
          {...props}
        />
        {error && <p className="text-xs text-[var(--brand-red)] font-medium">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
