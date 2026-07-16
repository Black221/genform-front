import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';

export interface Crumb {
  label: string;
  to?: string;
}

interface Props {
  title: string;
  crumbs?: Crumb[];
  action?: ReactNode;
}

export function PageHeader({ title, crumbs, action }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        {crumbs && crumbs.length > 0 && (
          <nav className="flex items-center gap-1 mb-1">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={12} className="text-muted" />}
                {c.to ? (
                  <Link to={c.to} className="text-xs text-muted hover:text-(--color-text) transition-colors">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-xs text-muted">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold text-(--color-text)">{title}</h1>
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
}
