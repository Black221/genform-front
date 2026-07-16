import type { UseFormRegister, FieldError } from 'react-hook-form';
import { Input } from '@/shared/ui/Input';
import type { Question } from '@/shared/types';

interface Props {
  question: Question;
  register: UseFormRegister<Record<string, unknown>>;
  error?: FieldError;
}

export default function NumberField({ question, register, error }: Props) {
  return (
    <Input
      label={question.label}
      type="number"
      required={question.required}
      min={question.min}
      max={question.max}
      step={question.step ?? 1}
      error={error?.message}
      inputMode="numeric"
      {...register(question.id, { valueAsNumber: true })}
    />
  );
}
