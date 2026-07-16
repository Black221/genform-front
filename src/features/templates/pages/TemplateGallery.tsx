import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { templatesApi } from '../api/templatesApi';
import type { TemplateScope } from '../api/templatesApi';
import { TemplateCard } from '../components/TemplateCard';
import { Button } from '@/shared/ui/Button';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useToast } from '@/shared/ui/Toast';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { useAuth } from '@/features/auth/useAuth';
import { FORM_CATEGORIES } from '@/shared/lib/formCategories';
import { cn } from '@/shared/lib/cn';
import type { Template } from '@/shared/types';

const SCOPES: { value: TemplateScope | ''; label: string }[] = [
  { value: '',       label: 'Tous' },
  { value: 'system', label: 'Système' },
  { value: 'public', label: 'Publics' },
  { value: 'mine',   label: 'Mes templates' },
];

export default function TemplateGallery() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();
  const userId = useAuth((s) => s.userId);

  const [scope, setScope] = useState<TemplateScope | ''>('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates', { scope, category, q: search }],
    queryFn: () =>
      templatesApi.list({
        scope: scope || undefined,
        category: category || undefined,
        q: search || undefined,
      }),
  });

  const createFromTemplate = useMutation({
    mutationFn: (template: Template) => templatesApi.createForm(template.id),
    onSuccess: (form) => {
      toast('Formulaire créé depuis le template', 'success');
      navigate(`/forms/${form.id}/edit`);
    },
    onError: () => toast('Erreur lors de la création', 'error'),
  });

  const deleteTemplate = useMutation({
    mutationFn: (id: string) => templatesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] });
      toast('Template supprimé', 'success');
    },
    onError: () => toast('Erreur lors de la suppression', 'error'),
  });

  const systemTemplates = templates.filter((t) => t.isSystem);
  const myTemplates = templates.filter((t) => !t.isSystem && t.ownerId === userId);
  const publicTemplates = templates.filter((t) => !t.isSystem && t.ownerId !== userId);

  const sections: { title: string; items: Template[]; deletable: boolean }[] = [
    { title: 'Templates intégrés', items: systemTemplates, deletable: false },
    { title: 'Templates publics',  items: publicTemplates, deletable: false },
    { title: 'Mes templates',      items: myTemplates,     deletable: true },
  ];

  return (
    <div>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={`Supprimer "${deleteTarget?.name}"`}
        description="Cette action est irréversible. Le template sera définitivement supprimé. Les formulaires déjà créés ne sont pas affectés."
        confirmLabel="Supprimer"
        onConfirm={() => { if (deleteTarget) deleteTemplate.mutate(deleteTarget.id); }}
      />
      <PageHeader
        title="Templates"
        crumbs={[{ label: 'Observatoire', to: '/' }, { label: 'Templates' }]}
        action={
          <Button size="sm" onClick={() => navigate('/templates/new')}>
            + Créer un template
          </Button>
        }
      />

      {/* ── Filtres : scope, catégorie, recherche ─────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="flex rounded-lg border border-theme overflow-hidden">
          {SCOPES.map((s) => (
            <button
              key={s.value}
              onClick={() => setScope(s.value)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                scope === s.value
                  ? 'bg-(--color-primary) text-white'
                  : 'bg-surface text-muted hover:text-(--color-text)',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-theme bg-surface text-(--color-text) focus:outline-none"
        >
          <option value="">Toutes les catégories</option>
          {FORM_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <div className="relative flex-1 min-w-48 max-w-72">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un template…"
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-theme bg-surface text-(--color-text) focus:outline-none focus:border-(--color-primary)"
          />
        </div>
      </div>

      <div className="flex flex-col gap-10">
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-theme bg-surface animate-pulse" />
            ))}
          </div>
        )}

        {sections.map(({ title, items, deletable }) =>
          items.length > 0 ? (
            <section key={title}>
              <h2 className="font-display font-semibold text-(--color-text) mb-4">{title}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {items.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    onClick={() => navigate(`/templates/${t.id}/edit`)}
                    onUse={() => createFromTemplate.mutate(t)}
                    onDelete={deletable ? () => setDeleteTarget({ id: t.id, name: t.name }) : undefined}
                  />
                ))}
              </div>
            </section>
          ) : null,
        )}

        {!isLoading && templates.length === 0 && (
          <div className="text-center py-20 text-muted">
            <p className="text-lg mb-4">
              {search || category || scope ? 'Aucun template ne correspond aux filtres' : 'Aucun template disponible'}
            </p>
            {!search && !category && !scope && (
              <Button onClick={() => navigate('/templates/new')}>Créer le premier</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
