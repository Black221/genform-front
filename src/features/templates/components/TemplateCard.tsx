import type { Template } from '@/shared/types';
import { cn } from '@/shared/lib/cn';
import { CATEGORY_LABEL, CATEGORY_COLOR, type FormCategory } from '@/shared/lib/formCategories';
import { List, FilePlus } from 'lucide-react';

interface Props {
  template: Template;
  onClick: () => void;
  onUse?: () => void;
  onDelete?: () => void;
  selected?: boolean;
}

export function TemplateCard({ template, onClick, onUse, onDelete, selected }: Props) {
  const questionCount = template.questions.length;
  const sectionCount = template.sections.length;
  const category = template.category as FormCategory | undefined;
  const categoryLabel = category ? CATEGORY_LABEL[category] : undefined;
  const categoryColor = category ? CATEGORY_COLOR[category] : undefined;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={cn(
        'group relative flex flex-col rounded-theme border overflow-hidden transition-all cursor-pointer',
        selected
          ? 'border-(--color-primary) ring-2 ring-(--color-primary)/30'
          : 'border-theme hover:border-(--color-primary)/60 hover:shadow-sm',
      )}
    >
      {/* Visual preview */}
      <div className="h-28 relative flex items-center justify-center" style={{ background: '#ECF1EF' }}>
        <div className="flex flex-col gap-2 w-3/4">
          <div className="h-2.5 rounded-full bg-[#D8E0DD] w-full" />
          <div className="h-2 rounded-full bg-[#D8E0DD] w-4/5" />
          <div className="h-7 rounded-lg bg-white border border-[#D8E0DD] w-full mt-1" />
          <div className="h-7 rounded-lg bg-white border border-[#D8E0DD] w-full" />
        </div>
        <div className="absolute top-2 left-2 flex items-center gap-1">
          {template.isSystem && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 text-[#576A65]">
              Système
            </span>
          )}
          {categoryLabel && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium text-white"
              style={{ background: categoryColor }}
            >
              {categoryLabel}
            </span>
          )}
        </div>

        {/* Delete on hover */}
        {onDelete && !template.isSystem && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-red-500/40 text-red-200 hover:bg-red-500/60 transition-all opacity-0 group-hover:opacity-100"
          >
            ✕
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 bg-surface flex-1">
        <p className="font-display font-semibold text-sm text-(--color-text) truncate">{template.name}</p>
        {template.description && (
          <p className="text-xs text-muted line-clamp-2">{template.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1 text-xs text-muted">
          <List size={11} />
          <span>{questionCount} question{questionCount !== 1 ? 's' : ''}</span>
          {sectionCount > 0 && <span>· {sectionCount} section{sectionCount !== 1 ? 's' : ''}</span>}
        </div>
      </div>

      {/* Utiliser button */}
      {onUse && (
        <div className="px-3 pb-3 bg-surface">
          <button
            onClick={(e) => { e.stopPropagation(); onUse(); }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-colors"
            style={{ borderColor: '#D8E0DD', color: '#576A65', background: 'white' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0B6E63';
              e.currentTarget.style.color = '#0B6E63';
              e.currentTarget.style.background = '#DCEFEC';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#D8E0DD';
              e.currentTarget.style.color = '#576A65';
              e.currentTarget.style.background = 'white';
            }}
          >
            <FilePlus size={12} />
            Utiliser
          </button>
        </div>
      )}
    </div>
  );
}
