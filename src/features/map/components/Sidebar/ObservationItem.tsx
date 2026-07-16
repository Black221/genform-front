import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/Badge';
import { CATEGORY_COLOR, CATEGORY_LABEL } from '@/shared/lib/formCategories';
import type { ObservationProperties, ObservationStatus } from '../../api/mapApi';

const STATUS_VARIANT: Record<ObservationStatus, 'default' | 'success' | 'danger'> = {
  PENDING: 'default',
  VALIDATED: 'success',
  REJECTED: 'danger',
};

const STATUS_LABEL: Record<ObservationStatus, string> = {
  PENDING: 'En attente',
  VALIDATED: 'Validée',
  REJECTED: 'Rejetée',
};

interface Props {
  feature: GeoJSON.Feature;
  selected: boolean;
  hovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function ObservationItem({ feature, selected, hovered, onClick, onMouseEnter, onMouseLeave }: Props) {
  const props = feature.properties as ObservationProperties;
  const categoryColor = props.category ? CATEGORY_COLOR[props.category as keyof typeof CATEGORY_COLOR] : '#6B7570';
  const categoryLabel = props.category ? CATEGORY_LABEL[props.category as keyof typeof CATEGORY_LABEL] : 'Autre';
  const date = props.submittedAt ? new Date(props.submittedAt).toLocaleDateString('fr-SN', { day: '2-digit', month: 'short' }) : '';

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'w-full text-left px-3 py-2.5 border-b border-border/40 transition-colors',
        'hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)]',
        selected && 'bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] border-l-2 border-l-primary pl-[calc(0.75rem-2px)]',
        hovered && !selected && 'bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]',
      )}
    >
      <div className="flex items-start gap-2">
        <span
          className="mt-1 size-2 rounded-full shrink-0"
          style={{ backgroundColor: categoryColor }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-(--color-text) truncate">
            {props.formTitle ?? categoryLabel}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[11px] text-muted">{date}</span>
            {props.status && (
              <Badge variant={STATUS_VARIANT[props.status]} className="text-[10px] px-1.5 py-0">
                {STATUS_LABEL[props.status]}
              </Badge>
            )}
            {props.hasMedia && (
              <svg viewBox="0 0 16 16" className="size-3 text-muted" fill="currentColor">
                <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm2 0v5.17l1.41-1.41a1 1 0 011.42 0L8 9l1.17-1.17a1 1 0 011.42 0L12 9.17V4H4zm0 8h8v-.17l-1.41-1.41L9 12l-1.17-1.17L6.59 12.17 5 10.83V12H4zm4-6a1 1 0 110 2 1 1 0 010-2z" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
