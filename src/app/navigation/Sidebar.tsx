import {
  LayoutDashboard, MapPin, Map, FileText, Users, LayoutTemplate,
  Palette, ShieldCheck, ChevronsLeft, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import type { UserRole } from '@/shared/types';
import { NavItem, type NavItemConfig } from './NavItem';
import { cn } from '@/shared/lib/cn';
import logoFull from '@/assets/logo-observatoire.jpg';
import logoSquare from '@/assets/logo-observatoire-carre.jpg';

interface NavSection {
  label?: string;
  items: (NavItemConfig & { minRole?: UserRole })[];
}

const ROLE_WEIGHT: Record<UserRole, number> = { OBSERVER: 0, COORDINATOR: 1, ADMIN: 2 };

function canAccess(minRole: UserRole | undefined, role: UserRole) {
  if (!minRole) return true;
  return ROLE_WEIGHT[role] >= ROLE_WEIGHT[minRole];
}

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { to: '/', icon: <LayoutDashboard size={18} />, label: 'Tableau de bord', end: true },
      { to: '/collect', icon: <MapPin size={18} />, label: 'Collecter' },
      { to: '/map', icon: <Map size={18} />, label: 'Carte' },
      { to: '/forms',     icon: <FileText size={18} />,        label: 'Formulaires', minRole: 'COORDINATOR' },
      { to: '/themes',    icon: <Palette size={18} />,         label: 'Thèmes',      minRole: 'COORDINATOR' },
      { to: '/templates', icon: <LayoutTemplate size={18} />,  label: 'Templates',   minRole: 'COORDINATOR' },
    ],
  },
  {
    label: 'Gestion',
    items: [
      { to: '/users', icon: <Users size={18} />, label: 'Observateurs', minRole: 'COORDINATOR' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/admin', icon: <ShieldCheck size={18} />, label: 'Communes & Rôles', minRole: 'ADMIN' },
    ],
  },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: Props) {
  const role = useAuth((s) => s.role);

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-surface border-r border-theme',
        'transition-all duration-200',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center h-16 px-4 border-b border-theme shrink-0',
          collapsed && 'justify-center px-2',
        )}
      >
        {collapsed ? (
          <img
            src={logoSquare}
            alt="L'Observatoire éco-citoyen"
            className="size-10 rounded-md object-cover shadow-soft"
          />
        ) : (
          <img
            src={logoFull}
            alt="L'Observatoire éco-citoyen"
            className="h-9 w-auto object-contain"
          />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
        {NAV_SECTIONS.map((section, si) => {
          const visible = section.items.filter((item) => canAccess(item.minRole, role));
          if (!visible.length) return null;
          return (
            <div key={si} className="space-y-0.5">
              {section.label && !collapsed && (
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted select-none">
                  {section.label}
                </p>
              )}
              {visible.map((item) => (
                <NavItem key={item.to} {...item} collapsed={collapsed} />
              ))}
            </div>
          );
        })}
      </nav>

      {/* Bouton réduction */}
      <div className="shrink-0 border-t border-theme p-2">
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Déplier la barre' : 'Réduire la barre'}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted',
            'hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] hover:text-(--color-text)',
            'transition-colors duration-(--dur)',
            collapsed && 'justify-center',
          )}
        >
          {collapsed
            ? <ChevronRight size={14} />
            : <>
                <ChevronsLeft size={14} />
                <span className="font-medium">Réduire</span>
              </>
          }
        </button>
      </div>
    </aside>
  );
}
