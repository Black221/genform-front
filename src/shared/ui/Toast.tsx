import * as ToastPrimitive from '@radix-ui/react-toast';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface ToastData {
  id: number;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  toast: (message: string, type?: ToastData['type']) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons = {
  success: <CheckCircle size={16} className="text-success" />,
  error:   <AlertCircle size={16} className="text-danger" />,
  info:    <Info size={16} className="text-primary" />,
};

const accents: Record<NonNullable<ToastData['type']>, string> = {
  success: 'border-l-[var(--color-success)]',
  error:   'border-l-[var(--color-danger)]',
  info:    'border-l-[var(--color-primary)]',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const toast = (message: string, type: ToastData['type'] = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => {
          const kind = t.type ?? 'info';
          return (
            <ToastPrimitive.Root
              key={t.id}
              className={cn(
                'flex items-center gap-3 pl-4 pr-5 py-3',
                'rounded-(--radius-lg) shadow-(--shadow-lift)',
                'bg-surface border border-theme border-l-4',
                'animate-slide-in-right',
                accents[kind],
              )}
            >
              <span className="shrink-0">{icons[kind]}</span>
              <ToastPrimitive.Description className="text-sm font-medium text-(--color-text)">
                {t.message}
              </ToastPrimitive.Description>
            </ToastPrimitive.Root>
          );
        })}
        <ToastPrimitive.Viewport className="fixed bottom-6 right-6 flex flex-col gap-2 z-50 max-w-sm" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
