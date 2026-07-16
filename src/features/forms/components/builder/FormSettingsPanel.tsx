import type { FormAccess, PresentationMode } from '@/shared/types';
import { FORM_CATEGORIES } from '@/shared/lib/formCategories';
import { useCommunes } from '@/features/users/hooks/useUsers';
import { PresentationModePicker } from './PresentationModePicker';

interface Props {
  communeId: string;
  category: string;
  access: FormAccess;
  geotagOnSubmit: boolean;
  presentation: PresentationMode;
  openAt: string;
  closeAt: string;
  maxResponses: string;
  locked: boolean;
  onChange: (patch: Partial<{
    communeId: string;
    category: string;
    access: FormAccess;
    geotagOnSubmit: boolean;
    presentation: PresentationMode;
    openAt: string;
    closeAt: string;
    maxResponses: string;
  }>) => void;
}

const selectClass =
  'w-full rounded-theme border border-theme bg-surface px-3 py-2 text-sm text-(--color-text) focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50';
const inputClass =
  'w-full rounded-theme border border-theme bg-surface px-3 py-2 text-sm text-(--color-text) focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50';
const labelClass = 'block text-xs font-medium text-muted mb-1.5';

export function FormSettingsPanel({
  communeId, category, access, geotagOnSubmit, presentation,
  openAt, closeAt, maxResponses, locked, onChange,
}: Props) {
  const { data: communes = [] } = useCommunes();

  return (
    <div className="space-y-6">

      {/* Commune */}
      <div>
        <label className={labelClass}>Commune <span className="text-red-400">*</span></label>
        <select
          className={selectClass}
          value={communeId}
          onChange={(e) => onChange({ communeId: e.target.value })}
          disabled={locked}
        >
          <option value="">— Sélectionner —</option>
          {communes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted">Requis avant la publication.</p>
      </div>

      {/* Catégorie */}
      <div>
        <label className={labelClass}>Catégorie thématique <span className="text-red-400">*</span></label>
        <select
          className={selectClass}
          value={category}
          onChange={(e) => onChange({ category: e.target.value })}
          disabled={locked}
        >
          <option value="">— Sélectionner —</option>
          {FORM_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Accès */}
      <div>
        <label className={labelClass}>Accès au formulaire</label>
        <div className="flex gap-3">
          {(['OBSERVERS', 'PUBLIC'] as FormAccess[]).map((val) => (
            <button
              key={val}
              type="button"
              disabled={locked}
              onClick={() => onChange({ access: val })}
              className={[
                'flex-1 py-2.5 px-4 rounded-theme border text-sm font-medium transition-colors',
                access === val
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-theme text-muted hover:border-primary/40 hover:text-(--color-text)',
                locked && 'opacity-50 cursor-not-allowed',
              ].join(' ')}
            >
              {val === 'OBSERVERS' ? 'Observateurs (authentifié)' : 'Public (lien ouvert)'}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-muted">
          {access === 'PUBLIC'
            ? 'Tout le monde peut répondre via le lien public.'
            : 'Seuls les observateurs connectés peuvent répondre.'}
        </p>
      </div>

      {/* Géolocalisation */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="mt-0.5 accent-primary"
            checked={geotagOnSubmit}
            onChange={(e) => onChange({ geotagOnSubmit: e.target.checked })}
            disabled={locked}
          />
          <span>
            <span className="block text-sm font-medium text-(--color-text) group-hover:text-primary transition-colors">
              Géolocaliser à l'envoi
            </span>
            <span className="block text-xs text-muted mt-0.5">
              La position de l'observateur est capturée automatiquement à la soumission.
            </span>
          </span>
        </label>
      </div>

      {/* Fenêtre de collecte */}
      <div>
        <label className={labelClass}>Fenêtre de collecte</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted mb-1">Ouverture</p>
            <input
              type="datetime-local"
              className={inputClass}
              value={openAt}
              onChange={(e) => onChange({ openAt: e.target.value })}
              disabled={locked}
            />
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Fermeture</p>
            <input
              type="datetime-local"
              className={inputClass}
              value={closeAt}
              onChange={(e) => onChange({ closeAt: e.target.value })}
              disabled={locked}
            />
          </div>
        </div>
        <p className="mt-1 text-xs text-muted">
          Hors de ces dates, le formulaire retourne 410 — laissez vide pour aucune limite.
        </p>
      </div>

      {/* Quota de réponses */}
      <div>
        <label className={labelClass}>Quota de réponses</label>
        <input
          type="number"
          min={1}
          className={inputClass}
          value={maxResponses}
          onChange={(e) => onChange({ maxResponses: e.target.value })}
          placeholder="Illimité"
          disabled={locked}
        />
        <p className="mt-1 text-xs text-muted">
          Une fois ce nombre atteint, le formulaire public retourne 410.
        </p>
      </div>

      {/* Présentation */}
      <div>
        <label className={labelClass}>Mode de présentation</label>
        <PresentationModePicker value={presentation} onChange={(m) => onChange({ presentation: m })} />
      </div>

    </div>
  );
}
