import { useState, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Send } from 'lucide-react';
import type { PublicForm, Question, Cover, Ending } from '@/shared/types';
import { buildZodSchema } from './buildZodSchema';
import { CoverScreen } from './CoverScreen';
import { EndingScreen } from './EndingScreen';
import { ProgressBar } from './ProgressBar';
import { SectionRenderer } from './SectionRenderer';

interface Props {
  form: PublicForm;
  onSubmit?: (answers: Record<string, unknown>) => Promise<void>;
  previewMode?: boolean;
  geoLoading?: boolean;
}

type Stage = 'cover' | 'sections' | 'done';
type Condition = { questionId: string; operator: 'eq' | 'neq' | 'contains'; value: string };

function evaluateConditions(conditions: Condition[], values: Record<string, unknown>): boolean {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every((cond) => {
    const val = String(values[cond.questionId] ?? '');
    switch (cond.operator) {
      case 'eq': return val === cond.value;
      case 'neq': return val !== cond.value;
      case 'contains': return val.includes(cond.value);
      default: return true;
    }
  });
}

function NavButton({
  type = 'button',
  onClick,
  loading,
  variant = 'primary',
  children,
}: {
  type?: 'button' | 'submit';
  onClick?: () => void;
  loading?: boolean;
  variant?: 'primary' | 'ghost';
  children: React.ReactNode;
}) {
  if (variant === 'ghost') {
    return (
      <button
        type={type}
        onClick={onClick}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-display font-semibold transition-all duration-150 hover:opacity-80 active:scale-[0.97]"
        style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface-raised)' }}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-display font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:shadow-lg active:scale-[0.97] disabled:opacity-50"
      style={{ background: 'var(--color-primary)', boxShadow: '0 4px 14px color-mix(in srgb, var(--color-primary) 35%, transparent)' }}
    >
      {loading
        ? <span className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
        : children}
    </button>
  );
}

export function FormExperience({ form, onSubmit, previewMode = false, geoLoading = false }: Props) {
  const cover = form.cover as Cover;
  const ending = form.ending as Ending;
  const hasCover = !!cover?.title;

  const [stage, setStage] = useState<Stage>(hasCover ? 'cover' : 'sections');
  const [sectionIndex, setSectionIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const allQuestions = useMemo<Question[]>(
    () =>
      (form.sections ?? [])
        .flatMap((s) => s.items.filter((i) => i.kind === 'QUESTION'))
        .map((i) => ({
          id: i.id,
          label: i.label ?? '',
          type: i.type as Question['type'],
          required: i.required ?? false,
          position: i.position,
          options: i.options,
          min: i.min,
          max: i.max,
          step: i.step,
          format: i.format,
          conditions: i.conditions,
        })),
    [form.sections],
  );

  const schema = useMemo(() => buildZodSchema(allQuestions), [allQuestions]);
  const { register, handleSubmit, formState: { errors }, trigger, control } = useForm({
    resolver: zodResolver(schema),
  });
  const watchedValues = useWatch({ control }) as Record<string, unknown>;

  const visibleQuestionIds = useMemo(() => {
    return new Set(
      allQuestions
        .filter((q) => evaluateConditions((q.conditions ?? []) as Condition[], watchedValues))
        .map((q) => q.id),
    );
  }, [allQuestions, watchedValues]);

  const sections = form.sections ?? [];
  const currentSection = sections[sectionIndex];
  const isLastSection = sectionIndex === sections.length - 1;

  const handleNext = async () => {
    const ids = (currentSection?.items ?? [])
      .filter((i) => i.kind === 'QUESTION' && visibleQuestionIds.has(i.id))
      .map((i) => i.id);
    if (await trigger(ids as never)) setSectionIndex((i) => i + 1);
  };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    const filtered = Object.fromEntries(
      Object.entries(data).filter(([key]) => visibleQuestionIds.has(key)),
    );
    if (previewMode) { setStage('done'); return; }
    if (!onSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit(filtered);
      setStage('done');
    } finally {
      setSubmitting(false);
    }
  };

  const sectionProps = {
    register: register as never,
    errors: errors as never,
    control: control as never,
    visibleQuestionIds,
  };

  /* ── Cover ─────────────────────────────────────────────────────── */
  if (stage === 'cover') {
    return <CoverScreen cover={cover} onStart={() => setStage('sections')} />;
  }

  /* ── Ending ─────────────────────────────────────────────────────── */
  if (stage === 'done') {
    return <EndingScreen ending={ending} />;
  }

  /* ── Onepage ─────────────────────────────────────────────────────── */
  if (form.presentation === 'onepage') {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
        {/* En-tête */}
        <header
          className="sticky top-0 z-40 border-b"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
            <span className="font-display font-semibold text-base truncate" style={{ color: 'var(--color-text)' }}>
              {form.title}
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              {allQuestions.length} question{allQuestions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-6 py-12">
          {form.description && (
            <p className="mb-10 text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {form.description}
            </p>
          )}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-12">
            {sections.map((section) => (
              <SectionRenderer key={section.id} section={section} {...sectionProps} />
            ))}
            <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <NavButton type="submit" loading={submitting || geoLoading}>
                <Send size={15} />
                Envoyer mes réponses
              </NavButton>
            </div>
          </form>
        </div>

        <Branding />
      </div>
    );
  }

  /* ── Paginated ─────────────────────────────────────────────────────── */
  if (form.presentation === 'paginated') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
        <ProgressBar current={sectionIndex} total={sections.length} />

        {/* Top nav */}
        <div className="pt-6 pb-0 px-6 flex items-center justify-between max-w-2xl mx-auto w-full">
          <span className="text-xs font-semibold font-mono" style={{ color: 'var(--color-primary)' }}>
            {sectionIndex + 1} / {sections.length}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {form.title}
          </span>
        </div>

        {/* Section */}
        <div className="flex-1 flex items-start justify-center px-6 pb-24 pt-8">
          <div key={sectionIndex} className="w-full max-w-2xl animate-fade-in">
            {currentSection && (
              <form
                onSubmit={isLastSection
                  ? handleSubmit(handleFormSubmit)
                  : (e) => { e.preventDefault(); handleNext(); }}
                className="flex flex-col gap-10"
              >
                <SectionRenderer section={currentSection} {...sectionProps} />

                <div className="flex items-center gap-3 pt-2">
                  {sectionIndex > 0 && (
                    <NavButton variant="ghost" onClick={() => setSectionIndex((i) => i - 1)}>
                      <ChevronLeft size={15} />
                      Précédent
                    </NavButton>
                  )}
                  <NavButton type="submit" loading={submitting || geoLoading}>
                    {isLastSection ? (
                      <><Send size={15} /> Envoyer</>
                    ) : (
                      <>Suivant <span className="opacity-60 text-xs ml-1">↵</span></>
                    )}
                  </NavButton>
                </div>
              </form>
            )}
          </div>
        </div>

        <Branding />
      </div>
    );
  }

  /* ── Single-question ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <ProgressBar current={sectionIndex} total={sections.length} />

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div key={sectionIndex} className="w-full max-w-xl animate-fade-in">
          {currentSection && (
            <form
              onSubmit={isLastSection
                ? handleSubmit(handleFormSubmit)
                : (e) => { e.preventDefault(); handleNext(); }}
              className="flex flex-col gap-10"
            >
              <SectionRenderer section={currentSection} {...sectionProps} />

              <div className="flex items-center gap-3">
                {sectionIndex > 0 && (
                  <NavButton variant="ghost" onClick={() => setSectionIndex((i) => i - 1)}>
                    <ChevronLeft size={15} />
                    Retour
                  </NavButton>
                )}
                <NavButton type="submit" loading={submitting || geoLoading}>
                  {isLastSection ? (
                    <><Send size={15} /> Envoyer</>
                  ) : (
                    <>Continuer <span className="opacity-60 text-xs ml-1">↵</span></>
                  )}
                </NavButton>
              </div>
            </form>
          )}
        </div>
      </div>

      <Branding />
    </div>
  );
}

function Branding() {
  return (
    <div className="flex justify-center pb-6 pt-2">
      <span className="text-xs tracking-wide" style={{ color: 'var(--color-text-muted)', opacity: 0.45 }}>
        Propulsé par Gen·Form
      </span>
    </div>
  );
}
