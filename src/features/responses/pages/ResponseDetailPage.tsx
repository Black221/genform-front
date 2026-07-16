import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin, ArrowLeft, Calendar, User, Building2,
  CheckSquare, Download, FileText, Trash2, GitBranch,
} from 'lucide-react';
import { responsesApi } from '../api/responsesApi';
import type { MediaItem } from '../api/responsesApi';
import { ResponseStatusBadge } from '../components/ResponseStatusBadge';
import { ValidationActions } from '../components/ValidationActions';
import { formsApi } from '@/features/forms/api/formsApi';
import { Card } from '@/shared/ui/Card';
import { PageHeader } from '@/shared/ui/PageHeader';
import { cn } from '@/shared/lib/cn';
import type { Question, FormAnswer, ResponseStatus } from '@/shared/types';
import { useAuth } from '@/features/auth/useAuth';

/* ── Rendu d'une valeur selon le type de question ───────────── */

function AnswerValue({
  question,
  answer,
  mediaItems = [],
}: {
  question: Question;
  answer?: FormAnswer;
  mediaItems?: MediaItem[];
}) {
  if (!answer || answer.value === null || answer.value === undefined || answer.value === '') {
    return <span className="text-muted italic text-sm">Sans réponse</span>;
  }

  const val = answer.value;

  switch (question.type) {
    case 'SCALE': {
      const num = Number(val);
      const max = question.max ?? 10;
      const pct = Math.round((num / max) * 100);
      return (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)]">
            <div className="h-2 rounded-full bg-(--color-primary)" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm font-semibold text-(--color-text) shrink-0">{num} / {max}</span>
        </div>
      );
    }

    case 'MULTI_CHOICE': {
      const selected = Array.isArray(val) ? val : [String(val)];
      const opts = question.options ?? [];
      return (
        <div className="flex flex-wrap gap-2">
          {(opts.length > 0 ? opts : selected).map((opt) => (
            <span
              key={opt}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full border transition-colors',
                selected.includes(opt)
                  ? 'bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] text-primary border-primary/30'
                  : 'text-muted border-theme',
              )}
            >
              {selected.includes(opt) && <CheckSquare size={10} className="inline mr-1" />}
              {opt}
            </span>
          ))}
        </div>
      );
    }

    case 'SINGLE_CHOICE': {
      const chosen = String(val);
      const opts = question.options ?? [];
      return (
        <div className="flex flex-wrap gap-2">
          {(opts.length > 0 ? opts : [chosen]).map((opt) => (
            <span
              key={opt}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full border',
                opt === chosen
                  ? 'bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] text-primary border-primary/30 font-medium'
                  : 'text-muted border-theme',
              )}
            >
              {opt}
            </span>
          ))}
        </div>
      );
    }

    case 'DATE': {
      const d = new Date(String(val));
      return (
        <span className="text-sm text-(--color-text)">
          {isNaN(d.getTime()) ? String(val) : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </span>
      );
    }

    case 'NUMBER':
      return <span className="text-sm font-mono text-(--color-text)">{String(val)}</span>;

    case 'LONG_TEXT':
      return (
        <p className="text-sm text-(--color-text) whitespace-pre-wrap leading-relaxed bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] rounded-theme p-3">
          {String(val)}
        </p>
      );

    case 'FILE': {
      const files = mediaItems.filter((m) => m.questionId === question.id);
      if (files.length === 0) {
        const meta = Array.isArray(val) ? (val as { name?: string; size?: number }[]) : [];
        if (meta.length === 0) return <span className="text-muted italic text-sm">Sans réponse</span>;
        return (
          <div className="flex flex-col gap-2">
            {meta.map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-theme bg-surface text-muted italic text-sm">
                <FileText size={15} className="shrink-0 text-muted" />
                <span className="truncate">{f.name ?? 'Fichier'}</span>
                <span className="ml-auto text-xs shrink-0">En attente…</span>
              </div>
            ))}
          </div>
        );
      }
      return (
        <div className="flex flex-col gap-2">
          {files.map((f) => (
            <a key={f.id} href={f.downloadUrl} target="_blank" rel="noreferrer" download={f.filename ?? true}
               className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-theme bg-surface hover:border-primary/50 hover:bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)] transition-colors group">
              <FileText size={15} className="shrink-0 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate text-(--color-text)">{f.filename ?? 'Fichier'}</p>
                {f.contentType && <p className="text-xs text-muted">{f.contentType}</p>}
              </div>
              <Download size={14} className="shrink-0 text-muted group-hover:text-primary transition-colors" />
            </a>
          ))}
        </div>
      );
    }

    default:
      return <span className="text-sm text-(--color-text)">{String(val)}</span>;
  }
}

/* ── Page principale ─────────────────────────────────────────── */

export default function ResponseDetailPage() {
  const { id: formId, responseId } = useParams<{ id: string; responseId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const role = useAuth((s) => s.role);
  const canModerate = role === 'ADMIN' || role === 'COORDINATOR';
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: form, isLoading: loadingForm } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => formsApi.get(formId!),
    enabled: !!formId,
  });

  const { data: response, isLoading: loadingResp } = useQuery({
    queryKey: ['response', formId, responseId],
    queryFn: () => responsesApi.get(formId!, responseId!),
    enabled: !!formId && !!responseId,
  });

  const { data: mediaItems = [] } = useQuery({
    queryKey: ['response-media', formId, responseId],
    queryFn: () => responsesApi.getMedia(formId!, responseId!),
    enabled: !!formId && !!responseId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => responsesApi.delete(formId!, responseId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['responses', formId] });
      navigate(`/forms/${formId}/responses`);
    },
  });

  const isLoading = loadingForm || loadingResp;

  const answerMap = new Map<string, FormAnswer>(
    (response?.answers ?? []).map((a) => [a.questionId, a]),
  );

  const sections = [...(form?.sections ?? [])].sort((a, b) => a.position - b.position);
  const shortId = responseId ? responseId.slice(0, 8).toUpperCase() : '…';

  const submittedAt = response
    ? new Date(response.submittedAt).toLocaleString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null;

  const lat = response?.lat ?? response?.location?.lat;
  const lng = response?.lng ?? response?.location?.lng;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Réponse #${shortId}`}
        crumbs={[
          { label: 'Formulaires', to: '/forms' },
          { label: form?.title ?? '…', to: `/forms/${formId}/edit` },
          { label: 'Réponses', to: `/forms/${formId}/responses` },
          { label: `#${shortId}` },
        ]}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-theme bg-surface border border-theme animate-pulse" />
          ))}
        </div>
      ) : !response ? (
        <Card className="py-16 text-center text-sm text-muted">
          Réponse introuvable.{' '}
          <Link to={`/forms/${formId}/responses`} className="text-primary underline">
            Retour à la liste
          </Link>
        </Card>
      ) : (
        <>
          {/* Méta-informations */}
          <Card className="space-y-4">
            <div className="flex flex-wrap items-start gap-6">
              {/* Date */}
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-muted shrink-0" />
                <div>
                  <p className="text-xs text-muted">Soumis le</p>
                  <p className="text-(--color-text) font-medium">{submittedAt}</p>
                </div>
              </div>

              {/* Statut */}
              <div>
                <p className="text-xs text-muted mb-1">Statut</p>
                <ResponseStatusBadge status={(response.status ?? 'PENDING') as ResponseStatus} />
              </div>

              {/* Version */}
              {response.formVersion != null && (
                <div className="flex items-center gap-2 text-sm">
                  <GitBranch size={14} className="text-muted shrink-0" />
                  <div>
                    <p className="text-xs text-muted">Version du schéma</p>
                    <p className="text-(--color-text) font-mono text-xs">v{response.formVersion}</p>
                  </div>
                </div>
              )}

              {/* Répondant */}
              {response.respondentId && (
                <div className="flex items-center gap-2 text-sm">
                  <User size={14} className="text-muted shrink-0" />
                  <div>
                    <p className="text-xs text-muted">Répondant</p>
                    <p className="text-(--color-text) font-mono text-xs">{response.respondentId}</p>
                  </div>
                </div>
              )}

              {/* Commune */}
              {response.communeId && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 size={14} className="text-muted shrink-0" />
                  <div>
                    <p className="text-xs text-muted">Commune</p>
                    <p className="text-(--color-text) font-mono text-xs">{response.communeId}</p>
                  </div>
                </div>
              )}

              {/* Géolocalisation */}
              {lat != null && lng != null && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={14} className="text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs text-muted">Géolocalisation ({response.locationSource ?? 'GPS'})</p>
                    <p className="text-(--color-text) font-mono text-xs">
                      {lat.toFixed(5)}, {lng.toFixed(5)}
                      {response.accuracyMeters && ` ±${Math.round(response.accuracyMeters)}m`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Commentaire de rejet */}
            {response.status === 'REJECTED' && response.reviewComment && (
              <div className="mt-2 p-3 rounded-theme bg-red-500/8 border border-red-500/20 text-sm text-red-600">
                <span className="font-medium">Motif du rejet :</span> {response.reviewComment}
              </div>
            )}
          </Card>

          {/* Actions de modération */}
          {canModerate && (
            <Card className="space-y-3">
              <h3 className="text-sm font-semibold text-(--color-text)">Modération</h3>
              <ValidationActions
                formId={formId!}
                responseId={responseId!}
                currentStatus={(response.status ?? 'PENDING') as ResponseStatus}
              />
            </Card>
          )}

          {/* Réponses par section */}
          {sections.map((section) => {
            const sectionQuestions = (form?.questions ?? [])
              .filter((q) => q.sectionId === section.id)
              .sort((a, b) => a.position - b.position);

            if (sectionQuestions.length === 0) return null;

            return (
              <Card key={section.id} className="space-y-5">
                {section.title && (
                  <h3 className="font-display font-semibold text-(--color-text) pb-3 border-b border-theme">
                    {section.title}
                  </h3>
                )}
                {sectionQuestions.map((q) => (
                  <div key={q.id} className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <p className="text-sm font-medium text-(--color-text) flex-1">{q.label}</p>
                      {q.required && (
                        <span className="text-[10px] text-muted border border-theme px-1.5 py-0.5 rounded shrink-0">
                          obligatoire
                        </span>
                      )}
                    </div>
                    <AnswerValue question={q} answer={answerMap.get(q.id)} mediaItems={mediaItems} />
                  </div>
                ))}
              </Card>
            );
          })}

          {/* Questions sans section */}
          {(() => {
            const orphans = (form?.questions ?? [])
              .filter((q) => !q.sectionId)
              .sort((a, b) => a.position - b.position);
            if (orphans.length === 0) return null;
            return (
              <Card className="space-y-5">
                {orphans.map((q) => (
                  <div key={q.id} className="space-y-2">
                    <p className="text-sm font-medium text-(--color-text)">{q.label}</p>
                    <AnswerValue question={q} answer={answerMap.get(q.id)} mediaItems={mediaItems} />
                  </div>
                ))}
              </Card>
            );
          })()}

          {/* Zone de danger — suppression */}
          {canModerate && (
            <Card className="border-red-500/20 space-y-3">
              <h3 className="text-sm font-semibold text-red-600">Zone de danger</h3>
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-theme border border-red-500/30 text-red-600 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={14} />
                  Supprimer cette réponse
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-red-600">Cette action est irréversible. Confirmer ?</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate()}
                      className="px-4 py-1.5 text-sm font-semibold rounded-theme bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? 'Suppression…' : 'Confirmer la suppression'}
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(false)} className="text-sm text-muted hover:text-(--color-text)">
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Retour */}
          <div className="flex">
            <Link to={`/forms/${formId}/responses`}>
              <button className="inline-flex items-center gap-2 text-sm text-muted hover:text-(--color-text) transition-colors">
                <ArrowLeft size={14} />
                Retour à la liste des réponses
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
