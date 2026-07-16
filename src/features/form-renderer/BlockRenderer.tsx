import { Suspense } from 'react';
import { blockRegistry } from './blockRegistry';
import type { ContentBlockType } from '@/shared/types';

interface Props {
  type: ContentBlockType;
  content: Record<string, unknown>;
}

export default function BlockRenderer({ type, content }: Props) {
  const Block = blockRegistry[type];
  if (!Block) return null;
  return (
    <Suspense fallback={<div className="h-6 w-full rounded bg-[var(--color-surface)] animate-pulse" />}>
      <Block content={content} />
    </Suspense>
  );
}
