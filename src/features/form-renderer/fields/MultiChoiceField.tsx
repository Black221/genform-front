import type { UseFormRegister, FieldError } from 'react-hook-form';
import type { Question } from '@/shared/types';

interface Props {
  question: Question;
  register: UseFormRegister<Record<string, unknown>>;
  error?: FieldError;
}

export default function MultiChoiceField({ question, register, error }: Props) {
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
              type="checkbox"
              value={opt}
              className="sr-only"
              {...register(question.id)}
            />
            {/* Checkbox custom */}
            <span
              className="size-4 rounded-md border-2 shrink-0 transition-all duration-150 flex items-center justify-center group-has-checked:border-primary group-has-checked:bg-primary"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <svg
                className="size-2.5 text-white opacity-0 scale-75 transition-all duration-150 group-has-checked:opacity-100 group-has-checked:scale-100"
                viewBox="0 0 10 8" fill="none"
              >
                <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
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
