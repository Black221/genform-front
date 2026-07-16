import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { formsApi } from '../api/formsApi';
import type { FormListParams } from '../api/formsApi';
import { FormCard } from '../components/FormCard';
import { FormListFilters } from '../components/FormListFilters';
import { NewFormDialog } from '../components/NewFormDialog';
import { Button } from '@/shared/ui/Button';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useToast } from '@/shared/ui/Toast';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

export default function FormListPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showNew, setShowNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FormListParams>({});

  const { data: forms, isLoading } = useQuery({
    queryKey: ['forms', filters],
    queryFn: () => formsApi.list(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => formsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forms'] });
      toast('Formulaire supprimé', 'success');
    },
    onError: () => toast('Impossible de supprimer ce formulaire', 'error'),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => formsApi.duplicate(id),
    onSuccess: (copy) => {
      qc.invalidateQueries({ queryKey: ['forms'] });
      toast('Formulaire dupliqué', 'success');
      navigate(`/forms/${copy.id}/edit`);
    },
    onError: () => toast('Erreur lors de la duplication', 'error'),
  });

  const archiveMutation = useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
      archived ? formsApi.unarchive(id) : formsApi.archive(id),
    onSuccess: (_, { archived }) => {
      qc.invalidateQueries({ queryKey: ['forms'] });
      toast(archived ? 'Formulaire désarchivé' : 'Formulaire archivé', 'success');
    },
    onError: () => toast('Erreur lors de l\'archivage', 'error'),
  });

  const handleArchive = (id: string) => {
    const form = forms?.find((f) => f.id === id);
    if (!form) return;
    archiveMutation.mutate({ id, archived: form.archived });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  return (
    <div className="space-y-6">
      <NewFormDialog open={showNew} onClose={() => setShowNew(false)} />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Supprimer le formulaire"
        description="Cette action est irréversible. Le formulaire et toutes ses réponses seront définitivement supprimés."
        confirmLabel="Supprimer"
        onConfirm={() => { if (deleteId) deleteMutation.mutate(deleteId); }}
      />

      <PageHeader
        title="Formulaires"
        crumbs={[{ label: 'Observatoire', to: '/' }, { label: 'Formulaires' }]}
        action={
          <Button onClick={() => setShowNew(true)}>
            + Nouveau formulaire
          </Button>
        }
      />

      {/* Filtres */}
      <FormListFilters
        filters={filters}
        onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-surface border border-theme animate-pulse" />
          ))}
        </div>
      ) : forms?.length === 0 ? (
        <div className="text-center py-24">
          {hasActiveFilters ? (
            <>
              <p className="text-muted mb-3">Aucun formulaire ne correspond aux filtres sélectionnés.</p>
              <Button variant="secondary" onClick={() => setFilters({})}>
                Effacer les filtres
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted mb-6">Aucun formulaire pour l'instant</p>
              <Button onClick={() => setShowNew(true)}>Créer mon premier formulaire</Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms?.map((form) => (
            <FormCard
              key={form.id}
              form={form}
              onDelete={(id) => setDeleteId(id)}
              onDuplicate={(id) => duplicateMutation.mutate(id)}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
