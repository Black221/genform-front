import { useState } from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { responsesApi } from '../api/responsesApi';
import type { ResponseStatus } from '@/shared/types';

interface Props {
  formId: string;
  responseId: string;
  currentStatus: ResponseStatus;
}

export function ValidationActions({ formId, responseId, currentStatus }: Props) {
  const qc = useQueryClient();
  const [rejectComment, setRejectComment] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const onSuccess = () => {
    qc.invalidateQueries({ queryKey: ['response', formId, responseId] });
    qc.invalidateQueries({ queryKey: ['responses', formId] });
  };

  const validateMutation = useMutation({
    mutationFn: () => responsesApi.validate(formId, responseId),
    onSuccess,
  });

  const rejectMutation = useMutation({
    mutationFn: (comment: string) => responsesApi.reject(formId, responseId, comment),
    onSuccess: () => { onSuccess(); setShowRejectForm(false); setRejectComment(''); },
  });

  if (currentStatus === 'VALIDATED') {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600">
        <CheckCircle size={14} />
        <span>Validée</span>
      </div>
    );
  }

  if (currentStatus === 'REJECTED') {
    return (
      <button
        type="button"
        disabled={validateMutation.isPending}
        onClick={() => validateMutation.mutate()}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-theme border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
      >
        {validateMutation.isPending ? <Loader size={12} className="animate-spin" /> : <CheckCircle size={12} />}
        Valider quand même
      </button>
    );
  }

  // PENDING
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {/* Valider */}
        <button
          type="button"
          disabled={validateMutation.isPending}
          onClick={() => validateMutation.mutate()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-theme bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {validateMutation.isPending ? <Loader size={14} className="animate-spin" /> : <CheckCircle size={14} />}
          Valider
        </button>

        {/* Rejeter */}
        {!showRejectForm && (
          <button
            type="button"
            onClick={() => setShowRejectForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-theme border border-red-500/30 text-red-600 hover:bg-red-500/10 transition-colors"
          >
            <XCircle size={14} />
            Rejeter
          </button>
        )}
      </div>

      {showRejectForm && (
        <div className="space-y-2">
          <textarea
            rows={3}
            placeholder="Motif du rejet (obligatoire)…"
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            className="w-full rounded-theme border border-theme px-3 py-2 text-sm text-(--color-text) bg-surface focus:outline-none focus:ring-2 focus:ring-red-400/40 resize-none"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!rejectComment.trim() || rejectMutation.isPending}
              onClick={() => rejectMutation.mutate(rejectComment.trim())}
              className="px-4 py-1.5 text-sm font-semibold rounded-theme bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {rejectMutation.isPending ? 'Rejet…' : 'Confirmer le rejet'}
            </button>
            <button
              type="button"
              onClick={() => { setShowRejectForm(false); setRejectComment(''); }}
              className="px-3 py-1.5 text-sm text-muted hover:text-(--color-text) transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
