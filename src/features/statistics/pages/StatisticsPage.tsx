import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { statisticsApi } from '../api/statisticsApi';
import { StatCard } from '../components/StatCard';
import { ChoiceChart } from '../components/ChoiceChart';
import { ScaleChart } from '../components/ScaleChart';
import { TextAnswersList } from '../components/TextAnswersList';
import { ResponsesTimeline } from '../components/ResponsesTimeline';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Button } from '@/shared/ui/Button';
import { CATEGORY_LABEL } from '@/shared/lib/formCategories';
import type { FormCategory } from '@/shared/lib/formCategories';

function formatDuration(seconds: number) {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  return `${Math.round(seconds / 60)}min`;
}

export default function StatisticsPage() {
  const { id } = useParams<{ id: string }>();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['statistics', id],
    queryFn: () => statisticsApi.get(id!),
    enabled: !!id,
  });

  const handleExport = async () => {
    if (!id) return;
    const blob = await statisticsApi.exportCsv(id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formulaire-${id}-reponses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="size-8 rounded-full border-2 border-(--color-primary) border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Statistiques"
        crumbs={[
          { label: 'Formulaires', to: '/forms' },
          { label: 'Éditer', to: `/forms/${id}/edit` },
          { label: 'Statistiques' },
        ]}
        action={
          <Button size="sm" variant="secondary" onClick={handleExport}>
            Exporter CSV
          </Button>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Réponses" value={stats.totalResponses} />
        <StatCard label="Taux de complétion" value={`${Math.round(stats.completionRate * 100)}%`} />
        <StatCard label="Durée moyenne" value={formatDuration(stats.averageCompletionSeconds)} sub="par réponse" />
      </div>

      {/* Ventilation par commune (D5) */}
      {stats.byCommune && Object.keys(stats.byCommune).length > 0 && (
        <section>
          <h2 className="font-display font-semibold text-(--color-text) mb-4">Réponses par commune</h2>
          <div className="bg-surface rounded-theme border border-theme p-6">
            <ChoiceChart distribution={stats.byCommune} fillRate={1} />
          </div>
        </section>
      )}

      {/* Ventilation par catégorie (D5) */}
      {stats.byCategory && Object.keys(stats.byCategory).length > 0 && (
        <section>
          <h2 className="font-display font-semibold text-(--color-text) mb-4">Réponses par thématique</h2>
          <div className="bg-surface rounded-theme border border-theme p-6">
            <ChoiceChart
              distribution={Object.fromEntries(
                Object.entries(stats.byCategory).map(([k, v]) => [
                  CATEGORY_LABEL[k as FormCategory] ?? k,
                  v,
                ]),
              )}
              fillRate={1}
            />
          </div>
        </section>
      )}

      {/* Timeline */}
      {Object.keys(stats.timeSeries ?? {}).length > 0 && (
        <section>
          <h2 className="font-display font-semibold text-(--color-text) mb-4">Réponses dans le temps</h2>
          <div className="bg-surface rounded-theme border border-theme p-6">
            <ResponsesTimeline timeSeries={stats.timeSeries ?? {}} />
          </div>
        </section>
      )}

      {/* Per-question stats */}
      {(stats.questionStats ?? []).length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="font-display font-semibold text-(--color-text)">Résultats par question</h2>
          {(stats.questionStats ?? []).map((qs) => (
            <div key={qs.questionId} className="bg-surface rounded-theme border border-theme p-6 flex flex-col gap-4">
              <div>
                <p className="font-medium text-(--color-text)">{qs.questionLabel}</p>
                <p className="text-xs text-muted uppercase tracking-wide mt-0.5">{qs.questionType}</p>
              </div>

              {(qs.questionType === 'SINGLE_CHOICE' || qs.questionType === 'MULTI_CHOICE') &&
                qs.distributionByChoice && (
                  <ChoiceChart distribution={qs.distributionByChoice} fillRate={qs.fillRate} />
                )}

              {qs.questionType === 'SCALE' && qs.distributionByChoice && (
                <ScaleChart
                  distribution={qs.distributionByChoice}
                  average={qs.average}
                  median={qs.median}
                  fillRate={qs.fillRate}
                />
              )}

              {(qs.questionType === 'TEXT' || qs.questionType === 'LONG_TEXT') && qs.sampleAnswers && (
                <TextAnswersList answers={qs.sampleAnswers} fillRate={qs.fillRate} />
              )}

              {(qs.questionType === 'NUMBER' || qs.questionType === 'DATE') && (
                <div className="flex gap-6 text-sm flex-wrap">
                  {qs.average !== undefined && (
                    <span className="text-muted">Moyenne : <strong className="text-(--color-text)">{qs.average.toFixed(1)}</strong></span>
                  )}
                  {qs.median !== undefined && (
                    <span className="text-muted">Médiane : <strong className="text-(--color-text)">{qs.median.toFixed(1)}</strong></span>
                  )}
                  <span className="text-muted">Taux : <strong className="text-(--color-text)">{Math.round(qs.fillRate * 100)}%</strong></span>
                </div>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
