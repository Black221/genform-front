import { useEffect } from 'react';
import { cn } from '@/shared/lib/cn';
import { Sidebar } from './Sidebar';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/40 transition-opacity duration-200',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed left-0 top-0 bottom-0 z-40 transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        role="dialog"
        aria-modal
        aria-label="Navigation"
      >
        <Sidebar collapsed={false} onToggle={onClose} />
      </div>
    </>
  );
}
