import axios from 'axios';
import { useParams, Navigate } from 'react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { publicFormApi } from '../api/publicFormApi';
import type { FileUploadEntry, GeoData } from '../api/publicFormApi';
import { useGeoCapture } from '../hooks/useGeoCapture';
import { FormUnavailableScreen } from '../components/FormUnavailableScreen';
import { FormNotFoundScreen } from '../components/FormNotFoundScreen';
import { FormExperience } from '@/features/form-renderer/FormExperience';
import { useAuth } from '@/features/auth/useAuth';
import type { AppTheme } from '@/shared/types';
import { applyTheme } from '@/design-system/ThemeProvider';

function isAxios410(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 410;
}

export default function PublicFormPage() {
  const { slug } = useParams<{ slug: string }>();
  const isAuthenticated = useAuth((s) => s.isAuthenticated);

  const { data: form, isLoading, isError, error } = useQuery({
    queryKey: ['public-form', slug],
    queryFn: () => publicFormApi.getBySlug(slug!),
    enabled: !!slug,
    retry: (_, err) => !isAxios410(err),
  });

  // Capture GPS en arrière-plan dès que le formulaire le demande
  const { geo: capturedGeo, loading: geoLoading } = useGeoCapture(form?.geotagOnSubmit ?? false);

  // Applique le thème du formulaire au document
  useEffect(() => {
    if (!form?.theme) return;
    const theme = form.theme as unknown as AppTheme;
    if (!theme.palette) return;
    applyTheme(theme, document.documentElement);
  }, [form?.theme]);

  // Open Graph
  useEffect(() => {
    if (!form) return;
    const setMeta = (property: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    document.title = form.ogTitle || form.title;
    setMeta('og:title', form.ogTitle || form.title);
    if (form.description) setMeta('og:description', form.description);
    if (form.ogImage) setMeta('og:image', form.ogImage);
    setMeta('og:url', window.location.href);
  }, [form]);

  const submitMutation = useMutation({
    mutationFn: async (answers: Record<string, unknown>) => {
      const fileEntries: FileUploadEntry[] = [];
      const cleanAnswers: Record<string, unknown> = {};

      for (const [questionId, value] of Object.entries(answers)) {
        if (Array.isArray(value) && value.length > 0 && value[0]?.file instanceof File) {
          for (const entry of value as { file: File }[]) {
            fileEntries.push({ questionId, file: entry.file });
          }
          cleanAnswers[questionId] = (value as { name: string; size: number }[]).map(
            ({ name, size }) => ({ name, size }),
          );
        } else {
          cleanAnswers[questionId] = value;
        }
      }

      // Priorité : réponse LOCATION explicite > géolocalisation capturée automatiquement
      const geoFromAnswer = extractLocationAnswer(cleanAnswers);
      const geo: GeoData | undefined = geoFromAnswer ?? capturedGeo ?? undefined;

      await publicFormApi.submit(form!.id, cleanAnswers, fileEntries, geo);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--color-bg)' }}>
        <div
          className="size-12 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }}
        />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Chargement du formulaire…</p>
      </div>
    );
  }

  if (isError && isAxios410(error)) {
    return <FormUnavailableScreen />;
  }

  if (isError || !form) {
    return <FormNotFoundScreen />;
  }

  if (form.access === 'OBSERVERS' && !isAuthenticated) {
    return <Navigate to={`/login?redirect=/f/${slug}`} replace />;
  }

  return (
    <FormExperience
      form={form}
      onSubmit={(answers) => submitMutation.mutateAsync(answers)}
      geoLoading={geoLoading}
    />
  );
}

/** Extrait la première valeur de type LocationValue présente dans les réponses */
function extractLocationAnswer(answers: Record<string, unknown>): GeoData | undefined {
  for (const value of Object.values(answers)) {
    if (
      value !== null &&
      typeof value === 'object' &&
      'lat' in value &&
      'lng' in value &&
      'source' in value
    ) {
      const loc = value as { lat: number; lng: number; source: 'GPS' | 'MANUAL' };
      return { lat: loc.lat, lng: loc.lng, locationSource: loc.source };
    }
  }
  return undefined;
}
