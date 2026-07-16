import type { PublicSection, Question } from '@/shared/types';
import type { UseFormRegister, FieldErrors, Control } from 'react-hook-form';
import FieldRenderer from './FieldRenderer';
import BlockRenderer from './BlockRenderer';

interface Props {
  section: PublicSection;
  register: UseFormRegister<Record<string, unknown>>;
  errors: FieldErrors<Record<string, unknown>>;
  control?: Control<Record<string, unknown>>;
  visibleQuestionIds?: Set<string>;
}

export function SectionRenderer({ section, register, errors, control, visibleQuestionIds }: Props) {
  let qNum = 0;

  return (
    <div className="flex flex-col gap-7">
      {section.title && (
        <div
          className="pb-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h3
            className="font-display font-bold text-2xl"
            style={{ color: 'var(--color-text)' }}
          >
            {section.title}
          </h3>
          {section.description && (
            <p className="mt-1.5 text-base" style={{ color: 'var(--color-text-muted)' }}>
              {section.description}
            </p>
          )}
        </div>
      )}

      {section.items.map((item) => {
        if (item.kind === 'CONTENT_BLOCK') {
          return (
            <BlockRenderer
              key={item.id}
              type={item.type as import('@/shared/types').ContentBlockType}
              content={item.content ?? {}}
            />
          );
        }

        if (visibleQuestionIds && !visibleQuestionIds.has(item.id)) return null;

        qNum += 1;
        const num = qNum;

        const question: Question = {
          id: item.id,
          label: item.label ?? '',
          type: item.type as Question['type'],
          required: item.required ?? false,
          position: item.position,
          options: item.options,
          min: item.min,
          max: item.max,
          step: item.step,
          format: item.format,
        };

        return (
          <div key={item.id} className="flex gap-4 animate-fade-in">
            {/* Numéro */}
            <div className="pt-0.5 shrink-0">
              <span
                className="size-6 rounded-md flex items-center justify-center text-xs font-bold font-mono"
                style={{
                  background: 'var(--color-primary-soft, #DCEFEC)',
                  color: 'var(--color-primary)',
                }}
              >
                {num}
              </span>
            </div>
            {/* Champ */}
            <div className="flex-1 min-w-0">
              <FieldRenderer
                question={question}
                register={register as never}
                error={errors[item.id] as never}
                control={control as never}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
