import { Outlet, useNavigate } from 'react-router';
import { cn } from '@/shared/lib/cn';

function IconBack() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="size-5"><polyline points="15 18 9 12 15 6"/></svg>;
}

interface Props {
  title?: string;
}

export function CollectionLayout({ title }: Props) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-app">
      <header className="h-14 shrink-0 flex items-center gap-3 px-4 bg-white border-b border-theme">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg hover:bg-primary/10 text-muted hover:text-primary transition-colors"
          aria-label="Retour"
        >
          <IconBack />
        </button>
        {title && (
          <h1 className="text-base font-semibold text-(--color-text) truncate">{title}</h1>
        )}
        {/* Sync indicator slot — filled in Étape 5 */}
        <div className="ml-auto" id="sync-indicator-slot" />
      </header>

      <main className={cn('flex-1 overflow-y-auto')}>
        <Outlet />
      </main>
    </div>
  );
}
