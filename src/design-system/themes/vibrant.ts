import type { AppTheme } from '../tokens';

export const vibrantTheme: AppTheme = {
  name: 'Vibrant',
  palette: {
    primary: '#f0abfc',
    background: '#09090f',
    surface: '#12121a',
    surfaceRaised: '#1a1a28',
    text: '#faf5ff',
    textMuted: '#a78bfa',
    border: '#2e1065',
  },
  typography: {
    displayFont: "'Space Grotesk', sans-serif",
    bodyFont: "'DM Sans', sans-serif",
    scale: 'comfortable',
  },
  radius: 'round',
  layout: 'card',
  background: { type: 'gradient', value: 'linear-gradient(135deg, #09090f 0%, #1a0533 100%)' },
};
