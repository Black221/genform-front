import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { MapPin, FileText, Users, Map, ArrowRight } from 'lucide-react';
import { statisticsApi } from '@/features/statistics/api/statisticsApi';
import { useAuth } from '@/features/auth/useAuth';

export default function DashboardPage() {
  const navigate = useNavigate();
  const role = useAuth((s) => s.role);
  const communes = useAuth((s) => s.communes);

  const { data: observatory } = useQuery({
    queryKey: ['observatory-stats'],
    queryFn: statisticsApi.getObservatory,
    staleTime: 60_000,
  });

  const isCoordinatorOrAdmin = role === 'COORDINATOR' || role === 'ADMIN';

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-(--color-text)">Observatoire Citoyen</h1>
        <p className="text-sm text-muted mt-1">
          {communes.length > 0
            ? `Communes : ${communes.map((c) => c.name).join(', ')}`
            : "Vue d'ensemble"}
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          icon={<MapPin size={20} />}
          label="Observations"
          value={observatory?.totalObservations ?? '—'}
          color="primary"
        />
        <KpiCard
          icon={<FileText size={20} />}
          label="Formulaires publiés"
          value={observatory?.publishedForms ?? '—'}
          color="green"
        />
        <KpiCard
          icon={<Users size={20} />}
          label="Observateurs actifs"
          value={observatory?.activeObservers ?? '—'}
          color="teranga"
        />
      </div>

      {/* Ventilation par commune */}
      {observatory?.byCommune && Object.keys(observatory.byCommune).length > 0 && (
        <section className="bg-surface rounded-theme border border-theme p-6">
          <h2 className="font-display font-semibold text-(--color-text) mb-4">Observations par commune</h2>
          <div className="space-y-2">
            {Object.entries(observatory.byCommune)
              .sort(([, a], [, b]) => b - a)
              .map(([commune, count]) => (
                <CommuneBar key={commune} commune={commune} count={count} total={observatory.totalObservations} />
              ))}
          </div>
        </section>
      )}

      {/* Raccourcis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ShortcutCard
          icon={<MapPin size={18} />}
          title="Collecter une observation"
          description="Remplir un formulaire de terrain"
          onClick={() => navigate('/collect')}
          primary
        />
        <ShortcutCard
          icon={<Map size={18} />}
          title="Voir la carte"
          description="Visualiser les observations géolocalisées"
          onClick={() => navigate('/map')}
        />
        {isCoordinatorOrAdmin && (
          <ShortcutCard
            icon={<FileText size={18} />}
            title="Mes formulaires"
            description="Créer et gérer les formulaires"
            onClick={() => navigate('/forms')}
          />
        )}
        {isCoordinatorOrAdmin && (
          <ShortcutCard
            icon={<Users size={18} />}
            title="Observateurs"
            description="Inviter et gérer les membres"
            onClick={() => navigate('/users')}
          />
        )}
      </div>
    </div>
  );
}

// ── KPI card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: 'primary' | 'green' | 'teranga';
}) {
  const bg = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-(--brand-green-light) text-(--brand-green-dark)',
    teranga: 'bg-(--brand-teranga-light) text-teranga',
  }[color];

  return (
    <div className="bg-surface rounded-theme border border-theme p-5 flex flex-col gap-3">
      <div className={`size-9 rounded-md flex items-center justify-center ${bg}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-(--color-text)">{value}</p>
        <p className="text-xs text-muted mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Commune bar ───────────────────────────────────────────────────────────────
function CommuneBar({ commune, count, total }: { commune: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-(--color-text) w-32 truncate shrink-0">{commune}</span>
      <div className="flex-1 h-2 rounded-full bg-theme overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted w-8 text-right">{count}</span>
    </div>
  );
}

// ── Shortcut card ─────────────────────────────────────────────────────────────
function ShortcutCard({ icon, title, description, onClick, primary }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex items-center gap-4 p-5 rounded-theme border text-left transition-all group',
        primary
          ? 'border-primary/30 bg-primary/5 hover:bg-primary/10'
          : 'border-theme bg-surface hover:border-primary/30',
      ].join(' ')}
    >
      <div className={`size-9 rounded-md flex items-center justify-center shrink-0 ${primary ? 'bg-primary text-white' : 'bg-theme text-(--color-text)'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-(--color-text) truncate">{title}</p>
        <p className="text-xs text-muted mt-0.5 truncate">{description}</p>
      </div>
      <ArrowRight size={16} className="text-muted shrink-0 group-hover:text-primary transition-colors" />
    </button>
  );
}
