import type { UseFormRegister, FieldError } from 'react-hook-form';
import type { Question } from '@/shared/types';

interface Props {
  question: Question;
  register: UseFormRegister<Record<string, unknown>>;
  error?: FieldError;
}

export default function SingleChoiceField({ question, register, error }: Props) {
  const options = question.options ?? [];
  return (
    <fieldset>
      <legend className="text-sm font-display font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
        {question.label}
        {question.required && <span className="ml-1" style={{ color: 'var(--color-danger, #C2453B)' }}>*</span>}
      </legend>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <label
            key={opt}
            className="group relative flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer border transition-all duration-150 has-checked:border-primary has-checked:bg-primary-soft"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
          >
            <input
              type="radio"
              value={opt}
              className="sr-only"
              {...register(question.id)}
            />
            {/* Radio custom */}
            <span
              className="size-4 rounded-full border-2 shrink-0 transition-all duration-150 flex items-center justify-center group-has-checked:border-primary"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <span
                className="size-2 rounded-full transition-transform duration-150 scale-0 group-has-checked:scale-100"
                style={{ background: 'var(--color-primary)' }}
              />
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{opt}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-xs font-medium" style={{ color: 'var(--color-danger, #C2453B)' }}>
          {error.message}
        </p>
      )}
    </fieldset>
  );
}
