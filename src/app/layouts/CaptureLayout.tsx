import { Outlet, NavLink, Link } from 'react-router';
import { Camera, History } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { SyncIndicator } from '@/features/offline/components/SyncIndicator';
import logoSquare from '@/assets/logo-observatoire-carre.jpg';

const TABS = [
  { to: '/capture',         icon: Camera,  label: 'Capturer',     end: true },
  { to: '/capture/history', icon: History, label: 'Mes réponses', end: false },
];

export function CaptureLayout() {
  return (
    <div className="flex flex-col h-dvh bg-app">
      {/* Header */}
      <header className="h-14 shrink-0 flex items-center gap-3 px-4 bg-surface border-b border-theme">
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          <img src={logoSquare} alt="L'Observatoire éco-citoyen" className="size-8 rounded-md object-cover" />
          <span className="font-display font-bold text-sm text-(--color-text) truncate">Signaler</span>
        </Link>
        <div className="ml-auto">
          <SyncIndicator />
        </div>
      </header>

      {/* Contenu */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* Onglets bas */}
      <nav className="shrink-0 grid grid-cols-2 border-t border-theme bg-surface">
        {TABS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted hover:text-(--color-text)',
              )
            }
          >
            <Icon className="size-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
