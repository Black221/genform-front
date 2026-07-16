import { useState } from 'react';
import { Layers, ChevronDown } from 'lucide-react';
import { FORM_CATEGORIES } from '@/shared/lib/formCategories';
import { cn } from '@/shared/lib/cn';

export function MapLegend() {
  const [open, setOpen] = useState(true);

  return (
    <div
      className="absolute bottom-3 right-3 z-10 w-44
                 bg-white/75 backdrop-blur-xl rounded-2xl border border-white/60
                 shadow-[0_10px_40px_-12px_rgba(21,37,46,0.4)] overflow-hidden"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-display
                   font-semibold text-(--color-text) hover:bg-black/[0.03] transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Layers className="size-3.5 text-primary" />
          Catégories
        </span>
        <ChevronDown className={cn('size-3.5 text-muted transition-transform', !open && '-rotate-90')} />
      </button>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <ul className="overflow-hidden px-3 pb-2.5 space-y-1.5">
          {FORM_CATEGORIES.map(({ value, label, color }) => (
            <li key={value} className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full shrink-0 ring-2 ring-white"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-muted">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
