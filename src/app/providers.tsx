import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';
import { queryClient } from './queryClient';
import { ThemeProvider } from '@/design-system/ThemeProvider';
import { ToastProvider } from '@/shared/ui/Toast';
import { terangaTheme } from '@/design-system/themes/teranga';
import { terangaDarkTheme } from '@/design-system/themes/terangaDark';
import { useAppStore } from '@/shared/lib/useAppStore';
import { initSyncEngine } from '@/features/offline/syncEngine';

function ThemedApp({ children }: { children: ReactNode }) {
  const darkMode = useAppStore((s) => s.darkMode);

  useEffect(() => {
    initSyncEngine();
  }, []);

  return (
    <ThemeProvider theme={darkMode ? terangaDarkTheme : terangaTheme}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ThemeProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemedApp>
        {children}
      </ThemedApp>
    </QueryClientProvider>
  );
}
