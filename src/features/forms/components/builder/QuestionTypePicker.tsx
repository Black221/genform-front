import type { QuestionType } from '@/shared/types';
import { QUESTION_TYPE_ICON, QUESTION_TYPE_LABEL } from '@/shared/icons';
import { cn } from '@/shared/lib/cn';

const TYPES: QuestionType[] = [
  'TEXT', 'LONG_TEXT', 'SINGLE_CHOICE', 'MULTI_CHOICE', 'SCALE', 'NUMBER', 'DATE', 'FILE',
];

interface Props {
  onSelect: (type: QuestionType) => void;
}

export function QuestionTypePicker({ onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {TYPES.map((type) => {
        const Icon = QUESTION_TYPE_ICON[type];
        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left text-sm',
              'border border-theme bg-surface text-(--color-text)',
              'hover:border-(--color-primary) hover:bg-primary-soft hover:text-primary',
              'transition-all duration-(--dur)',
            )}
          >
            <Icon size={15} className="shrink-0 text-muted" />
            <span className="font-medium">{QUESTION_TYPE_LABEL[type]}</span>
          </button>
        );
      })}
    </div>
  );
}
