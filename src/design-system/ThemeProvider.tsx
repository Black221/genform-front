import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { type AppTheme, radiusMap } from './tokens';
import { defaultTheme } from './themes/default';

interface ThemeContextValue {
  theme: AppTheme;
  applyTheme: (theme: AppTheme, root?: HTMLElement) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: defaultTheme,
  applyTheme: () => {},
});

export function applyTheme(theme: AppTheme, root: HTMLElement = document.documentElement) {
  root.style.setProperty('--color-primary', theme.palette.primary);
  root.style.setProperty('--color-bg', theme.palette.background);
  root.style.setProperty('--color-surface', theme.palette.surface);
  root.style.setProperty('--color-surface-raised', theme.palette.surfaceRaised);
  root.style.setProperty('--color-text', theme.palette.text);
  root.style.setProperty('--color-text-muted', theme.palette.textMuted);
  root.style.setProperty('--color-border', theme.palette.border);
  root.style.setProperty('--font-display', theme.typography.displayFont);
  root.style.setProperty('--font-body', theme.typography.bodyFont);
  root.style.setProperty('--font-mono', "'Geist Mono', monospace");
  root.style.setProperty('--radius-theme', radiusMap[theme.radius]);
}

interface Props {
  theme?: AppTheme;
  /** Si true, scope le thème au conteneur (aperçu builder) sans affecter le reste */
  scoped?: boolean;
  children: ReactNode;
}

export function ThemeProvider({ theme = defaultTheme, scoped = false, children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = scoped ? containerRef.current ?? document.documentElement : document.documentElement;
    applyTheme(theme, target);
  }, [theme, scoped]);

  if (scoped) {
    return (
      <ThemeContext.Provider value={{ theme, applyTheme }}>
        <div ref={containerRef} style={{ fontFamily: 'var(--font-body)' }}>
          {children}
        </div>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
