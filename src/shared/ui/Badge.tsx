import { cn } from '@/shared/lib/cn';

type Variant = 'default' | 'primary' | 'accent' | 'danger' | 'success' |
               'air' | 'eau' | 'sols' | 'sante' | 'inondation' | 'pollution' | 'urbanisation' | 'autre';

const variants: Record<Variant, string> = {
  default:       'bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] text-(--color-text-muted)',
  primary:       'bg-(--color-primary-soft) text-(--color-primary)',
  accent:        'bg-(--color-accent-soft) text-(--color-accent)',
  danger:        'bg-(--color-danger-soft) text-(--color-danger)',
  success:       'bg-(--color-success-soft) text-(--color-success)',
  air:           'bg-[color-mix(in_srgb,#4C9BE0_12%,transparent)] text-[#4C9BE0]',
  eau:           'bg-[color-mix(in_srgb,#159AAE_12%,transparent)] text-[#159AAE]',
  sols:          'bg-[color-mix(in_srgb,#B07B3E_12%,transparent)] text-[#B07B3E]',
  sante:         'bg-[color-mix(in_srgb,#D6477E_12%,transparent)] text-[#D6477E]',
  inondation:    'bg-[color-mix(in_srgb,#3B6FB0_12%,transparent)] text-[#3B6FB0]',
  pollution:     'bg-[color-mix(in_srgb,#8B6FB0_12%,transparent)] text-[#8B6FB0]',
  urbanisation:  'bg-[color-mix(in_srgb,#C2603C_12%,transparent)] text-[#C2603C]',
  autre:         'bg-[color-mix(in_srgb,#6B7A77_12%,transparent)] text-[#6B7A77]',
};

interface BadgeProps {
  variant?: Variant;
  /** Affiche le contenu en police mono (pour compteurs) */
  mono?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = 'default', mono = false, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-(--radius-pill) px-2.5 py-0.5 text-xs font-medium',
        mono && 'font-mono',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
