import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Image, List, Check, Eye, EyeOff, Globe, Lock, Flag } from 'lucide-react';
import { templatesApi } from '../api/templatesApi';
import type { CreateTemplatePayload } from '../api/templatesApi';
import { CoverEditor } from '../components/CoverEditor';
import { CoverPreview } from '../components/CoverPreview';
import { useToast } from '@/shared/ui/Toast';
import { FORM_CATEGORIES } from '@/shared/lib/formCategories';
import { generateId } from '@/shared/lib/generateId';
import { SectionList } from '@/features/forms/components/builder/SectionList';
import { BuilderPreview } from '@/features/forms/components/builder/BuilderPreview';
import { EndingEditor } from '@/features/forms/components/builder/EndingEditor';
import { PresentationModePicker } from '@/features/forms/components/builder/PresentationModePicker';
import type { Question, TemplateCover, Ending, Section, ContentBlock, PresentationMode } from '@/shared/types';

type Tab = 'cover' | 'structure' | 'ending';

const EMPTY_COVER: TemplateCover = { title: '', subtitle: '', ctaLabel: '', background: { type: 'none' } };
const EMPTY_ENDING: Ending = { message: '', redirectUrl: '' };

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'cover',     label: 'Couverture', Icon: Image },
  { id: 'structure', label: 'Structure',  Icon: List },
  { id: 'ending',    label: 'Fin',        Icon: Flag },
];

export default function TemplateEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();
  const isNew = !id;

  const { data: template, isLoading } = useQuery({
    queryKey: ['template', id],
    queryFn: () => templatesApi.get(id!),
    enabled: !!id,
  });

  const [name, setName]                 = useState('Nouveau template');
  const [description, setDesc]          = useState('');
  const [category, setCategory]         = useState('');
  const [presentation, setPresentation] = useState<PresentationMode>('paginated');
  const [isPublic, setIsPublic]         = useState(false);
  const [cover, setCover]               = useState<TemplateCover>(EMPTY_COVER);
  const [ending, setEnding]             = useState<Ending>(EMPTY_ENDING);
  const [questions, setQuestions]       = useState<Question[]>([]);
  const [sections, setSections]         = useState<Section[]>([]);
  const [contentBlocks, setBlocks]      = useState<ContentBlock[]>([]);
  const [isSystem, setIsSystem]         = useState(false);
  const [tab, setTab]                   = useState<Tab>('cover');
  const [showPreview, setPreview]       = useState(true);

  useEffect(() => {
    if (!template) return;
    setName(template.name);
    setDesc(template.description ?? '');
    setCategory(template.category ?? '');
    setPresentation(template.presentation ?? 'paginated');
    setIsPublic(template.isPublic);
    setIsSystem(template.isSystem);
    setCover(template.cover ?? EMPTY_COVER);
    setEnding(template.ending ?? EMPTY_ENDING);

    // Migration d'affichage : un template doit avoir ses questions en sections
    // (même invariant que le backend). Les anciens templates sans sections sont
    // regroupés dans une section par défaut, persistée à la prochaine sauvegarde.
    let nextSections = template.sections ?? [];
    let nextQuestions = template.questions ?? [];
    let nextBlocks = template.contentBlocks ?? [];
    const sectionIds = new Set(nextSections.map((s) => s.id));
    const orphan = (sid?: string) => !sid || !sectionIds.has(sid);
    if (nextQuestions.some((q) => orphan(q.sectionId)) || nextBlocks.some((b) => orphan(b.sectionId))) {
      const fallback: Section = { id: generateId(), title: 'Questions', position: nextSections.length };
      nextSections = [...nextSections, fallback];
      nextQuestions = nextQuestions.map((q) => (orphan(q.sectionId) ? { ...q, sectionId: fallback.id } : q));
      nextBlocks = nextBlocks.map((b) => (orphan(b.sectionId) ? { ...b, sectionId: fallback.id } : b));
    }
    setSections(nextSections);
    setQuestions(nextQuestions);
    setBlocks(nextBlocks);
  }, [template]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: CreateTemplatePayload = {
        name,
        description,
        category: category || undefined,
        presentation,
        sections,
        questions,
        contentBlocks,
        cover,
        ending,
        isPublic,
      };
      return isNew ? templatesApi.create(payload) : templatesApi.update(id!, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] });
      if (id) qc.invalidateQueries({ queryKey: ['template', id] });
      toast(isNew ? 'Template créé avec succès' : 'Modifications enregistrées', 'success');
      navigate('/templates');
    },
    onError: () => toast('Erreur lors de la sauvegarde', 'error'),
  });

  if (!isNew && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F3F6F4' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#0B6E63] border-t-transparent animate-spin" />
          <span className="text-sm" style={{ color: '#576A65' }}>Chargement…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F3F6F4', fontFamily: "'Hanken Grotesk', sans-serif" }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40" style={{ background: 'white', borderBottom: '1px solid #D8E0DD', boxShadow: '0 1px 2px rgba(21,33,30,.05)' }}>

        {/* Top row */}
        <div className="px-5 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate('/templates')}
            className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-80"
            style={{ color: '#576A65' }}
          >
            <ArrowLeft size={15} />
            <span>Templates</span>
          </button>

          <div className="w-px h-4" style={{ background: '#D8E0DD' }} />

          <input
            value={name}
            readOnly={isSystem}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-transparent text-sm font-semibold focus:outline-none"
            style={{ color: '#15211E', fontFamily: "'Bricolage Grotesque', sans-serif" }}
            placeholder="Nom du template"
          />

          {isSystem ? (
            <span
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: '#ECF1EF', color: '#576A65', border: '1px solid #D8E0DD' }}
            >
              Lecture seule
            </span>
          ) : (
            <>
              <button
                onClick={() => setIsPublic((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: isPublic ? '#DCEFEC' : '#ECF1EF',
                  color:      isPublic ? '#0B6E63' : '#576A65',
                  border:     `1px solid ${isPublic ? '#0B6E63' : '#D8E0DD'}`,
                }}
              >
                {isPublic ? <Globe size={12} /> : <Lock size={12} />}
                {isPublic ? 'Public' : 'Privé'}
              </button>

              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60"
                style={{ background: '#0B6E63' }}
              >
                {saveMutation.isPending ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                {isNew ? 'Créer' : 'Enregistrer'}
              </button>
            </>
          )}

          <button
            onClick={() => setPreview((v) => !v)}
            className="p-2 rounded-lg transition-colors"
            style={{ background: '#ECF1EF', color: showPreview ? '#0B6E63' : '#576A65' }}
            title={showPreview ? "Masquer l'aperçu" : "Afficher l'aperçu"}
          >
            {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {/* Tab row */}
        <div className="px-5 flex gap-0">
          {TABS.map(({ id: tabId, label, Icon }) => (
            <button
              key={tabId}
              onClick={() => setTab(tabId)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-all"
              style={{
                borderColor: tab === tabId ? '#0B6E63' : 'transparent',
                color:       tab === tabId ? '#0B6E63' : '#576A65',
              }}
            >
              <Icon size={13} />
              {label}
              {tabId === 'structure' && questions.length > 0 && (
                <span
                  className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ background: '#DCEFEC', color: '#0B6E63' }}
                >
                  {questions.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left config panel */}
        <aside
          className="overflow-y-auto"
          style={{
            width: showPreview ? 480 : '100%',
            background: 'white',
            borderRight: showPreview ? '1px solid #D8E0DD' : 'none',
            flexShrink: 0,
          }}
        >
          <div className="px-6 py-5">
            {/* Cover tab */}
            <div style={{ display: tab === 'cover' ? 'block' : 'none' }}>
              <div className="mb-5">
                <label className="block text-xs font-medium mb-1" style={{ color: '#576A65' }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#0B6E63] focus:ring-2 focus:ring-[#0B6E63]/20"
                  style={{ borderColor: '#D8E0DD', color: '#15211E' }}
                  placeholder="Description courte du template…"
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-medium mb-1" style={{ color: '#576A65' }}>
                  Catégorie
                </label>
                <select
                  value={category}
                  disabled={isSystem}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0B6E63] focus:ring-2 focus:ring-[#0B6E63]/20"
                  style={{ borderColor: '#D8E0DD', color: '#15211E' }}
                >
                  <option value="">Aucune catégorie</option>
                  {FORM_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <CoverEditor cover={cover} onChange={setCover} />
            </div>

            {/* Structure tab — toujours monté pour éviter le crash
                @dnd-kit/sortable 9.x accède au contexte DnD pendant useMemo au mount,
                avant que DndContext ait initialisé droppableRects (bug React 19).
                On cache avec CSS plutôt que de démonter/remonter. */}
            <div style={{ display: tab === 'structure' ? 'flex' : 'none' }} className="flex-col gap-5">
              <PresentationModePicker value={presentation} onChange={setPresentation} />
              <p className="text-xs leading-relaxed" style={{ color: '#576A65' }}>
                Sections, questions et blocs de contenu seront pré-remplis dans tout
                formulaire créé à partir de ce template.
              </p>
              <SectionList
                sections={sections}
                questions={questions}
                contentBlocks={contentBlocks}
                onSectionsChange={setSections}
                onQuestionsChange={setQuestions}
                onBlocksChange={setBlocks}
              />
            </div>

            {/* Ending tab */}
            <div style={{ display: tab === 'ending' ? 'block' : 'none' }}>
              <EndingEditor ending={ending} onChange={setEnding} />
            </div>
          </div>
        </aside>

        {/* Right preview */}
        {showPreview && (
          <main className="flex-1 overflow-auto" style={{ background: '#ECF1EF' }}>
            <div className="h-full">
              {tab === 'cover' ? (
                <CoverPreview cover={cover} />
              ) : (
                <BuilderPreview
                  title={name}
                  description={description}
                  presentation={presentation}
                  cover={cover}
                  ending={ending}
                  sections={sections}
                  questions={questions}
                  contentBlocks={contentBlocks}
                />
              )}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
