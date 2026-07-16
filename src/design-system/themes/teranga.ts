import type { AppTheme } from '../tokens';

/** Thème de l'application — identité L'Observatoire éco-citoyen (clair). */
export const terangaTheme: AppTheme = {
  name: 'Observatoire',
  palette: {
    primary:      '#1D4E70',
    background:   '#F4F6F7',
    surface:      '#FFFFFF',
    surfaceRaised:'#EAEFF2',
    text:         '#16252E',
    textMuted:    '#5A6B73',
    border:       '#D9E0E4',
  },
  typography: {
    displayFont: "'Bricolage Grotesque', sans-serif",
    bodyFont:    "'Hanken Grotesk', sans-serif",
    scale:       'comfortable',
  },
  radius: 'soft',
  layout: 'card',
  background: { type: 'solid', value: '#F4F6F7' },
};
