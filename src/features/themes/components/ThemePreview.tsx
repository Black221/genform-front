import { useRef, useEffect } from 'react';
import { applyTheme } from '@/design-system/ThemeProvider';
import type { AppTheme, PublicForm } from '@/shared/types';
import { FormExperience } from '@/features/form-renderer/FormExperience';

const DEMO_FORM: PublicForm = {
  id: '__demo__',
  slug: '__demo__',
  title: 'Formulaire de démonstration',
  description: 'Aperçu de votre thème en temps réel.',
  presentation: 'onepage',
  theme: {},
  cover: {},
  ending: {},
  ogTitle: 'Démo',
  sections: [
    {
      id: 'sec-1',
      position: 0,
      items: [
        { kind: 'QUESTION', id: 'q1', position: 0, label: 'Votre prénom', type: 'TEXT', required: true },
        { kind: 'QUESTION', id: 'q2', position: 1, label: 'Satisfaction globale', type: 'SCALE', required: false, min: 1, max: 5 },
        { kind: 'QUESTION', id: 'q3', position: 2, label: 'Comment nous avez-vous connu ?', type: 'SINGLE_CHOICE', required: false, options: ['Réseaux sociaux', 'Bouche à oreille', 'Publicité'] },
      ],
    },
  ],
};

interface Props {
  theme: AppTheme;
}

export function ThemePreview({ theme }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    applyTheme(theme, containerRef.current as unknown as HTMLElement);
    const el = containerRef.current;
    el.style.setProperty('--color-primary', theme.palette.primary);
    el.style.setProperty('--color-bg', theme.palette.background);
    el.style.setProperty('--color-surface', theme.palette.surface);
    el.style.setProperty('--color-surface-raised', theme.palette.surfaceRaised);
    el.style.setProperty('--color-text', theme.palette.text);
    el.style.setProperty('--color-text-muted', theme.palette.textMuted);
    el.style.setProperty('--color-border', theme.palette.border);
    el.style.setProperty('--font-display', theme.typography.displayFont);
    el.style.setProperty('--font-body', theme.typography.bodyFont);
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto rounded-theme border border-theme"
      style={{ background: theme.palette.background, color: theme.palette.text, fontFamily: theme.typography.bodyFont }}
    >
      <div
        className="px-2 py-2 text-xs text-center"
        style={{ borderBottom: `1px solid ${theme.palette.border}`, background: theme.palette.surface }}
      >
        Aperçu thème
      </div>
      <FormExperience form={DEMO_FORM} previewMode />
    </div>
  );
}
