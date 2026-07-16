import { Link } from 'react-router';
import { LayoutDashboard, ChevronLeft, Filter, RotateCcw, MapPin, Dot, Flame, Grid3x3 } from 'lucide-react';
import { useMapStore, type DisplayMode } from '../store/mapStore';
import { useAuth } from '@/features/auth/useAuth';
import { CATEGORY_LABEL, FORM_CATEGORIES } from '@/shared/lib/formCategories';
import type { ObservationStatus } from '../api/mapApi';

const MODES: { key: DisplayMode; label: string; icon: React.ReactNode }[] = [
  { key: 'points',     label: 'Points',      icon: <Dot className="size-4" /> },
  { key: 'heatmap',    label: 'Chaleur',     icon: <Flame className="size-3.5" /> },
  { key: 'choropleth', label: 'Choroplèthe', icon: <Grid3x3 className="size-3.5" /> },
];

interface Props {
  communeName?: string;
}

export function MapTopbar({ communeName }: Props) {
  const view = useMapStore((s) => s.view);
  const displayMode = useMapStore((s) => s.displayMode);
  const filters = useMapStore((s) => s.filters);
  const backToNational = useMapStore((s) => s.backToNational);
  const setDisplayMode = useMapStore((s) => s.setDisplayMode);
  const patchFilters = useMapStore((s) => s.patchFilters);
  const role = useAuth((s) => s.role);

  const canSeeAll = role === 'ADMIN' || role === 'COORDINATOR';
  const activeFilterCount =
    [filters.category, filters.status, filters.from, filters.to].filter(Boolean).length;

  return (
    <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center gap-x-2 gap-y-1.5 px-2.5 py-2
                    bg-white/75 backdrop-blur-xl border border-white/60 rounded-2xl
                    shadow-[0_10px_40px_-12px_rgba(21,37,46,0.4)]">

      {/* Retour dashboard */}
      <Link
        to="/dashboard"
        className="flex items-center justify-center size-8 shrink-0 rounded-xl text-muted hover:text-primary
                   hover:bg-primary/8 transition-colors"
        title="Retour au tableau de bord"
        aria-label="Tableau de bord"
      >
        <LayoutDashboard className="size-4 shrink-0" />
      </Link>

      {/* Breadcrumb commune */}
      <div className="flex items-center gap-2 shrink-0 min-w-0 pl-1 pr-1">
        {view === 'commune' && (
          <button
            onClick={backToNational}
            className="flex items-center gap-1 h-7 pl-1 pr-2 rounded-lg text-xs font-medium text-primary
                       bg-primary/10 hover:bg-primary/15 transition-colors -ml-1 shrink-0
                       focus:outline-none focus:ring-2 focus:ring-primary/30"
            title="Revenir à toutes les communes"
          >
            <ChevronLeft className="size-4 shrink-0" />
            <span className="hidden sm:inline">Toutes les communes</span>
          </button>
        )}
        <span className="flex items-center justify-center size-7 rounded-lg bg-primary/10 shrink-0">
          <MapPin className="size-4 text-primary" />
        </span>
        <span className="flex flex-col min-w-0 leading-tight">
          <span className="text-[10px] font-medium text-muted uppercase tracking-wide hidden sm:block">
            {view === 'commune' ? 'Commune' : 'Vue nationale'}
          </span>
          <span className="text-sm font-display font-semibold text-(--color-text) truncate max-w-35 sm:max-w-44">
            {view === 'commune' && communeName ? communeName : 'Observatoire citoyen'}
          </span>
        </span>
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-border/60 hidden sm:block mx-0.5" />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-muted">
          <Filter className="size-3.5" />
          Filtres
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[10px] font-semibold">
              {activeFilterCount}
            </span>
          )}
        </span>
        {/* Category */}
        <select
          value={filters.category ?? ''}
          onChange={(e) => patchFilters({ category: e.target.value || undefined })}
          className="h-8 text-xs rounded-lg border border-border/70 bg-white/70 px-2.5 text-(--color-text) hover:border-primary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors"
        >
          <option value="">Toutes catégories</option>
          {FORM_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {CATEGORY_LABEL[c.value as keyof typeof CATEGORY_LABEL]}
            </option>
          ))}
        </select>

        {/* Status — visible aux coordinateurs/admin */}
        {canSeeAll && (
          <select
            value={filters.status ?? ''}
            onChange={(e) => patchFilters({ status: (e.target.value as ObservationStatus) || undefined })}
            className="h-8 text-xs rounded-lg border border-border/70 bg-white/70 px-2.5 text-(--color-text) hover:border-primary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors"
          >
            <option value="">Tous statuts</option>
            <option value="PENDING">En attente</option>
            <option value="VALIDATED">Validées</option>
            <option value="REJECTED">Rejetées</option>
          </select>
        )}

        {/* From */}
        <input
          type="date"
          value={filters.from ?? ''}
          onChange={(e) => patchFilters({ from: e.target.value || undefined })}
          className="h-8 text-xs rounded-lg border border-border/70 bg-white/70 px-2.5 text-(--color-text) hover:border-primary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors"
        />

        {/* To */}
        <input
          type="date"
          value={filters.to ?? ''}
          onChange={(e) => patchFilters({ to: e.target.value || undefined })}
          className="h-8 text-xs rounded-lg border border-border/70 bg-white/70 px-2.5 text-(--color-text) hover:border-primary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors"
        />

        {/* Reset */}
        {activeFilterCount > 0 && (
          <button
            onClick={() => patchFilters({ category: undefined, status: undefined, from: undefined, to: undefined })}
            className="flex items-center gap-1 h-8 px-2.5 text-xs rounded-lg text-muted hover:text-danger hover:bg-(--color-danger-soft) transition-colors"
            title="Réinitialiser les filtres"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden lg:inline">Réinitialiser</span>
          </button>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Display mode toggle — segmented control */}
      <div className="flex items-center gap-0.5 rounded-xl bg-black/5 p-0.5 shrink-0">
        {MODES.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setDisplayMode(key)}
            title={label}
            className={[
              'flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-medium transition-all',
              displayMode === key
                ? 'bg-white text-primary shadow-sm'
                : 'text-muted hover:text-(--color-text)',
            ].join(' ')}
          >
            {icon}
            <span className="hidden md:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
