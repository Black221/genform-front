import { z } from 'zod';
import type { Question } from '@/shared/types';

export function buildZodSchema(questions: Question[]): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const q of questions) {
    let field: z.ZodTypeAny;

    switch (q.type) {
      case 'TEXT':
        field = z.string();
        break;
      case 'LONG_TEXT':
        field = z.string();
        break;
      case 'SINGLE_CHOICE':
        field = z.string();
        break;
      case 'MULTI_CHOICE':
        field = z.array(z.string()).min(q.required ? 1 : 0);
        break;
      case 'SCALE':
      case 'NUMBER':
        field = z.number({
          invalid_type_error: 'Valeur numérique requise',
        });
        if (q.min !== undefined) field = (field as z.ZodNumber).min(q.min);
        if (q.max !== undefined) field = (field as z.ZodNumber).max(q.max);
        break;
      case 'DATE':
        field = z.string();
        break;
      case 'LOCATION':
        field = z.object({
          lat: z.number(),
          lng: z.number(),
          source: z.enum(['GPS', 'MANUAL']),
        });
        break;
      case 'PHOTO':
        field = z.array(z.object({
          id: z.string(),
          blob: z.instanceof(Blob),
          preview: z.string(),
          contentType: z.string(),
        }));
        if (q.required) {
          field = (field as z.ZodArray<z.ZodTypeAny>).min(1, 'Au moins une photo requise');
        }
        break;
      case 'FILE':
        field = z.array(z.object({
          id: z.string(),
          file: z.instanceof(File),
          name: z.string(),
          size: z.number(),
        }));
        if (q.required) {
          field = (field as z.ZodArray<z.ZodTypeAny>).min(1, 'Au moins un fichier requis');
        }
        break;
      default:
        field = z.unknown();
    }

    if (q.type !== 'LOCATION' && q.type !== 'PHOTO' && q.type !== 'FILE') {
      if (q.required) {
        if (field instanceof z.ZodString) field = field.min(1, 'Ce champ est requis');
      } else {
        field = field.optional();
      }
    } else if (!q.required) {
      field = field.optional();
    }

    shape[q.id] = field;
  }

  return z.object(shape);
}
