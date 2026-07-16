import { useQuery } from '@tanstack/react-query';
import { History, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { formsApi } from '../api/formsApi';

interface Props {
  formId: string;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

export function FormVersionsPanel({ formId }: Props) {
  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['form-versions', formId],
    queryFn: () => formsApi.getVersions(formId),
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-14 rounded-theme bg-surface border border-theme animate-pulse" />
        ))}
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-12">
        <History size={32} className="mx-auto mb-3 text-muted opacity-40" />
        <p className="text-sm text-muted">Aucune version publiée pour l'instant.</p>
        <p className="text-xs text-muted mt-1 opacity-70">
          Chaque publication crée un snapshot immuable du schéma.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {versions.map((v) => {
        const isOpen = expandedId === v.id;
        const schemaStr = JSON.stringify(v.schema, null, 2);
        return (
          <div key={v.id} className="rounded-theme border border-theme bg-surface overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-theme transition-colors"
              onClick={() => setExpandedId(isOpen ? null : v.id)}
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center size-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  v{v.version}
                </span>
                <div>
                  <p className="text-sm font-medium text-(--color-text)">
                    Version {v.version}
                  </p>
                  <p className="text-xs text-muted">{formatDate(v.publishedAt)}</p>
                </div>
              </div>
              {isOpen ? <ChevronDown size={14} className="text-muted" /> : <ChevronRight size={14} className="text-muted" />}
            </button>

            {isOpen && (
              <div className="border-t border-theme px-4 py-3">
                <p className="text-xs font-medium text-muted mb-2 uppercase tracking-wide">
                  Snapshot du schéma
                </p>
                <pre className="text-xs text-muted bg-app rounded-md p-3 overflow-auto max-h-64 leading-relaxed">
                  {schemaStr}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
