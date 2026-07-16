import { useState } from 'react';
import type { UseFormRegister, FieldError } from 'react-hook-form';
import { cn } from '@/shared/lib/cn';
import type { Question } from '@/shared/types';

interface Props {
  question: Question;
  register: UseFormRegister<Record<string, unknown>>;
  error?: FieldError;
}

export default function ScaleField({ question, register, error }: Props) {
  const min = question.min ?? 1;
  const max = question.max ?? 5;
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const { onChange, ...rest } = register(question.id);

  return (
    <fieldset>
      <legend className="text-sm font-medium text-[var(--color-text)] mb-3">
        {question.label}
        {question.required && <span className="text-red-400 ml-1">*</span>}
      </legend>
      <div className="flex gap-2 flex-wrap">
        {steps.map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => {
              setSelected(n);
              onChange({ target: { name: question.id, value: n } });
            }}
            className={cn(
              'w-10 h-10 rounded-[var(--radius-sm)] border text-sm font-medium transition-all duration-100',
              (hovered !== null ? n <= hovered : n <= (selected ?? -1))
                ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-bg)]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]',
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <input type="hidden" value={selected ?? ''} {...rest} />
      {error && <p className="text-xs text-red-400 mt-1">{error.message}</p>}
    </fieldset>
  );
}
