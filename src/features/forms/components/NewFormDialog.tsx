import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { FileText, Plus } from 'lucide-react';
import { Dialog } from '@/shared/ui/Dialog';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { TemplateCard } from '@/features/templates/components/TemplateCard';
import { templatesApi } from '@/features/templates/api/templatesApi';
import { formsApi } from '../api/formsApi';
import { useToast } from '@/shared/ui/Toast';
import { slugify } from '@/shared/lib/slugify';
import { cn } from '@/shared/lib/cn';
import type { Template } from '@/shared/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const BLANK_ID = '__blank__';

export function NewFormDialog({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [selectedId, setSelectedId] = useState<string>(BLANK_ID);
  const [titleTouched, setTitleTouched] = useState(false);

  const { data: templates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templatesApi.list(),
    enabled: open,
  });

  const systemTemplates = templates.filter((t) => t.isSystem);
  const myTemplates     = templates.filter((t) => !t.isSystem);

  // Auto-remplit le titre quand on sélectionne un template (sauf si déjà saisi)
  function select(id: string, tpl?: Template) {
    setSelectedId(id);
    if (!titleTouched) {
      setTitle(tpl ? `Copie de ${tpl.name}` : '');
    }
  }

  // Réinitialise à l'ouverture
  useEffect(() => {
    if (open) {
      setTitle('');
      setSelectedId(BLANK_ID);
      setTitleTouched(false);
    }
  }, [open]);

  const createMutation = useMutation({
    mutationFn: () =>
      formsApi.create({
        title: title.trim() || 'Sans titre',
        templateId: selectedId !== BLANK_ID ? selectedId : undefined,
      }),
    onSuccess: (form) => {
      onClose();
      navigate(`/forms/${form.id}/edit`);
    },
    onError: () => toast('Impossible de créer le formulaire', 'error'),
  });

  const slugPreview = slugify(title.trim() || 'sans-titre');

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => { if (!v) onClose(); }}
      title="Nouveau formulaire"
      description="Choisissez un point de départ, puis donnez un titre à votre formulaire."
      className="max-w-3xl max-h-[88vh] flex flex-col overflow-hidden"
    >
      {/* ── Titre + aperçu URL ─────────────────────────────────── */}
      <div className="mb-5 flex flex-col gap-3">
        <Input
          label="Titre du formulaire"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setTitleTouched(true); }}
          placeholder="ex. Enquête de satisfaction Q3"
          autoFocus
        />
        <div className="flex items-center gap-2 px-3 py-2 rounded-theme bg-surface-raised border border-theme">
          <span className="text-xs text-muted shrink-0">Adresse URL :</span>
          <span className="text-xs font-mono text-(--color-text) truncate">
            /f/<span className="text-primary">{slugPreview}</span>
          </span>
        </div>
      </div>

      {/* ── Grille de templates ────────────────────────────────── */}
      <div className="overflow-y-auto flex-1 -mx-1 px-1 pb-1 space-y-6">

        {/* Option vide */}
        <div>
          <p className="text-xs font-display font-semibold text-muted uppercase tracking-wider mb-3">
            Point de départ
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Carte "Formulaire vide" */}
            <button
              type="button"
              onClick={() => select(BLANK_ID)}
              className={cn(
                'flex flex-col items-center justify-center gap-2 h-28 rounded-theme border-2 border-dashed transition-all text-sm font-display font-medium',
                selectedId === BLANK_ID
                  ? 'border-(--color-primary) bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] text-(--color-primary)'
                  : 'border-theme text-muted hover:border-(--color-primary)/50 hover:text-(--color-text)',
              )}
            >
              <div className={cn(
                'size-9 rounded-full flex items-center justify-center',
                selectedId === BLANK_ID
                  ? 'bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]'
                  : 'bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]',
              )}>
                <FileText size={16} />
              </div>
              Formulaire vide
            </button>

            {/* Skeleton pendant le chargement */}
            {loadingTemplates && [1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-theme bg-surface border border-theme animate-pulse" />
            ))}
          </div>
        </div>

        {/* Templates système */}
        {systemTemplates.length > 0 && (
          <div>
            <p className="text-xs font-display font-semibold text-muted uppercase tracking-wider mb-3">
              Templates intégrés
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {systemTemplates.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  selected={selectedId === t.id}
                  onClick={() => select(t.id, t)}
                  onUse={() => select(t.id, t)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Mes templates */}
        {myTemplates.length > 0 && (
          <div>
            <p className="text-xs font-display font-semibold text-muted uppercase tracking-wider mb-3">
              Mes templates
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {myTemplates.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  selected={selectedId === t.id}
                  onClick={() => select(t.id, t)}
                  onUse={() => select(t.id, t)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Pied de dialog ─────────────────────────────────────── */}
      <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-theme shrink-0">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Annuler
        </Button>
        <Button
          size="sm"
          onClick={() => createMutation.mutate()}
          loading={createMutation.isPending}
        >
          <Plus size={14} className="mr-1.5" />
          Créer le formulaire
        </Button>
      </div>
    </Dialog>
  );
}
