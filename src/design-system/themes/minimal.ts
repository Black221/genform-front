import type { AppTheme } from '../tokens';

export const minimalTheme: AppTheme = {
  name: 'Minimal',
  palette: {
    primary: '#18181b',
    background: '#ffffff',
    surface: '#fafafa',
    surfaceRaised: '#f4f4f5',
    text: '#09090b',
    textMuted: '#71717a',
    border: '#e4e4e7',
  },
  typography: {
    displayFont: "'Space Grotesk', sans-serif",
    bodyFont: "'DM Sans', sans-serif",
    scale: 'spacious',
  },
  radius: 'sharp',
  layout: 'classic',
  background: { type: 'solid', value: '#ffffff' },
};
