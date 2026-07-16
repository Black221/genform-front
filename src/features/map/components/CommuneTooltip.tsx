import { forwardRef, useImperativeHandle, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface CommuneTooltipHandle {
  show: (x: number, y: number, name: string, count: number) => void;
  hide: () => void;
}

/**
 * Tooltip suiveur du survol de commune. Manipulé imperativement (transform +
 * textContent) pour éviter tout setState React sur mousemove (60 fps).
 */
export const CommuneTooltip = forwardRef<CommuneTooltipHandle>(function CommuneTooltip(_, ref) {
  const elRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useImperativeHandle(ref, () => ({
    show(x, y, name, count) {
      const el = elRef.current;
      if (!el) return;
      el.style.transform = `translate(${x + 14}px, ${y + 14}px)`;
      el.style.opacity = '1';
      if (nameRef.current) nameRef.current.textContent = name;
      if (countRef.current) {
        countRef.current.textContent = `${count} observation${count !== 1 ? 's' : ''}`;
      }
    },
    hide() {
      if (elRef.current) elRef.current.style.opacity = '0';
    },
  }), []);

  return createPortal(
    <div
      ref={elRef}
      className="fixed top-0 left-0 z-50 pointer-events-none opacity-0 transition-opacity duration-100
                 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-theme"
    >
      <span ref={nameRef} className="block text-sm font-semibold text-(--color-text)" />
      <span ref={countRef} className="block text-xs text-muted" />
    </div>,
    document.body,
  );
});
