import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, Eye, EyeOff, Globe, Lock } from 'lucide-react';
import { themesApi } from '../api/themesApi';
import type { CreateThemePayload } from '../api/themesApi';
import { ThemeEditor } from '../components/ThemeEditor';
import { ThemePreview } from '../components/ThemePreview';
import { useToast } from '@/shared/ui/Toast';
import { terangaTheme } from '@/design-system/themes/teranga';
import type { AppTheme } from '@/shared/types';

function themeToAppTheme(t: { name: string; palette: AppTheme['palette']; typography: AppTheme['typography']; radius: AppTheme['radius']; layout: AppTheme['layout']; background: AppTheme['background'] }): AppTheme {
  return {
    name: t.name,
    palette: t.palette,
    typography: t.typography,
    radius: t.radius,
    layout: t.layout,
    background: t.background,
  };
}

export default function ThemeEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();
  const isNew = !id;

  const { data: existing, isLoading } = useQuery({
    queryKey: ['theme', id],
    queryFn: () => themesApi.get(id!),
    enabled: !!id,
  });

  const [appTheme, setAppTheme] = useState<AppTheme>(terangaTheme);
  const [isPublic, setIsPublic] = useState(false);
  const [isSystem, setIsSystem] = useState(false);
  const [showPreview, setPreview] = useState(true);

  useEffect(() => {
    if (!existing) return;
    setAppTheme(themeToAppTheme(existing));
    setIsPublic(existing.isPublic);
    setIsSystem(existing.isSystem);
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: CreateThemePayload = {
        name: appTheme.name,
        palette: appTheme.palette,
        typography: appTheme.typography,
        radius: appTheme.radius,
        layout: appTheme.layout,
        background: appTheme.background,
        isPublic,
      };
      return isNew ? themesApi.create(payload) : themesApi.update(id!, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['themes'] });
      toast(isNew ? 'Thème créé avec succès' : 'Modifications enregistrées', 'success');
      navigate('/themes');
    },
    onError: () => toast('Erreur lors de la sauvegarde', 'error'),
  });

  if (!isNew && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F3F6F4' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#0B6E63] border-t-transparent animate-spin" />
          <span className="text-sm" style={{ color: '#576A65' }}>Chargement…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F3F6F4', fontFamily: "'Hanken Grotesk', sans-serif" }}>

      {/* Header */}
      <header
        className="sticky top-0 z-40 px-5 h-14 flex items-center gap-3"
        style={{ background: 'white', borderBottom: '1px solid #D8E0DD', boxShadow: '0 1px 2px rgba(21,33,30,.05)' }}
      >
        <button
          onClick={() => navigate('/themes')}
          className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-80"
          style={{ color: '#576A65' }}
        >
          <ArrowLeft size={15} />
          <span>Thèmes</span>
        </button>

        <div className="w-px h-4" style={{ background: '#D8E0DD' }} />

        <input
          value={appTheme.name}
          readOnly={isSystem}
          onChange={(e) => setAppTheme((t) => ({ ...t, name: e.target.value }))}
          className="flex-1 bg-transparent text-sm font-semibold focus:outline-none"
          style={{ color: '#15211E', fontFamily: "'Bricolage Grotesque', sans-serif" }}
          placeholder="Nom du thème"
        />

        {isSystem ? (
          <span
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: '#ECF1EF', color: '#576A65', border: '1px solid #D8E0DD' }}
          >
            Lecture seule
          </span>
        ) : (
          <>
            <button
              onClick={() => setIsPublic((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: isPublic ? '#DCEFEC' : '#ECF1EF',
                color:      isPublic ? '#0B6E63' : '#576A65',
                border:     `1px solid ${isPublic ? '#0B6E63' : '#D8E0DD'}`,
              }}
            >
              {isPublic ? <Globe size={12} /> : <Lock size={12} />}
              {isPublic ? 'Public' : 'Privé'}
            </button>

            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: '#0B6E63' }}
            >
              {saveMutation.isPending ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <Check size={14} />
              )}
              {isNew ? 'Créer' : 'Enregistrer'}
            </button>
          </>
        )}

        <button
          onClick={() => setPreview((v) => !v)}
          className="p-2 rounded-lg transition-colors"
          style={{ background: '#ECF1EF', color: showPreview ? '#0B6E63' : '#576A65' }}
          title={showPreview ? "Masquer l'aperçu" : "Afficher l'aperçu"}
        >
          {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left — ThemeEditor */}
        <aside
          className="overflow-y-auto"
          style={{
            width: showPreview ? 420 : '100%',
            background: 'white',
            borderRight: showPreview ? '1px solid #D8E0DD' : 'none',
            flexShrink: 0,
          }}
        >
          <div className="px-6 py-5">
            <ThemeEditor theme={appTheme} onChange={setAppTheme} />
          </div>
        </aside>

        {/* Right — Live preview */}
        {showPreview && (
          <main className="flex-1 overflow-auto p-6" style={{ background: '#ECF1EF' }}>
            <ThemePreview theme={appTheme} />
          </main>
        )}
      </div>
    </div>
  );
}
