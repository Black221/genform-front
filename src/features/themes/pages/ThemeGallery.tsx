import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { themesApi } from '../api/themesApi';
import { ThemeCard } from '../components/ThemeCard';
import { Button } from '@/shared/ui/Button';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useToast } from '@/shared/ui/Toast';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

export default function ThemeGallery() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: themes = [], isLoading } = useQuery({
    queryKey: ['themes'],
    queryFn: themesApi.list,
  });

  const deleteTheme = useMutation({
    mutationFn: (id: string) => themesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['themes'] });
      toast('Thème supprimé', 'success');
    },
    onError: () => toast('Erreur lors de la suppression', 'error'),
  });

  const systemThemes = themes.filter((t) => t.isSystem);
  const myThemes = themes.filter((t) => !t.isSystem);

  return (
    <div>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={`Supprimer "${deleteTarget?.name}"`}
        description="Cette action est irréversible. Le thème sera définitivement supprimé."
        confirmLabel="Supprimer"
        onConfirm={() => { if (deleteTarget) deleteTheme.mutate(deleteTarget.id); }}
      />
      <PageHeader
        title="Thèmes"
        crumbs={[{ label: 'Observatoire', to: '/' }, { label: 'Thèmes' }]}
        action={
          <Button size="sm" onClick={() => navigate('/themes/new')}>
            + Créer un thème
          </Button>
        }
      />

      <div className="flex flex-col gap-10">
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-theme bg-surface animate-pulse" />
            ))}
          </div>
        )}

        {systemThemes.length > 0 && (
          <section>
            <h2 className="font-display font-semibold text-(--color-text) mb-4">Thèmes intégrés</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {systemThemes.map((t) => (
                <ThemeCard
                  key={t.id}
                  theme={t}
                  onClick={() => navigate(`/themes/${t.id}/edit`)}
                />
              ))}
            </div>
          </section>
        )}

        {myThemes.length > 0 && (
          <section>
            <h2 className="font-display font-semibold text-(--color-text) mb-4">Mes thèmes</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {myThemes.map((t) => (
                <ThemeCard
                  key={t.id}
                  theme={t}
                  onClick={() => navigate(`/themes/${t.id}/edit`)}
                  onDelete={() => setDeleteTarget({ id: t.id, name: t.name })}
                />
              ))}
            </div>
          </section>
        )}

        {!isLoading && themes.length === 0 && (
          <div className="text-center py-20 text-muted">
            <p className="text-lg mb-4">Aucun thème disponible</p>
            <Button onClick={() => navigate('/themes/new')}>Créer le premier</Button>
          </div>
        )}
      </div>
    </div>
  );
}
