import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

/** Hauteurs en px ou '50%' / '100%' */
const SNAPS = [96, 0.5, 1.0]; // fraction de la viewport pour les 2 derniers

interface Props {
  children: ReactNode;
}

/**
 * Sheet 3 crans mobile : 96 px (collapsed) / 50 % / plein écran.
 * Pas de dépendances supplémentaires — drag via pointermove.
 */
export function MobileBottomSheet({ children }: Props) {
  const [snapIndex, setSnapIndex] = useState(0);
  const dragStartY = useRef<number | null>(null);
  const dragStartSnap = useRef(0);

  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const heights = [SNAPS[0] as number, vh * 0.5, vh];
  const height = heights[snapIndex];

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartY.current = e.clientY;
    dragStartSnap.current = snapIndex;
  };

  useEffect(() => {
    const onUp = (e: PointerEvent) => {
      if (dragStartY.current === null) return;
      const dy = dragStartY.current - e.clientY;
      if (dy > 60) setSnapIndex((i) => Math.min(i + 1, SNAPS.length - 1));
      else if (dy < -60) setSnapIndex((i) => Math.max(i - 1, 0));
      dragStartY.current = null;
    };
    window.addEventListener('pointerup', onUp);
    return () => window.removeEventListener('pointerup', onUp);
  }, []);

  return (
    <div
      className={cn(
        'md:hidden fixed bottom-0 left-0 right-0 z-30',
        'bg-surface/95 backdrop-blur-md border-t border-border/50 rounded-t-2xl shadow-2xl',
        'transition-[height] duration-300 ease-out overflow-hidden flex flex-col',
      )}
      style={{ height }}
    >
      {/* Drag handle */}
      <div
        className="flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing shrink-0"
        onPointerDown={handlePointerDown}
      >
        <div className="w-9 h-1 rounded-full bg-border" />
      </div>

      <div className="overflow-y-auto flex-1">{children}</div>
    </div>
  );
}
