import type { ResponseListParams } from '../api/responsesApi';

interface Props {
  filters: ResponseListParams;
  onChange: (patch: Partial<ResponseListParams>) => void;
}

const selectClass =
  'rounded-lg border border-theme bg-surface px-3 py-1.5 text-sm text-(--color-text) focus:outline-none focus:ring-2 focus:ring-primary/40';

const inputClass =
  'rounded-lg border border-theme bg-surface px-3 py-1.5 text-sm text-(--color-text) focus:outline-none focus:ring-2 focus:ring-primary/40';

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'VALIDATED', label: 'Validées' },
  { value: 'REJECTED', label: 'Rejetées' },
];

export function ResponseFilters({ filters, onChange }: Props) {
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

      {/* Période : du */}
      <label className="flex items-center gap-1.5 text-xs text-muted">
        Du
        <input
          type="date"
          className={inputClass}
          value={filters.from ?? ''}
          onChange={(e) => onChange({ from: e.target.value || undefined })}
        />
      </label>

      {/* Période : au */}
      <label className="flex items-center gap-1.5 text-xs text-muted">
        Au
        <input
          type="date"
          className={inputClass}
          value={filters.to ?? ''}
          onChange={(e) => onChange({ to: e.target.value || undefined })}
        />
      </label>

      {/* Réinitialiser */}
      {(filters.status || filters.from || filters.to || filters.communeId) && (
        <button
          type="button"
          onClick={() => onChange({ status: undefined, from: undefined, to: undefined, communeId: undefined })}
          className="text-xs text-muted hover:text-(--color-text) transition-colors px-2 py-1.5"
        >
          × Réinitialiser
        </button>
      )}
    </div>
  );
}
