interface Props {
  content: Record<string, unknown>;
}

export function RichTextBlock({ content }: Props) {
  const text = (content.text as string) ?? '';
  return (
    <p className="text-[var(--color-text-muted)] leading-relaxed whitespace-pre-wrap">{text}</p>
  );
}
