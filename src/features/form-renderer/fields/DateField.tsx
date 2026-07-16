import type { UseFormRegister, FieldError } from 'react-hook-form';
import { Input } from '@/shared/ui/Input';
import type { Question } from '@/shared/types';

interface Props {
  question: Question;
  register: UseFormRegister<Record<string, unknown>>;
  error?: FieldError;
}

export default function DateField({ question, register, error }: Props) {
  return (
    <Input
      label={question.label}
      type="date"
      required={question.required}
      error={error?.message}
      {...register(question.id)}
    />
  );
}
