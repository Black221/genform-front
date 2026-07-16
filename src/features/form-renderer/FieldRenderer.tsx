import { Suspense } from 'react';
import { fieldRegistry, type FieldProps } from './fieldRegistry';

export default function FieldRenderer({ question, register, error, control }: FieldProps) {
  const Field = fieldRegistry[question.type];
  if (!Field) return null;

  return (
    <Suspense fallback={<div className="h-12 rounded-theme bg-(--color-surface-raised) animate-pulse" />}>
      <Field question={question} register={register} error={error} control={control} />
    </Suspense>
  );
}
