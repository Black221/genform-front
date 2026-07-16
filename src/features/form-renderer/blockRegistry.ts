import { lazy, type ComponentType } from 'react';
import type { ContentBlockType } from '@/shared/types';

interface BlockProps {
  content: Record<string, unknown>;
}

export const blockRegistry: Record<ContentBlockType, ComponentType<BlockProps>> = {
  HEADING: lazy(() => import('./blocks/HeadingBlock').then((m) => ({ default: m.HeadingBlock }))),
  TEXT: lazy(() => import('./blocks/RichTextBlock').then((m) => ({ default: m.RichTextBlock }))),
  IMAGE: lazy(() => import('./blocks/ImageBlock').then((m) => ({ default: m.ImageBlock }))),
  DIVIDER: lazy(() => import('./blocks/DividerBlock').then((m) => ({ default: m.DividerBlock }))),
  EMBED: lazy(() => import('./blocks/EmbedBlock').then((m) => ({ default: m.EmbedBlock }))),
};
