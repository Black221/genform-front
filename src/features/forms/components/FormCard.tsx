import { Link } from 'react-router';
import { Pencil, Trash2, BarChart2, Inbox, Copy, Archive, ArchiveX } from 'lucide-react';
import type { FormSummary } from '@/shared/types';
import { Card } from '@/shared/ui/Card';
import { IconButton } from '@/shared/ui/IconButton';
import { cn } from '@/shared/lib/cn';
import { CATEGORY_LABEL, CATEGORY_COLOR } from '@/shared/lib/formCategories';
import type { FormCategory } from '@/shared/lib/formCategories';

const statusLabel: Record<string, string> = {
  DRAFT: 'Brouillon',
  PUBLISHED: 'Publié',
  INACTIVE: 'Inactif',
  CLOSED: 'Clôturé',
};
const statusColor: Record<string, string> = {
  DRAFT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  PUBLISHED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  INACTIVE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CLOSED: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

interface Props {
  form: FormSummary;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
}

export function FormCard({ form, onDelete, onDuplicate, onArchive }: Props) {
  const categoryLabel = form.category
    ? (CATEGORY_LABEL[form.category as FormCategory] ?? form.category)
    : null;
  const categoryColor = form.category
    ? (CATEGORY_COLOR[form.category as FormCategory] ?? '#6B7570')
    : null;

  return (
    <Card className={cn(
      'hover:border-(--color-primary)/50 transition-all duration-200 group flex flex-col h-full',
      form.archived && 'opacity-60',
    )}>
      {/* Corps */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display font-semibold text-(--color-text) leading-tight line-clamp-2 flex-1">
            {form.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            {form.archived && (
              <span className="text-xs px-2 py-0.5 rounded-full border bg-zinc-500/10 text-zinc-400 border-zinc-500/20">
                Archivé
              </span>
            )}
            <span className={cn('text-xs px-2 py-0.5 rounded-full border', statusColor[form.status])}>
              {statusLabel[form.status]}
            </span>
          </div>
        </div>

        {/* Badges commune / catégorie */}
        {(form.communeId || categoryLabel) && (
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            {form.communeId && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {form.communeId}
              </span>
            )}
            {categoryLabel && (
              <span
                className="text-xs px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: `${categoryColor}18`,
                  color: categoryColor!,
                  borderColor: `${categoryColor}30`,
                }}
              >
                {categoryLabel}
              </span>
            )}
          </div>
        )}

        {form.description && (
          <p className="text-sm text-muted line-clamp-2 mb-2">{form.description}</p>
        )}
      </div>

      {/* Pied de carte */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-theme">
        <p className="text-xs text-muted">
          {form.questionCount} question{form.questionCount !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-0.5">
          <Link to={`/forms/${form.id}/statistics`}>
            <IconButton label="Statistiques" size="sm"><BarChart2 size={14} /></IconButton>
          </Link>
          <Link to={`/forms/${form.id}/responses`}>
            <IconButton label="Réponses" size="sm"><Inbox size={14} /></IconButton>
          </Link>
          <Link to={`/forms/${form.id}/edit`}>
            <IconButton label="Éditer" size="sm"><Pencil size={14} /></IconButton>
          </Link>
          <IconButton
            label="Dupliquer"
            size="sm"
            className="text-blue-400/60 hover:text-blue-400 hover:bg-blue-50"
            onClick={() => onDuplicate(form.id)}
          >
            <Copy size={14} />
          </IconButton>
          <IconButton
            label={form.archived ? 'Désarchiver' : 'Archiver'}
            size="sm"
            className="text-zinc-400/60 hover:text-zinc-400 hover:bg-zinc-50"
            onClick={() => onArchive(form.id)}
          >
            {form.archived ? <ArchiveX size={14} /> : <Archive size={14} />}
          </IconButton>
          <IconButton
            label="Supprimer"
            size="sm"
            className="text-red-400/60 hover:text-red-400 hover:bg-red-50"
            onClick={() => onDelete(form.id)}
          >
            <Trash2 size={14} />
          </IconButton>
        </div>
      </div>
    </Card>
  );
}
