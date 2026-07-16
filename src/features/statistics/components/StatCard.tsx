interface Props {
  label: string;
  value: string | number;
  sub?: string;
}

export function StatCard({ label, value, sub }: Props) {
  return (
    <div className="bg-surface rounded-theme border border-theme p-5 flex flex-col gap-1">
      <p className="text-xs font-medium text-muted uppercase tracking-wide">{label}</p>
      <p className="font-display text-3xl font-bold text-(--color-text)">{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  );
}
