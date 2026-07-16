import type { Question } from '@/shared/types';

type Condition = { questionId: string; operator: 'eq' | 'neq' | 'contains'; value: string };

interface Props {
  question: Question;
  allQuestions: Question[];
  onChange: (conditions: Condition[]) => void;
}

const OPERATORS = [
  { value: 'eq', label: 'est égal à' },
  { value: 'neq', label: 'est différent de' },
  { value: 'contains', label: 'contient' },
];

export function ConditionalLogicEditor({ question, allQuestions, onChange }: Props) {
  const conditions = (question.conditions ?? []) as Condition[];
  const available = allQuestions.filter((q) => q.id !== question.id && q.position < question.position);

  const update = (idx: number, patch: Partial<Condition>) => {
    const next = conditions.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    onChange(next);
  };

  const add = () => {
    if (available.length === 0) return;
    onChange([...conditions, { questionId: available[0].id, operator: 'eq', value: '' }]);
  };

  const remove = (idx: number) => onChange(conditions.filter((_, i) => i !== idx));

  if (available.length === 0) {
    return <p className="text-xs text-muted italic">Pas de questions précédentes pour conditionner.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted">Afficher si :</p>
      {conditions.map((cond, i) => (
        <div key={i} className="flex items-center gap-1.5 flex-wrap">
          <select
            value={cond.questionId}
            onChange={(e) => update(i, { questionId: e.target.value })}
            className="bg-app border border-theme rounded px-2 py-1 text-xs text-(--color-text) focus:outline-none"
          >
            {available.map((q) => (
              <option key={q.id} value={q.id}>{q.label || `Question ${q.position + 1}`}</option>
            ))}
          </select>
          <select
            value={cond.operator}
            onChange={(e) => update(i, { operator: e.target.value as Condition['operator'] })}
            className="bg-app border border-theme rounded px-2 py-1 text-xs text-(--color-text) focus:outline-none"
          >
            {OPERATORS.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
          </select>
          <input
            value={cond.value}
            onChange={(e) => update(i, { value: e.target.value })}
            placeholder="valeur"
            className="flex-1 min-w-20 bg-app border border-theme rounded px-2 py-1 text-xs text-(--color-text) focus:outline-none focus:border-(--color-primary)"
          />
          <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-300 text-xs px-1">✕</button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-xs text-muted hover:text-primary transition-colors self-start">
        + Ajouter une condition
      </button>
    </div>
  );
}
