import type { AppTheme } from '../tokens';

/** Thème nuit — identité L'Observatoire éco-citoyen (sombre). */
export const terangaDarkTheme: AppTheme = {
  name: 'Observatoire Nuit',
  palette: {
    primary:      '#5B9BC4',
    background:   '#0E1A22',
    surface:      '#16242E',
    surfaceRaised:'#1E2F3A',
    text:         '#ECF1F4',
    textMuted:    '#9DB0BB',
    border:       '#2A3D49',
  },
  typography: {
    displayFont: "'Bricolage Grotesque', sans-serif",
    bodyFont:    "'Hanken Grotesk', sans-serif",
    scale:       'comfortable',
  },
  radius: 'soft',
  layout: 'card',
  background: { type: 'solid', value: '#0E1A22' },
};
