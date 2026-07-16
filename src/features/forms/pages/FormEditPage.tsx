import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft, Eye, EyeOff, ExternalLink, BarChart2,
  Globe, PowerOff, Lock, Copy, Archive, ArchiveX, History, LayoutTemplate, Save,
} from 'lucide-react';
import { formsApi } from '../api/formsApi';
import { useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard';
import { SectionList } from '../components/builder/SectionList';
import { BuilderPreview } from '../components/builder/BuilderPreview';
import { CoverEditor } from '../components/builder/CoverEditor';
import { EndingEditor } from '../components/builder/EndingEditor';
import { FormSettingsPanel } from '../components/builder/FormSettingsPanel';
import { ThemePickerPanel } from '../components/builder/ThemePickerPanel';
import { FormVersionsPanel } from '../components/FormVersionsPanel';
import { SaveAsTemplateDialog } from '../components/SaveAsTemplateDialog';
import { Button } from '@/shared/ui/Button';
import { IconButton } from '@/shared/ui/IconButton';
import { Input } from '@/shared/ui/Input';
import { useToast } from '@/shared/ui/Toast';
import { Dialog } from '@/shared/ui/Dialog';
import type { Question, Section, ContentBlock, Cover, Ending, PresentationMode, FormAccess } from '@/shared/types';

type Panel = 'content' | 'cover' | 'ending' | 'theme' | 'settings' | 'versions';

/** Convertit une string ISO (ou undefined) en valeur pour <input type="datetime-local"> */
function toDatetimeLocal(iso?: string) {
  if (!iso) return '';
  return iso.slice(0, 16); // "YYYY-MM-DDTHH:mm"
}

/** Convertit la valeur d'un datetime-local en ISO UTC, ou undefined si vide */
function fromDatetimeLocal(val: string): string | undefined {
  if (!val) return undefined;
  return new Date(val).toISOString();
}

export default function FormEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: form, isLoading } = useQuery({
    queryKey: ['form', id],
    queryFn: () => formsApi.get(id!),
    enabled: !!id,
  });

  // --- État local du formulaire ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [presentation, setPresentation] = useState<PresentationMode>('onepage');
  const [communeId, setCommuneId] = useState('');
  const [category, setCategory] = useState('');
  const [access, setAccess] = useState<FormAccess>('OBSERVERS');
  const [geotagOnSubmit, setGeotagOnSubmit] = useState(false);
  const [openAt, setOpenAt] = useState('');
  const [closeAt, setCloseAt] = useState('');
  const [maxResponses, setMaxResponses] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [cover, setCover] = useState<Cover>({});
  const [ending, setEnding] = useState<Ending>({});
  const [theme, setTheme] = useState<Record<string, unknown>>({});

  // --- UI state ---
  const [showPreview, setShowPreview] = useState(false);
  const [panel, setPanel] = useState<Panel>('content');
  const [dirty, setDirty] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);

  // Hydratation depuis le serveur
  useEffect(() => {
    if (!form) return;
    setTitle(form.title);
    setDescription(form.description ?? '');
    setPresentation(form.presentation);
    setCommuneId(form.communeId ?? '');
    setCategory(form.category ?? '');
    setAccess(form.access ?? 'OBSERVERS');
    setGeotagOnSubmit(form.geotagOnSubmit ?? false);
    setOpenAt(toDatetimeLocal(form.openAt));
    setCloseAt(toDatetimeLocal(form.closeAt));
    setMaxResponses(form.maxResponses != null ? String(form.maxResponses) : '');
    setSections(form.sections ?? []);
    setQuestions(form.questions ?? []);
    setContentBlocks(form.contentBlocks ?? []);
    setCover(form.cover as Cover ?? {});
    setEnding(form.ending as Ending ?? {});
    setTheme(form.theme ?? {});
    setDirty(false);
  }, [form]);

  const mark = () => setDirty(true);

  const buildPayload = () => ({
    title,
    description,
    presentation,
    communeId: communeId || undefined,
    category: category || undefined,
    access,
    geotagOnSubmit,
    openAt: fromDatetimeLocal(openAt),
    closeAt: fromDatetimeLocal(closeAt),
    maxResponses: maxResponses ? parseInt(maxResponses, 10) : undefined,
    sections,
    questions,
    contentBlocks,
    theme,
    cover: cover as Record<string, unknown>,
    ending: ending as Record<string, unknown>,
  });

  // --- Mutations ---
  const saveMutation = useMutation({
    mutationFn: () => formsApi.update(id!, buildPayload()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['form', id] });
      toast('Sauvegardé', 'success');
      setDirty(false);
    },
    onError: () => toast('Erreur lors de la sauvegarde', 'error'),
  });

  const publishMutation = useMutation({
    mutationFn: () => formsApi.publish(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['form', id] });
      qc.invalidateQueries({ queryKey: ['form-versions', id] });
      toast('Formulaire publié !', 'success');
    },
    onError: (e: Error) => toast(e.message ?? 'Erreur publication', 'error'),
  });

  const deactivateMutation = useMutation({
    mutationFn: () => formsApi.deactivate(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['form', id] });
      setShowDeactivateDialog(false);
      toast('Formulaire désactivé — vous pouvez maintenant le modifier.', 'success');
    },
    onError: (e: Error) => toast(e.message ?? 'Erreur désactivation', 'error'),
  });

  const closeMutation = useMutation({
    mutationFn: () => formsApi.close(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['form', id] });
      setShowCloseDialog(false);
      toast('Formulaire clôturé définitivement.', 'success');
    },
    onError: (e: Error) => toast(e.message ?? 'Erreur clôture', 'error'),
  });

  const duplicateMutation = useMutation({
    mutationFn: () => formsApi.duplicate(id!),
    onSuccess: (copy) => {
      qc.invalidateQueries({ queryKey: ['forms'] });
      toast('Formulaire dupliqué', 'success');
      navigate(`/forms/${copy.id}/edit`);
    },
    onError: () => toast('Erreur lors de la duplication', 'error'),
  });

  const archiveMutation = useMutation({
    mutationFn: () =>
      form?.archived ? formsApi.unarchive(id!) : formsApi.archive(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['form', id] });
      qc.invalidateQueries({ queryKey: ['forms'] });
      toast(form?.archived ? 'Formulaire désarchivé' : 'Formulaire archivé', 'success');
    },
    onError: () => toast("Erreur lors de l'archivage", 'error'),
  });

  const isPublished = form?.status === 'PUBLISHED';
  const isInactive  = form?.status === 'INACTIVE';
  const isClosed    = form?.status === 'CLOSED';
  const isDraft     = form?.status === 'DRAFT';
  const locked      = isPublished || isClosed;

  // Garde-fou : avertit avant de quitter avec des modifications non sauvegardées
  const blocker = useUnsavedChangesGuard(dirty && !locked);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-(--color-primary) border-t-transparent animate-spin" />
      </div>
    );
  }

  const panelTabs: { key: Panel; label: string }[] = [
    { key: 'content',  label: 'Contenu' },
    { key: 'cover',    label: 'Couverture' },
    { key: 'ending',   label: 'Fin' },
    { key: 'theme',    label: 'Thème' },
    { key: 'settings', label: 'Paramètres' },
    { key: 'versions', label: 'Versions' },
  ];

  const statusBadge = isPublished
    ? { label: 'Publié',    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
    : isInactive
    ? { label: 'Inactif',   cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' }
    : isClosed
    ? { label: 'Clôturé',   cls: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' }
    : { label: 'Brouillon', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };

  return (
    <div className="min-h-screen bg-app flex flex-col">

      {/* Dialog — désactivation */}
      <Dialog
        open={showDeactivateDialog}
        onOpenChange={setShowDeactivateDialog}
        title="Désactiver ce formulaire ?"
        description="Le formulaire ne sera plus accessible aux répondants. Vous pourrez le modifier puis le republier."
      >
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" size="sm" onClick={() => setShowDeactivateDialog(false)}>
            Annuler
          </Button>
          <Button
            size="sm"
            className="bg-amber-500 hover:bg-amber-400 text-white"
            onClick={() => deactivateMutation.mutate()}
            loading={deactivateMutation.isPending}
          >
            <PowerOff size={14} className="mr-1.5" />
            Désactiver
          </Button>
        </div>
      </Dialog>

      {/* Dialog — clôture définitive */}
      <Dialog
        open={showCloseDialog}
        onOpenChange={setShowCloseDialog}
        title="Clôturer définitivement ?"
        description="Cette action est irréversible. Le formulaire sera fermé et ne pourra plus être modifié ni republié."
      >
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" size="sm" onClick={() => setShowCloseDialog(false)}>
            Annuler
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => closeMutation.mutate()}
            loading={closeMutation.isPending}
          >
            <Lock size={14} className="mr-1.5" />
            Clôturer définitivement
          </Button>
        </div>
      </Dialog>

      {/* Dialog — garde-fou modifications non sauvegardées */}
      <Dialog
        open={blocker.state === 'blocked'}
        onOpenChange={(v) => { if (!v) blocker.reset?.(); }}
        title="Quitter sans enregistrer ?"
        description="Vous avez des modifications non sauvegardées. Si vous quittez maintenant, elles seront perdues."
      >
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" size="sm" onClick={() => blocker.reset?.()}>
            Continuer l'édition
          </Button>
          <Button
            size="sm"
            loading={saveMutation.isPending}
            onClick={async () => {
              await saveMutation.mutateAsync();
              blocker.proceed?.();
            }}
          >
            <Save size={14} className="mr-1.5" />
            Enregistrer et quitter
          </Button>
          <Button variant="danger" size="sm" onClick={() => blocker.proceed?.()}>
            Quitter sans enregistrer
          </Button>
        </div>
      </Dialog>

      {/* Dialog — enregistrer comme template (UC-T4) */}
      {id && (
        <SaveAsTemplateDialog
          open={showSaveTemplateDialog}
          onOpenChange={setShowSaveTemplateDialog}
          formId={id}
          defaultName={title}
          defaultDescription={description}
          defaultCategory={category}
        />
      )}

      {/* Toolbar */}
      <header className="sticky top-0 z-30 border-b border-theme bg-surface/95 backdrop-blur-sm">
        <div className="px-4 h-14 flex items-center gap-3">
          <IconButton label="Retour aux formulaires" onClick={() => navigate('/forms')} tooltip={false}>
            <ChevronLeft size={18} />
          </IconButton>

          <div className="w-px h-5 bg-theme shrink-0" />

          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); mark(); }}
            disabled={locked}
            className="flex-1 min-w-0 bg-transparent text-(--color-text) font-display font-semibold text-sm focus:outline-none placeholder:text-muted truncate disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Titre du formulaire…"
          />

          {/* Indicateur de modifications non sauvegardées */}
          {dirty && !locked && (
            <span className="flex items-center gap-1.5 text-xs text-accent shrink-0">
              <span className="size-1.5 rounded-full bg-accent" />
              Non sauvegardé
            </span>
          )}

          {form && (
            <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${statusBadge.cls}`}>
              {statusBadge.label}
            </span>
          )}

          {form?.archived && (
            <span className="text-xs px-2 py-0.5 rounded-full border bg-zinc-500/10 text-zinc-400 border-zinc-500/20 shrink-0">
              Archivé
            </span>
          )}

          <div className="flex items-center gap-1 shrink-0">
            {/* Enregistrer — sauvegarde manuelle */}
            {!locked && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => saveMutation.mutate()}
                loading={saveMutation.isPending}
                disabled={!dirty}
                className="mr-1"
              >
                <Save size={14} className="mr-1.5" />
                Enregistrer
              </Button>
            )}

            <IconButton
              label={showPreview ? "Masquer l'aperçu" : "Afficher l'aperçu"}
              onClick={() => setShowPreview((p) => !p)}
              className={showPreview ? 'text-primary bg-primary/10' : ''}
            >
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            </IconButton>

            <Link to={`/forms/${id}/statistics`}>
              <IconButton label="Statistiques"><BarChart2 size={16} /></IconButton>
            </Link>

            {isPublished && form?.slug && (
              <a href={`/f/${form.slug}`} target="_blank" rel="noreferrer">
                <IconButton label="Voir le formulaire publié" className="text-emerald-400 hover:text-emerald-300">
                  <ExternalLink size={16} />
                </IconButton>
              </a>
            )}

            {/* Dupliquer — toujours disponible */}
            <IconButton
              label="Dupliquer"
              onClick={() => duplicateMutation.mutate()}
              className="text-blue-400/70 hover:text-blue-400"
            >
              <Copy size={16} />
            </IconButton>

            {/* Enregistrer comme template */}
            <IconButton
              label="Enregistrer comme template"
              onClick={() => setShowSaveTemplateDialog(true)}
              className="text-violet-400/70 hover:text-violet-400"
            >
              <LayoutTemplate size={16} />
            </IconButton>

            {/* Archiver / Désarchiver */}
            <IconButton
              label={form?.archived ? 'Désarchiver' : 'Archiver'}
              onClick={() => archiveMutation.mutate()}
              className="text-zinc-400/70 hover:text-zinc-400"
            >
              {form?.archived ? <ArchiveX size={16} /> : <Archive size={16} />}
            </IconButton>

            {/* Clôturer — INACTIVE ou DRAFT */}
            {(isInactive || isDraft) && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => setShowCloseDialog(true)}
              >
                <Lock size={14} className="mr-1.5" />
                Clôturer
              </Button>
            )}

            {/* Désactiver — PUBLISHED uniquement */}
            {isPublished && (
              <Button
                size="sm"
                className="bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border border-amber-500/30"
                onClick={() => setShowDeactivateDialog(true)}
              >
                <PowerOff size={14} className="mr-1.5" />
                Désactiver
              </Button>
            )}

            {/* Publier — DRAFT ou INACTIVE */}
            {(isDraft || isInactive) && (
              <Button
                size="sm"
                onClick={() => publishMutation.mutate()}
                loading={publishMutation.isPending}
              >
                <Globe size={14} className="mr-1.5" />
                Publier
              </Button>
            )}
          </div>
        </div>

        {/* Tabs de panneau */}
        <div className="px-4 flex gap-0.5 pb-1">
          {panelTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setPanel(t.key)}
              className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-md transition-colors ${
                panel === t.key
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted hover:text-(--color-text) hover:bg-theme'
              }`}
            >
              {t.key === 'versions' && <History size={11} />}
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Body */}
      <div className={`flex-1 flex min-h-0 ${showPreview ? 'divide-x divide-(--color-border)' : ''}`}>
        <div className="flex-1 overflow-y-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">

            {isPublished && (
              <div className="mb-6 flex items-center justify-between gap-4 px-4 py-3 rounded-theme bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                <span>Ce formulaire est publié et verrouillé. Désactivez-le pour le modifier.</span>
                <button
                  onClick={() => setShowDeactivateDialog(true)}
                  className="shrink-0 text-xs font-semibold underline underline-offset-2 hover:text-emerald-300 transition-colors"
                >
                  Désactiver
                </button>
              </div>
            )}

            {isClosed && (
              <div className="mb-6 px-4 py-3 rounded-theme bg-zinc-500/10 border border-zinc-500/20 text-zinc-400 text-sm">
                Ce formulaire est clôturé définitivement et ne peut plus être modifié.
              </div>
            )}

            {isInactive && (
              <div className="mb-6 px-4 py-3 rounded-theme bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                Formulaire inactif — modifiez-le librement, puis republiez-le.
              </div>
            )}

            {panel === 'content' && (
              <>
                <div className="mb-6">
                  <Input
                    label="Description"
                    value={description}
                    onChange={(e) => { setDescription(e.target.value); mark(); }}
                    placeholder="Décrivez l'objectif de ce formulaire…"
                    disabled={locked}
                  />
                </div>
                <SectionList
                  sections={sections}
                  questions={questions}
                  contentBlocks={contentBlocks}
                  onSectionsChange={(s) => { setSections(s); mark(); }}
                  onQuestionsChange={(q) => { setQuestions(q); mark(); }}
                  onBlocksChange={(b) => { setContentBlocks(b); mark(); }}
                />
              </>
            )}

            {panel === 'cover' && (
              <CoverEditor cover={cover} onChange={(c) => { setCover(c); mark(); }} />
            )}

            {panel === 'ending' && (
              <EndingEditor ending={ending} onChange={(e) => { setEnding(e); mark(); }} />
            )}

            {panel === 'theme' && (
              <ThemePickerPanel
                currentThemeName={(theme as { name?: string }).name}
                onChange={(t) => { setTheme(t ?? {}); mark(); }}
                locked={locked}
              />
            )}

            {panel === 'settings' && (
              <FormSettingsPanel
                communeId={communeId}
                category={category}
                access={access}
                geotagOnSubmit={geotagOnSubmit}
                presentation={presentation}
                openAt={openAt}
                closeAt={closeAt}
                maxResponses={maxResponses}
                locked={locked}
                onChange={(patch) => {
                  if (patch.communeId !== undefined) setCommuneId(patch.communeId);
                  if (patch.category !== undefined) setCategory(patch.category);
                  if (patch.access !== undefined) setAccess(patch.access);
                  if (patch.geotagOnSubmit !== undefined) setGeotagOnSubmit(patch.geotagOnSubmit);
                  if (patch.presentation !== undefined) setPresentation(patch.presentation);
                  if (patch.openAt !== undefined) setOpenAt(patch.openAt);
                  if (patch.closeAt !== undefined) setCloseAt(patch.closeAt);
                  if (patch.maxResponses !== undefined) setMaxResponses(patch.maxResponses);
                  mark();
                }}
              />
            )}

            {panel === 'versions' && id && (
              <FormVersionsPanel formId={id} />
            )}

          </div>
        </div>

        {showPreview && (
          <div className="w-105 shrink-0 hidden lg:flex flex-col">
            <BuilderPreview
              title={title}
              description={description}
              presentation={presentation}
              cover={cover}
              ending={ending}
              sections={sections}
              questions={questions}
              contentBlocks={contentBlocks}
              theme={Object.keys(theme).length > 0 ? theme : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}
