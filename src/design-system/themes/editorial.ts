import type { AppTheme } from '../tokens';

export const editorialTheme: AppTheme = {
  name: 'Éditorial',
  palette: {
    primary: '#c2410c',
    background: '#fdf6e3',
    surface: '#fef9f0',
    surfaceRaised: '#fff8e7',
    text: '#1c1917',
    textMuted: '#78716c',
    border: '#d6cfc4',
  },
  typography: {
    displayFont: "'Space Grotesk', sans-serif",
    bodyFont: "'DM Sans', sans-serif",
    scale: 'comfortable',
  },
  radius: 'soft',
  layout: 'card',
  background: { type: 'solid', value: '#fdf6e3' },
};
