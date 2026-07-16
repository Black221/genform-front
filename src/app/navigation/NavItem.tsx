import { NavLink } from 'react-router';
import { cn } from '@/shared/lib/cn';

export interface NavItemConfig {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

interface Props extends NavItemConfig {
  collapsed?: boolean;
}

export function NavItem({ to, icon, label, end, collapsed }: Props) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
          'transition-all duration-(--dur)',
          isActive
            ? [
                'bg-primary-soft text-primary font-semibold',
                'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2',
                'before:h-5 before:w-0.5 before:rounded-pill before:bg-(--color-primary)',
              ]
            : 'text-muted hover:text-(--color-text) hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]',
          collapsed && 'justify-center px-2',
        )
      }
    >
      <span className="shrink-0 size-4.5 [&>svg]:size-full">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}
