export interface AppTheme {
  name: string;
  palette: {
    primary: string;
    background: string;
    surface: string;
    surfaceRaised: string;
    text: string;
    textMuted: string;
    border: string;
  };
  typography: {
    displayFont: string;
    bodyFont: string;
    scale: 'compact' | 'comfortable' | 'spacious';
  };
  radius: 'sharp' | 'soft' | 'round';
  layout: 'card' | 'single-question' | 'classic';
  background: { type: 'solid' | 'gradient' | 'pattern'; value: string };
}

export const radiusMap: Record<AppTheme['radius'], string> = {
  sharp: '4px',
  soft: '10px',
  round: '20px',
};

export const scaleMap: Record<AppTheme['typography']['scale'], string> = {
  compact: '0.875',
  comfortable: '1',
  spacious: '1.125',
};
