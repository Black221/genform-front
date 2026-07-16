import type { AppTheme } from '../tokens';

export const defaultTheme: AppTheme = {
  name: 'Nuit',
  palette: {
    primary: '#818cf8',
    background: '#0d0d12',
    surface: '#17171f',
    surfaceRaised: '#1f1f2e',
    text: '#f0f0f5',
    textMuted: '#8b8b9e',
    border: '#2a2a3a',
  },
  typography: {
    displayFont: "'Space Grotesk', sans-serif",
    bodyFont: "'DM Sans', sans-serif",
    scale: 'comfortable',
  },
  radius: 'soft',
  layout: 'card',
  background: { type: 'solid', value: '#0d0d12' },
};
