import { lazy } from 'react';
import type { QuestionType } from '@/shared/types';
import type { ComponentType } from 'react';
import type { UseFormRegister, FieldError, Control } from 'react-hook-form';
import type { Question } from '@/shared/types';

export interface FieldProps {
  question: Question;
  register: UseFormRegister<Record<string, unknown>>;
  error?: FieldError;
  control?: Control<Record<string, unknown>>;
}

export const fieldRegistry: Record<QuestionType, ComponentType<FieldProps>> = {
  TEXT: lazy(() => import('./fields/TextField')),
  LONG_TEXT: lazy(() => import('./fields/LongTextField')),
  SINGLE_CHOICE: lazy(() => import('./fields/SingleChoiceField')),
  MULTI_CHOICE: lazy(() => import('./fields/MultiChoiceField')),
  SCALE: lazy(() => import('./fields/ScaleField')),
  NUMBER: lazy(() => import('./fields/NumberField')),
  DATE: lazy(() => import('./fields/DateField')),
  LOCATION: lazy(() => import('./fields/LocationField')),
  PHOTO: lazy(() => import('./fields/PhotoField')),
  FILE: lazy(() => import('./fields/FileField')),
};
