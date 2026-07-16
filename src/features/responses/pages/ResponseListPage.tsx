import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Eye, Download, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { responsesApi } from '../api/responsesApi';
import type { ResponseListParams } from '../api/responsesApi';
import { ResponseStatusBadge } from '../components/ResponseStatusBadge';
import { ResponseFilters } from '../components/ResponseFilters';
import { formsApi } from '@/features/forms/api/formsApi';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { PageHeader } from '@/shared/ui/PageHeader';
import { cn } from '@/shared/lib/cn';
import type { ResponseStatus } from '@/shared/types';

const PAGE_SIZE = 20;

function ExportMenu({ formId, filters }: { formId: string; filters: ResponseListParams }) {
  const [open, setOpen] = useState(false);

  const download = (format: 'csv' | 'geojson') => {
    setOpen(false);
    responsesApi.export(formId, format, filters).then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reponses-${formId}.${format === 'geojson' ? 'geojson' : 'csv'}`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="relative">
      <Button variant="secondary" size="sm" onClick={() => setOpen((v) => !v)}>
        <Download size={14} className="mr-1.5" />
        Exporter
        <ChevronDown size={12} className="ml-1 opacity-60" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-40 min-w-36 rounded-theme border border-theme bg-surface shadow-lg overflow-hidden">
            {(['csv', 'geojson'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => download(fmt)}
                className="w-full text-left px-4 py-2.5 text-sm text-(--color-text) hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] transition-colors"
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ResponseListPage() {
  const { id: formId } = useParams<{ id: string }>();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<ResponseListParams>({});

  const { data: form } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => formsApi.get(formId!),
    enabled: !!formId,
  });

  const { data: result, isLoading } = useQuery({
    queryKey: ['responses', formId, page, filters],
    queryFn: () => responsesApi.list(formId!, { ...filters, page, size: PAGE_SIZE }),
    enabled: !!formId,
  });

  const responses = result?.content ?? [];
  const totalPages = result?.totalPages ?? 0;
  const totalElements = result?.totalElements ?? 0;

  const handleFilterChange = (patch: Partial<ResponseListParams>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(0);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Réponses"
        crumbs={[
          { label: 'Formulaires', to: '/forms' },
          { label: form?.title ?? '…', to: `/forms/${formId}/edit` },
          { label: 'Réponses' },
        ]}
        action={<ExportMenu formId={formId!} filters={filters} />}
      />

      {/* Filtres */}
      <ResponseFilters filters={filters} onChange={handleFilterChange} />

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-muted">Chargement…</div>
        ) : responses.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted">
            Aucune réponse ne correspond aux filtres.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-theme text-left">
                  {['Date / Heure', 'Statut', 'Réponses', 'Géoloc', 'Commune', 'Version', ''].map((col) => (
                    <th
                      key={col}
                      className="py-3 px-4 text-xs font-display font-semibold text-muted uppercase tracking-wider whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {responses.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-theme last:border-0 hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] transition-colors"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-(--color-text)">
                        {new Date(r.submittedAt).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </div>
                      <div className="text-xs text-muted">
                        {new Date(r.submittedAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <ResponseStatusBadge status={(r.status ?? 'PENDING') as ResponseStatus} />
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center justify-center size-6 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-xs font-semibold text-primary">
                        {r.answerCount ?? r.answers?.length ?? 0}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {(r.hasLocation || r.location) ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
                          <MapPin size={11} />
                          {r.locationSource ?? 'GPS'}
                        </span>
                      ) : (
                        <span className="text-muted text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-muted font-mono">
                        {r.communeId ? r.communeId.slice(0, 8) + '…' : '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {r.formVersion != null ? (
                        <span className="text-xs text-muted">v{r.formVersion}</span>
                      ) : (
                        <span className="text-muted text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/forms/${formId}/responses/${r.id}`}>
                        <button className={cn(
                          'inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-theme',
                          'border border-theme text-muted hover:text-(--color-text)',
                          'hover:border-(--color-primary)/50 transition-all',
                        )}>
                          <Eye size={12} />
                          Voir
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted text-xs">
            {totalElements} réponse{totalElements !== 1 ? 's' : ''} · Page {page + 1} / {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={14} className="mr-1" />
              Précédent
            </Button>
            <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              Suivant
              <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
