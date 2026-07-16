import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router';
import { ChevronLeft, ChevronRight, FileText, Download, Check, WifiOff, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { FormExperience } from '@/features/form-renderer/FormExperience';
import { useOnlineStatus } from '@/features/offline/hooks/useOnlineStatus';
import {
  usePublishedForms,
  useCachedFormIds,
  useFormDetail,
  useDownloadForm,
  useInvalidateCapture,
} from '../hooks/useCaptureData';
import { associatePhotosToForm } from '../lib/instantPhotos';

export default function AssociatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const invalidate = useInvalidateCapture();
  const photoIds = (location.state as { photoIds?: string[] } | null)?.photoIds ?? [];
  const [formId, setFormId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const online = useOnlineStatus();
  const { data: forms = [], isLoading } = usePublishedForms();
  const { data: cachedIds = new Set<string>() } = useCachedFormIds();
  const { data: form, isError: formError } = useFormDetail(formId);
  const downloadForm = useDownloadForm();

  if (photoIds.length === 0) return <Navigate to="/capture" replace />;

  const handleDownload = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloading(id);
    try {
      await downloadForm(id);
    } finally {
      setDownloading(null);
    }
  };

  const handleSubmit = async (answers: Record<string, unknown>) => {
    await associatePhotosToForm({ formId: formId!, answers, photoIds });
    invalidate();
    navigate('/capture/history', { replace: true, state: { justSubmitted: true } });
  };

  // Étape 2 : remplir le formulaire
  if (formId) {
    if (formError) {
      return (
        <div className="p-6 flex flex-col items-center gap-4 text-center pt-16">
          <div className="size-14 rounded-2xl bg-(--color-danger-soft) flex items-center justify-center">
            <AlertCircle className="size-7 text-danger" />
          </div>
          <div>
            <p className="font-semibold text-(--color-text)">Formulaire non disponible</p>
            <p className="text-sm text-muted mt-1">Téléchargez-le d'abord quand vous avez du réseau.</p>
          </div>
          <button
            onClick={() => setFormId(null)}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Choisir un autre formulaire
          </button>
        </div>
      );
    }
    if (!form) {
      return (
        <div className="flex items-center justify-center min-h-40">
          <Loader2 className="size-6 animate-spin text-muted" />
        </div>
      );
    }
    return <FormExperience form={form} onSubmit={handleSubmit} />;
  }

  // Étape 1 : choisir un formulaire
  return (
    <div className="p-4 pb-24 space-y-5">
      <button
        onClick={() => navigate('/capture')}
        className="flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors"
      >
        <ChevronLeft className="size-4" /> Retour
      </button>

      <div>
        <h1 className="font-display text-lg font-bold text-(--color-text)">Choisir un formulaire</h1>
        <p className="text-sm text-muted mt-0.5">
          {photoIds.length} photo{photoIds.length !== 1 ? 's' : ''} à rattacher
        </p>
      </div>

      {!online && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gold-soft text-[#8a5a00] text-xs">
          <WifiOff className="size-4 shrink-0" />
          <span>Hors ligne — seuls les formulaires <strong>téléchargés</strong> sont disponibles.</span>
        </div>
      )}

      {online && (
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Download className="size-3.5" />
          Appuyez sur <Download className="size-3 inline" /> pour rendre un formulaire disponible hors ligne.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-surface border border-theme animate-pulse" />
          ))}
        </div>
      ) : forms.length === 0 ? (
        <div className="text-center py-16 text-muted text-sm">
          {online ? 'Aucun formulaire publié disponible.' : 'Aucun formulaire téléchargé. Connectez-vous pour en télécharger.'}
        </div>
      ) : (
        <div className="space-y-3">
          {forms.map((f) => {
            const isCached = cachedIds.has(f.id);
            const isDownloading = downloading === f.id;
            const unavailable = !online && !isCached;

            return (
              <button
                key={f.id}
                onClick={() => !unavailable && setFormId(f.id)}
                disabled={unavailable}
                className={cn(
                  'w-full flex items-center gap-3 p-4 text-left rounded-2xl border transition-all',
                  unavailable
                    ? 'bg-surface/60 border-theme opacity-50 cursor-not-allowed'
                    : 'bg-surface border-theme shadow-soft hover:border-primary hover:shadow-warm',
                )}
              >
                <span className={cn(
                  'flex items-center justify-center size-10 rounded-xl shrink-0',
                  unavailable ? 'bg-(--color-surface-raised) text-muted' : 'bg-primary-soft text-primary',
                )}>
                  <FileText className="size-5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold text-sm text-(--color-text) truncate">{f.title}</span>
                  {f.description && (
                    <span className="block text-xs text-muted mt-0.5 line-clamp-1">{f.description}</span>
                  )}
                  <span className="flex items-center gap-2 mt-1">
                    {f.questionCount != null && (
                      <span className="text-xs text-muted">
                        {f.questionCount} question{f.questionCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    {isCached && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-success">
                        <Check className="size-3" />Hors ligne
                      </span>
                    )}
                  </span>
                </span>

                {/* Bouton télécharger (visible seulement en ligne) */}
                {online && !isCached && (
                  <button
                    type="button"
                    onClick={(e) => handleDownload(f.id, e)}
                    disabled={isDownloading}
                    className="shrink-0 size-8 flex items-center justify-center rounded-lg
                               text-muted hover:text-primary hover:bg-primary-soft transition-colors"
                    aria-label="Télécharger pour hors ligne"
                  >
                    {isDownloading
                      ? <Loader2 className="size-4 animate-spin" />
                      : <Download className="size-4" />}
                  </button>
                )}

                {(!online || isCached) && <ChevronRight className="size-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
