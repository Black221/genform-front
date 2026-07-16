import { FORM_CATEGORIES } from '@/shared/lib/formCategories';
import { useCommunes } from '@/features/users/hooks/useUsers';
import type { FormListParams } from '../api/formsApi';

interface Props {
  filters: FormListParams & { archived?: boolean };
  onChange: (patch: Partial<FormListParams & { archived?: boolean }>) => void;
}

const selectClass =
  'rounded-lg border border-theme bg-surface px-3 py-1.5 text-sm text-(--color-text) focus:outline-none focus:ring-2 focus:ring-primary/40';

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'PUBLISHED', label: 'Publié' },
  { value: 'INACTIVE', label: 'Inactif' },
  { value: 'CLOSED', label: 'Clôturé' },
];

export function FormListFilters({ filters, onChange }: Props) {
  const { data: communes = [] } = useCommunes();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Statut */}
      <select
        className={selectClass}
        value={filters.status ?? ''}
        onChange={(e) => onChange({ status: e.target.value || undefined })}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Commune */}
      {communes.length > 0 && (
        <select
          className={selectClass}
          value={filters.communeId ?? ''}
          onChange={(e) => onChange({ communeId: e.target.value || undefined })}
        >
          <option value="">Toutes les communes</option>
          {communes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      )}

      {/* Catégorie */}
      <select
        className={selectClass}
        value={filters.category ?? ''}
        onChange={(e) => onChange({ category: e.target.value || undefined })}
      >
        <option value="">Toutes les catégories</option>
        {FORM_CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>

      {/* Archivés */}
      <label className="flex items-center gap-1.5 text-sm text-muted cursor-pointer select-none">
        <input
          type="checkbox"
          className="accent-primary"
          checked={filters.archived === true}
          onChange={(e) => onChange({ archived: e.target.checked ? true : undefined })}
        />
        Afficher les archivés
      </label>
    </div>
  );
}
