import { cn } from '@/shared/lib/cn';

interface SkeletonProps {
  className?: string;
  lines?: number;
  count?: number;
}

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-(--radius-md) bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]',
        'animate-pulse',
        className,
      )}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <SkeletonPulse className={className} />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-(--radius-lg) border border-theme bg-surface p-5 space-y-3', className)}>
      <SkeletonPulse className="h-4 w-2/3" />
      <SkeletonPulse className="h-3 w-full" />
      <SkeletonPulse className="h-3 w-4/5" />
    </div>
  );
}

export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 py-3', className)}>
      <SkeletonPulse className="size-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <SkeletonPulse className="h-3.5 w-48" />
        <SkeletonPulse className="h-3 w-32" />
      </div>
    </div>
  );
}

/** Grille de n cartes skeleton */
export function SkeletonGrid({ count = 3, className }: SkeletonProps) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
