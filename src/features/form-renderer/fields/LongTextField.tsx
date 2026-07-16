import type { UseFormRegister, FieldError } from 'react-hook-form';
import { Textarea } from '@/shared/ui/Input';
import type { Question } from '@/shared/types';

interface Props {
  question: Question;
  register: UseFormRegister<Record<string, unknown>>;
  error?: FieldError;
}

export default function LongTextField({ question, register, error }: Props) {
  return (
    <Textarea
      label={question.label}
      required={question.required}
      error={error?.message}
      placeholder="Votre réponse…"
      {...register(question.id)}
    />
  );
}
