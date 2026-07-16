import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft, ChevronRight, Calendar, MapPin, Images, FileText, ListChecks,
  Crosshair, ShieldCheck, Clock, CheckCircle2, XCircle, Check, X, Download,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { Button } from '@/shared/ui/Button';
import { useObservationDetail } from '../../hooks/useObservationDetail';
import { mapApi } from '../../api/mapApi';
import type { ObservationStatus } from '../../api/mapApi';
import { formatCoords, formatDate } from '../../lib/geo';
import { cn } from '@/shared/lib/cn';

const STATUS: Record<ObservationStatus, { label: string; cls: string; Icon: typeof Clock }> = {
  PENDING:   { label: 'En attente', cls: 'bg-(--color-gold-soft) text-[#8a5a00]',           Icon: Clock },
  VALIDATED: { label: 'Validée',    cls: 'bg-(--color-success-soft) text-success',           Icon: CheckCircle2 },
  REJECTED:  { label: 'Rejetée',    cls: 'bg-(--color-danger-soft) text-danger',             Icon: XCircle },
};

interface Props {
  observationId: string;
  onBack: () => void;
  /** Affiche le lien « Retour à la liste » (masqué en mode modal). */
  showBack?: boolean;
}

export function ObservationDetail({ observationId, onBack, showBack = true }: Props) {
  const { data: detail, isLoading, isError } = useObservationDetail(observationId);
  const role = useAuth((s) => s.role);
  const queryClient = useQueryClient();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const canModerate = role === 'ADMIN' || role === 'COORDINATOR';

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['map-observation-detail', observationId] });
    queryClient.invalidateQueries({ queryKey: ['map-observations'] });
    queryClient.invalidateQueries({ queryKey: ['map-commune-aggregate'] });
    queryClient.invalidateQueries({ queryKey: ['map-gallery'] });
  };

  const validateMutation = useMutation({
    mutationFn: () => mapApi.validateObservation(detail!.formId, detail!.id),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: () => mapApi.rejectObservation(detail!.formId, detail!.id, rejectComment),
    onSuccess: () => { invalidate(); setShowRejectForm(false); setRejectComment(''); },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-5">
        <div className="h-6 w-2/3 rounded-lg bg-border/30 animate-pulse" />
        <div className="h-40 rounded-xl bg-border/30 animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-border/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="p-8 text-center text-sm text-muted">
        Impossible de charger le détail.
      </div>
    );
  }

  const imageMedia = detail.media.filter((m) =>
    m.contentType?.startsWith('image/') || m.type === 'PHOTO',
  );
  const otherMedia = detail.media.filter((m) =>
    !m.contentType?.startsWith('image/') && m.type !== 'PHOTO',
  );

  const status = STATUS[detail.status];
  const StatusIcon = status.Icon;

  const closeLightbox = () => setLightboxIndex(null);
  const stepLightbox = (delta: number) =>
    setLightboxIndex((i) => (i === null ? null : (i + delta + imageMedia.length) % imageMedia.length));

  return (
    <>
      {/* ── En-tête ─────────────────────────────────────────────── */}
      <div className="shrink-0 px-5 pt-4 pb-4 bg-linear-to-br from-primary/8 via-primary/4 to-transparent border-b border-border/40">
        {showBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-medium text-muted hover:text-primary mb-2.5 transition-colors"
          >
            <ChevronLeft className="size-3.5" />
            Retour à la liste
          </button>
        )}

        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold mb-2',
            status.cls,
          )}
        >
          <StatusIcon className="size-3.5" />
          {status.label}
        </span>

        <h3 className="font-display text-base font-bold text-(--color-text) leading-snug pr-8">
          {detail.formTitle}
        </h3>

        <div className="flex items-center gap-3 mt-2 text-xs text-muted flex-wrap">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3.5" />
            {formatDate(detail.submittedAt)}
          </span>
          {detail.communeName && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {detail.communeName}
            </span>
          )}
        </div>
      </div>

      {/* ── Corps défilant ──────────────────────────────────────── */}
      <div className="overflow-y-auto flex-1 pb-5">

        {/* Photos */}
        {imageMedia.length > 0 && (
          <Section icon={<Images className="size-3.5" />} title="Photos" count={imageMedia.length}>
            {/* Hero — première photo */}
            <button
              onClick={() => setLightboxIndex(0)}
              className="block w-full aspect-4/3 rounded-xl overflow-hidden bg-border/20 group
                         focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <img
                src={imageMedia[0].downloadUrl}
                alt={imageMedia[0].filename ?? 'Photo'}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                loading="lazy"
              />
            </button>
            {/* Miniatures restantes */}
            {imageMedia.length > 1 && (
              <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                {imageMedia.slice(1).map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => setLightboxIndex(i + 1)}
                    className="aspect-square rounded-lg overflow-hidden bg-border/20 group
                               focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <img
                      src={m.downloadUrl}
                      alt={m.filename ?? 'Photo'}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* Fichiers */}
        {otherMedia.length > 0 && (
          <Section icon={<FileText className="size-3.5" />} title="Fichiers" count={otherMedia.length}>
            <div className="space-y-1.5">
              {otherMedia.map((m) => (
                <a
                  key={m.id}
                  href={m.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/[0.02] border border-border/40
                             text-xs text-(--color-text) hover:border-primary/40 hover:text-primary transition-colors"
                >
                  <FileText className="size-4 shrink-0 text-muted" />
                  <span className="flex-1 truncate">{m.filename ?? 'Fichier'}</span>
                  <Download className="size-3.5 shrink-0 text-muted" />
                </a>
              ))}
            </div>
          </Section>
        )}

        {/* Réponses */}
        {detail.answers.length > 0 && (
          <Section icon={<ListChecks className="size-3.5" />} title="Réponses" count={detail.answers.length}>
            <div className="space-y-1.5">
              {detail.answers.map((a) => {
                const value = Array.isArray(a.value)
                  ? (a.value as string[]).join(', ')
                  : a.value == null || a.value === '' ? '—' : String(a.value);
                return (
                  <div key={a.questionId} className="rounded-xl bg-black/[0.02] border border-border/40 px-3 py-2.5">
                    <p className="text-[11px] font-medium text-muted leading-snug">{a.label}</p>
                    <p className="text-sm text-(--color-text) mt-1 whitespace-pre-wrap wrap-break-word">{value}</p>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Localisation */}
        {detail.location && (
          <Section icon={<Crosshair className="size-3.5" />} title="Localisation">
            <div className="rounded-xl bg-black/[0.02] border border-border/40 px-3 py-2.5">
              <p className="text-sm font-mono text-(--color-text)">
                {formatCoords(detail.location.lat, detail.location.lng)}
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {detail.accuracyM != null && (
                  <span className="text-[11px] text-muted">± {Math.round(detail.accuracyM)} m</span>
                )}
                {detail.locationSource && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    {detail.locationSource === 'GPS' ? 'GPS' : 'Manuel'}
                  </span>
                )}
              </div>
            </div>
          </Section>
        )}

        {/* Modération passée */}
        {detail.status !== 'PENDING' && (detail.reviewedAt || detail.reviewComment) && (
          <Section icon={<ShieldCheck className="size-3.5" />} title="Modération">
            <div className="rounded-xl bg-black/[0.02] border border-border/40 px-3 py-2.5 text-xs text-muted">
              {detail.reviewedAt && <p>{formatDate(detail.reviewedAt)}</p>}
              {detail.reviewComment && <p className="mt-1 italic text-(--color-text)">« {detail.reviewComment} »</p>}
            </div>
          </Section>
        )}

        {/* Modération — actions */}
        {canModerate && detail.status === 'PENDING' && (
          <div className="px-5 pt-4">
            {!showRejectForm ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  loading={validateMutation.isPending}
                  onClick={() => validateMutation.mutate()}
                  className="flex-1"
                >
                  <Check className="size-4 mr-1.5" />
                  Valider
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setShowRejectForm(true)}
                  className="flex-1"
                >
                  <X className="size-4 mr-1.5" />
                  Rejeter
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  placeholder="Motif de rejet (obligatoire)"
                  rows={3}
                  autoFocus
                  className="w-full text-sm rounded-xl border border-border px-3 py-2 bg-surface
                             focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15
                             resize-none text-(--color-text)"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="danger"
                    loading={rejectMutation.isPending}
                    disabled={!rejectComment.trim()}
                    onClick={() => rejectMutation.mutate()}
                    className="flex-1"
                  >
                    Confirmer le rejet
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setShowRejectForm(false); setRejectComment(''); }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Lightbox ────────────────────────────────────────────── */}
      {lightboxIndex !== null && imageMedia[lightboxIndex] && (
        <div
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <img
            src={imageMedia[lightboxIndex].downloadUrl}
            alt="Photo plein écran"
            className="max-w-full max-h-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Compteur */}
          {imageMedia.length > 1 && (
            <span className="absolute top-4 left-1/2 -translate-x-1/2 text-xs font-medium text-white/90
                             bg-black/40 rounded-full px-3 py-1">
              {lightboxIndex + 1} / {imageMedia.length}
            </span>
          )}

          {/* Navigation */}
          {imageMedia.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); stepLightbox(-1); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/10 hover:bg-white/20
                           text-white flex items-center justify-center transition-colors"
                aria-label="Photo précédente"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); stepLightbox(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/10 hover:bg-white/20
                           text-white flex items-center justify-center transition-colors"
                aria-label="Photo suivante"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}

          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 size-9 rounded-full bg-white/10 hover:bg-white/20 text-white
                       flex items-center justify-center transition-colors"
            aria-label="Fermer"
          >
            <X className="size-5" />
          </button>
        </div>
      )}
    </>
  );
}

/** En-tête de section réutilisable du détail d'observation. */
function Section({
  icon, title, count, children,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="px-5 pt-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="flex items-center justify-center size-5 rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
        <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted">{title}</h4>
        {count != null && (
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-full bg-black/5 text-muted">
            {count}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}
