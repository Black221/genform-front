interface Props {
  content: Record<string, unknown>;
}

export function HeadingBlock({ content }: Props) {
  const text = (content.text as string) ?? '';
  const level = (content.level as number) ?? 2;
  const Tag = `h${Math.min(Math.max(level, 1), 4)}` as 'h1' | 'h2' | 'h3' | 'h4';
  const sizeMap = { 1: 'text-3xl', 2: 'text-2xl', 3: 'text-xl', 4: 'text-lg' };
  return (
    <Tag className={`font-display font-bold text-[var(--color-text)] ${sizeMap[level as keyof typeof sizeMap] ?? 'text-2xl'}`}>
      {text}
    </Tag>
  );
}
