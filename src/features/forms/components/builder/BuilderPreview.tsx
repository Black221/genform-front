import { useRef } from 'react';
import { MapPin, Camera, CheckCircle2, ChevronRight } from 'lucide-react';
import type { Question, Section, ContentBlock, Cover, CoverBackground, Ending, PresentationMode, QuestionType } from '@/shared/types';
import BlockRenderer from '@/features/form-renderer/BlockRenderer';
import { cn } from '@/shared/lib/cn';

interface Props {
  title: string;
  description?: string;
  presentation: PresentationMode;
  cover: Cover;
  ending: Ending;
  sections: Section[];
  questions: Question[];
  contentBlocks: ContentBlock[];
  theme?: Record<string, unknown>;
}

/* ── Rendus statiques par type de champ ───────────────────────────── */

function MockInput({ placeholder }: { placeholder: string }) {
  return (
    <div className="h-9 rounded-theme border border-theme bg-(--color-bg)/60 px-3 flex items-center pointer-events-none">
      <span className="text-sm text-muted/50 select-none">{placeholder}</span>
    </div>
  );
}

function MockTextarea({ placeholder }: { placeholder: string }) {
  return (
    <div className="min-h-17 rounded-theme border border-theme bg-(--color-bg)/60 px-3 py-2.5 pointer-events-none">
      <span className="text-sm text-muted/50 select-none">{placeholder}</span>
    </div>
  );
}

function QuestionPreview({ question }: { question: Question }) {
  const { label, type, required, options, min = 1, max = 5 } = question;
  const scaleValues = Array.from({ length: Math.min(max - min + 1, 10) }, (_, i) => min + i);

  return (
    <div className="space-y-2.5 p-3 rounded-theme bg-surface border border-theme/60 hover:border-theme transition-colors">
      {/* Badge type */}
      <div className="flex items-center gap-1.5">
        <QuestionTypeBadge type={type} />
        {required && (
          <span className="text-xs text-red-400 font-medium">obligatoire</span>
        )}
      </div>

      {/* Label */}
      <p className="text-sm font-medium text-(--color-text) leading-snug">
        {label || <span className="italic text-muted">Sans titre</span>}
      </p>

      {/* Champ */}
      {type === 'TEXT' && <MockInput placeholder="Réponse courte…" />}

      {type === 'LONG_TEXT' && <MockTextarea placeholder="Réponse longue…" />}

      {(type === 'SINGLE_CHOICE' || type === 'MULTI_CHOICE') && (
        <div className="space-y-1.5">
          {(options && options.length > 0 ? options : ['Option A', 'Option B', 'Option C']).map((opt, i) => (
            <div key={i} className="flex items-center gap-2.5 pointer-events-none">
              <div
                className={cn(
                  'size-4 border-2 border-theme shrink-0 bg-transparent',
                  type === 'SINGLE_CHOICE' ? 'rounded-full' : 'rounded-sm',
                )}
              />
              <span className="text-sm text-(--color-text)">
                {opt || <span className="text-muted italic">Option {i + 1}</span>}
              </span>
            </div>
          ))}
        </div>
      )}

      {type === 'SCALE' && (
        <div className="flex gap-1 flex-wrap">
          {scaleValues.map((n) => (
            <div
              key={n}
              className="size-8 rounded-theme border border-theme flex items-center justify-center text-xs text-muted pointer-events-none"
            >
              {n}
            </div>
          ))}
        </div>
      )}

      {type === 'NUMBER' && <MockInput placeholder="0" />}

      {type === 'DATE' && <MockInput placeholder="jj / mm / aaaa" />}

      {type === 'LOCATION' && (
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-theme border border-dashed border-primary/30 bg-primary/5 pointer-events-none">
          <MapPin size={14} className="text-primary shrink-0" />
          <span className="text-sm text-primary/80">Position GPS ou saisie manuelle</span>
        </div>
      )}

      {type === 'PHOTO' && (
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-theme border border-dashed border-primary/30 bg-primary/5 pointer-events-none">
          <Camera size={14} className="text-primary shrink-0" />
          <span className="text-sm text-primary/80">Ajouter une photo (max 5)</span>
        </div>
      )}
    </div>
  );
}

const TYPE_LABEL: Partial<Record<QuestionType, string>> = {
  TEXT: 'Texte',
  LONG_TEXT: 'Texte long',
  SINGLE_CHOICE: 'Choix unique',
  MULTI_CHOICE: 'Choix multiple',
  SCALE: 'Échelle',
  NUMBER: 'Nombre',
  DATE: 'Date',
  LOCATION: 'Localisation',
  PHOTO: 'Photo',
};

function QuestionTypeBadge({ type }: { type: QuestionType }) {
  return (
    <span className="text-xs px-1.5 py-0.5 rounded-pill bg-primary/10 text-primary font-medium">
      {TYPE_LABEL[type] ?? type}
    </span>
  );
}

/* ── Séparateur de section ────────────────────────────────────────── */
function SectionDivider({ index, title }: { index: number; title?: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="size-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-primary">{index + 1}</span>
      </div>
      <span className="text-sm font-semibold text-(--color-text)">
        {title || `Section ${index + 1}`}
      </span>
      <div className="flex-1 h-px bg-theme" />
    </div>
  );
}

/* ── Rendu fond cover ─────────────────────────────────────────────── */
function resolveCoverBg(cover: Cover): string {
  const bg: CoverBackground | undefined = cover.background;
  if (bg) {
    if (bg.type === 'solid' && bg.value) return bg.value;
    if (bg.type === 'gradient')
      return `linear-gradient(${bg.angle ?? 135}deg, ${bg.from ?? '#0B6E63'}, ${bg.to ?? '#159AAE'})`;
    if (bg.type === 'image' && bg.value) return `url(${bg.value}) center/cover no-repeat`;
  }
  if (cover.imageUrl) return `url(${cover.imageUrl}) center/cover no-repeat`;
  return '';
}

/* ── Composant principal ──────────────────────────────────────────── */
export function BuilderPreview({
  title,
  description,
  presentation,
  cover,
  ending,
  sections,
  questions,
  contentBlocks,
}: Props) {
  const coverRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const endingRef = useRef<HTMLDivElement>(null);

  const hasCover = !!(cover.title);
  const hasEnding = !!(ending.message || ending.redirectUrl);
  const totalQ = questions.length;

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Sections effectives : si aucune section créée, une section implicite
  const effectiveSections: Section[] =
    sections.length > 0
      ? [...sections].sort((a, b) => a.position - b.position)
      : [{ id: '__default__', position: 0 }];

  const multiSection = sections.length > 1;

  const presentationLabel: Record<PresentationMode, string> = {
    onepage: 'Une page',
    paginated: 'Pages',
    'single-question': 'Q par Q',
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-app">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-theme bg-surface/95 backdrop-blur-sm">
        <div className="px-3 pt-2.5 pb-1.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Aperçu</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted/70 bg-theme px-2 py-0.5 rounded-pill">
              {presentationLabel[presentation]}
            </span>
            <span className="text-xs text-muted">
              {totalQ} question{totalQ !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        {/* Navigation pills */}
        <div className="px-3 pb-2 flex gap-1 overflow-x-auto">
          {hasCover && (
            <button
              onClick={() => scrollTo(coverRef)}
              className="text-xs px-2.5 py-1 rounded-full bg-theme text-muted hover:text-(--color-text) transition-colors shrink-0"
            >
              Couverture
            </button>
          )}
          <button
            onClick={() => scrollTo(contentRef)}
            className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium transition-colors shrink-0"
          >
            Contenu ({totalQ})
          </button>
          {hasEnding && (
            <button
              onClick={() => scrollTo(endingRef)}
              className="text-xs px-2.5 py-1 rounded-full bg-theme text-muted hover:text-(--color-text) transition-colors shrink-0"
            >
              Fin
            </button>
          )}
        </div>
      </div>

      {/* ── Corps défilable ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Couverture ─────────────────────────────────────────────── */}
        {hasCover && (
          <div ref={coverRef} className="relative overflow-hidden border-b border-theme">
            {(() => {
              const bgCss = resolveCoverBg(cover);
              const hasBg = !!bgCss;
              const isImageBg =
                cover.background?.type === 'image' || (!cover.background && !!cover.imageUrl);

              return (
                <>
                  {hasBg && (
                    <div
                      className="absolute inset-0"
                      style={{ background: bgCss }}
                    />
                  )}
                  {isImageBg && (
                    <div className="absolute inset-0 bg-(--color-bg)/50" />
                  )}
                  {!hasBg && (
                    <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-primary/5 to-transparent" />
                  )}

                  <div className="relative z-10 flex flex-col items-center text-center gap-3 px-5 py-10">
                    <h2
                      className="font-display text-xl font-bold leading-tight"
                      style={{ color: hasBg && !isImageBg ? '#fff' : 'var(--color-text)' }}
                    >
                      {cover.title}
                    </h2>
                    {cover.subtitle && (
                      <p
                        className="text-sm max-w-xs leading-relaxed"
                        style={{ color: hasBg && !isImageBg ? 'rgba(255,255,255,0.8)' : 'var(--color-text-muted)' }}
                      >
                        {cover.subtitle}
                      </p>
                    )}
                    <button className="mt-1 px-4 py-2 rounded-theme bg-primary text-white text-sm font-medium pointer-events-none opacity-80">
                      {cover.ctaLabel || 'Commencer'}
                    </button>
                  </div>
                  <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-white/70 font-mono tracking-wide">
                    COUVERTURE
                  </span>
                </>
              );
            })()}
          </div>
        )}

        {/* ── Contenu ────────────────────────────────────────────────── */}
        <div ref={contentRef} className="px-4 py-6 space-y-6">
          {/* Titre du formulaire */}
          <div>
            <h1 className="font-display text-lg font-bold text-(--color-text) leading-snug">
              {title || <span className="italic text-muted">Sans titre</span>}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-muted leading-relaxed">{description}</p>
            )}
          </div>

          {/* Sections */}
          {effectiveSections.map((section, sIdx) => {
            const sQuestions = questions
              .filter((q) => (sections.length > 0 ? q.sectionId === section.id : true))
              .sort((a, b) => a.position - b.position);

            const sBlocks = contentBlocks
              .filter((b) => (sections.length > 0 ? b.sectionId === section.id : true))
              .sort((a, b) => a.position - b.position);

            // Fusion triée par position
            type AnyItem =
              | { kind: 'q'; item: Question; position: number }
              | { kind: 'b'; item: ContentBlock; position: number };

            const merged: AnyItem[] = [
              ...sQuestions.map((q) => ({ kind: 'q' as const, item: q, position: q.position })),
              ...sBlocks.map((b) => ({ kind: 'b' as const, item: b, position: b.position })),
            ].sort((a, b) => a.position - b.position);

            if (merged.length === 0 && !section.title) return null;

            return (
              <div key={section.id} className="space-y-3">
                {/* En-tête de section (multiSection uniquement) */}
                {multiSection && (
                  <SectionDivider index={sIdx} title={section.title} />
                )}

                {/* Items */}
                {merged.map(({ kind, item }) =>
                  kind === 'b' ? (
                    <div key={item.id} className="px-1">
                      <BlockRenderer
                        type={(item as ContentBlock).type}
                        content={(item as ContentBlock).content}
                      />
                    </div>
                  ) : (
                    <QuestionPreview key={item.id} question={item as Question} />
                  ),
                )}

                {merged.length === 0 && (
                  <p className="text-xs text-muted italic px-3 py-4 border border-dashed border-theme rounded-theme text-center">
                    Section vide — ajoutez des questions ou des blocs
                  </p>
                )}
              </div>
            );
          })}

          {/* État vide global */}
          {totalQ === 0 && contentBlocks.length === 0 && (
            <div className="text-center py-10 text-muted space-y-1">
              <p className="text-sm">Aucun contenu à prévisualiser.</p>
              <p className="text-xs opacity-60">
                Ajoutez des questions ou des blocs dans le panneau de gauche.
              </p>
            </div>
          )}

          {/* Bouton Envoyer (maquette) */}
          {(totalQ > 0 || contentBlocks.length > 0) && (
            <div className="pt-2">
              <button className="px-5 py-2.5 rounded-theme bg-primary text-white text-sm font-medium pointer-events-none opacity-60 flex items-center gap-2">
                Envoyer
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* ── Écran de fin ────────────────────────────────────────────── */}
        {hasEnding && (
          <div
            ref={endingRef}
            className="relative border-t border-theme px-4 py-8 flex flex-col items-center text-center gap-3"
          >
            <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-theme text-muted font-mono tracking-wide">
              FIN
            </span>

            <div className="size-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 size={22} className="text-emerald-400" />
            </div>
            <p className="font-display font-semibold text-(--color-text)">Réponse envoyée !</p>
            <p className="text-sm text-muted max-w-xs leading-relaxed">
              {ending.message || 'Merci pour votre participation. Vos réponses ont bien été enregistrées.'}
            </p>
            {ending.redirectUrl && (
              <p className="text-xs text-muted/70 mt-1">
                → Redirection : <span className="font-mono">{ending.redirectUrl}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
