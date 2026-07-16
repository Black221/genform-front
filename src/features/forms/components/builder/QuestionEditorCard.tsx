import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { GripVertical, Trash2, ChevronRight, GitBranch } from 'lucide-react';
import type { Question, QuestionType } from '@/shared/types';
import { cn } from '@/shared/lib/cn';
import { IconButton } from '@/shared/ui/IconButton';
import { Input } from '@/shared/ui/Input';
import { QUESTION_TYPE_ICON, QUESTION_TYPE_LABEL } from '@/shared/icons';
import { ChoiceEditor } from './ChoiceEditor';
import { ConditionalLogicEditor } from './ConditionalLogicEditor';

interface Props {
  question: Question;
  onChange: (q: Question) => void;
  onDelete: () => void;
  allQuestions?: Question[];
}

export function QuestionEditorCard({ question, onChange, onDelete, allQuestions = [] }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: question.id });
  const [expanded, setExpanded] = useState(true);
  const [showConditions, setShowConditions] = useState(false);

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  const TypeIcon = QUESTION_TYPE_ICON[question.type as QuestionType];
  const hasConditions = (question.conditions?.length ?? 0) > 0;
  const isChoice = question.type === 'SINGLE_CHOICE' || question.type === 'MULTI_CHOICE';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-(--radius-lg) border border-theme bg-surface shadow-(--shadow-sm)',
        'transition-shadow duration-(--dur)',
        isDragging && 'shadow-(--shadow-lift)',
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Poignée */}
        <button
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing text-muted hover:text-(--color-text) shrink-0 p-0.5 rounded"
          aria-label="Déplacer la question"
        >
          <GripVertical size={15} />
        </button>

        {/* Badge type */}
        <span className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-pill bg-primary-soft text-primary font-medium shrink-0">
          <TypeIcon size={11} />
          {QUESTION_TYPE_LABEL[question.type as QuestionType]}
        </span>

        {/* Conditionnel badge */}
        {hasConditions && (
          <span className="text-xs px-1.5 py-0.5 rounded-pill bg-(--color-accent-soft) text-accent font-medium shrink-0">
            conditionnel
          </span>
        )}

        {/* Libellé tronqué */}
        <span className="text-sm text-(--color-text) truncate flex-1 select-none">
          {question.label || <span className="text-muted italic">Sans titre</span>}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          {allQuestions.length > 1 && (
            <IconButton
              label="Logique conditionnelle"
              size="sm"
              onClick={() => setShowConditions((v) => !v)}
              className={showConditions ? 'text-primary bg-primary-soft' : ''}
            >
              <GitBranch size={14} />
            </IconButton>
          )}
          <IconButton
            label={expanded ? 'Réduire' : 'Développer'}
            size="sm"
            onClick={() => setExpanded((p) => !p)}
          >
            <ChevronRight size={14} className={cn('transition-transform duration-(--dur)', expanded && 'rotate-90')} />
          </IconButton>
          <IconButton label="Supprimer la question" variant="danger" size="sm" onClick={onDelete}>
            <Trash2 size={14} />
          </IconButton>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-theme pt-4">
          <Input
            label="Libellé de la question"
            value={question.label}
            onChange={(e) => onChange({ ...question, label: e.target.value })}
            placeholder="Votre question…"
          />

          {/* Éditeur de choix Notion-style */}
          {isChoice && (
            <div className="space-y-1.5">
              <label className="text-sm font-display font-medium text-(--color-text)">Options</label>
              <ChoiceEditor
                options={question.options ?? ['']}
                isSingle={question.type === 'SINGLE_CHOICE'}
                onChange={(options) => onChange({ ...question, options })}
              />
            </div>
          )}

          {/* Min / Max */}
          {(question.type === 'SCALE' || question.type === 'NUMBER') && (
            <div className="flex gap-3">
              <Input
                label="Min"
                type="number"
                value={question.min ?? ''}
                onChange={(e) => onChange({ ...question, min: Number(e.target.value) })}
              />
              <Input
                label="Max"
                type="number"
                value={question.max ?? ''}
                onChange={(e) => onChange({ ...question, max: Number(e.target.value) })}
              />
            </div>
          )}

          {/* Obligatoire */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => onChange({ ...question, required: e.target.checked })}
              className="size-4 rounded accent-(--color-primary)"
            />
            <span className="text-sm text-muted">Réponse obligatoire</span>
          </label>

          {/* Logique conditionnelle */}
          {showConditions && allQuestions.length > 1 && (
            <div className="border-t border-theme pt-4">
              <ConditionalLogicEditor
                question={question}
                allQuestions={allQuestions}
                onChange={(conditions) => onChange({ ...question, conditions })}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
