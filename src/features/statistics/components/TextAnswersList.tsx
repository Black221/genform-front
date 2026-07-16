import { useState } from 'react';

interface Props {
  answers: string[];
  fillRate: number;
}

const PAGE_SIZE = 5;

export function TextAnswersList({ answers, fillRate }: Props) {
  const [page, setPage] = useState(0);
  const total = answers.length;
  const slice = answers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const hasNext = (page + 1) * PAGE_SIZE < total;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted">
        {total} réponse{total > 1 ? 's' : ''} · Taux : {Math.round(fillRate * 100)}%
      </p>
      <ul className="flex flex-col gap-2">
        {slice.map((answer, i) => (
          <li key={i} className="px-3 py-2 rounded-theme bg-surface border border-theme text-sm text-(--color-text) leading-relaxed">
            {answer}
          </li>
        ))}
      </ul>
      {(page > 0 || hasNext) && (
        <div className="flex gap-2">
          {page > 0 && (
            <button onClick={() => setPage((p) => p - 1)} className="text-xs text-muted hover:text-(--color-text) transition-colors">
              ← Précédent
            </button>
          )}
          {hasNext && (
            <button onClick={() => setPage((p) => p + 1)} className="text-xs text-muted hover:text-(--color-text) transition-colors ml-auto">
              Suivant →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
