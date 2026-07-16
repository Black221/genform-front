import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  distribution: Record<string, number>;
  average?: number;
  median?: number;
  fillRate: number;
}

export function ScaleChart({ distribution, average, median, fillRate }: Props) {
  const data = Object.entries(distribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => Number(a.name) - Number(b.name));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-6 text-sm">
        {average !== undefined && (
          <span className="text-muted">Moyenne : <strong className="text-(--color-text)">{average.toFixed(1)}</strong></span>
        )}
        {median !== undefined && (
          <span className="text-muted">Médiane : <strong className="text-(--color-text)">{median.toFixed(1)}</strong></span>
        )}
        <span className="text-muted">Taux : <strong className="text-(--color-text)">{Math.round(fillRate * 100)}%</strong></span>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
            formatter={(v) => [Number(v), 'Réponses']}
          />
          <Bar dataKey="value" fill="var(--color-primary)" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
