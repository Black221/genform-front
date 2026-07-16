import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Globe, Lock, LayoutTemplate } from 'lucide-react';
import { formsApi } from '../api/formsApi';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Dialog } from '@/shared/ui/Dialog';
import { useToast } from '@/shared/ui/Toast';
import { FORM_CATEGORIES } from '@/shared/lib/formCategories';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId: string;
  defaultName: string;
  defaultDescription?: string;
  defaultCategory?: string;
}

/** UC-T4 — snapshot du schéma courant du formulaire en template personnel. */
export function SaveAsTemplateDialog({
  open, onOpenChange, formId, defaultName, defaultDescription, defaultCategory,
}: Props) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState(defaultDescription ?? '');
  const [category, setCategory] = useState(defaultCategory ?? '');
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(defaultName);
    setDescription(defaultDescription ?? '');
    setCategory(defaultCategory ?? '');
    setIsPublic(false);
  }, [open, defaultName, defaultDescription, defaultCategory]);

  const saveMutation = useMutation({
    mutationFn: () =>
      formsApi.saveAsTemplate(formId, {
        name,
        description: description || undefined,
        category: category || undefined,
        isPublic,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] });
      toast('Template créé depuis le formulaire', 'success');
      onOpenChange(false);
    },
    onError: () => toast('Erreur lors de la création du template', 'error'),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Enregistrer comme template"
      description="Le schéma courant (sections, questions, couverture, fin) sera réutilisable pour créer de nouveaux formulaires. Le thème n'est pas copié."
    >
      <div className="flex flex-col gap-4 mt-2">
        <Input
          label="Nom du template"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du template…"
        />
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description courte…"
        />
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Catégorie</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-theme bg-surface text-(--color-text) focus:outline-none focus:border-(--color-primary)"
          >
            <option value="">Aucune catégorie</option>
            {FORM_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setIsPublic((v) => !v)}
          className="flex items-center gap-2 text-xs text-muted hover:text-(--color-text) transition-colors self-start"
        >
          {isPublic ? <Globe size={13} className="text-primary" /> : <Lock size={13} />}
          {isPublic
            ? 'Public — visible des autres coordinateurs'
            : 'Privé — visible de vous uniquement'}
        </button>

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            size="sm"
            onClick={() => saveMutation.mutate()}
            loading={saveMutation.isPending}
            disabled={!name.trim()}
          >
            <LayoutTemplate size={14} className="mr-1.5" />
            Créer le template
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
