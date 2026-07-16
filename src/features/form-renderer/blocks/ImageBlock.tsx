interface Props {
  content: Record<string, unknown>;
}

export function ImageBlock({ content }: Props) {
  const url = content.url as string | undefined;
  const alt = (content.alt as string) ?? '';
  const caption = content.caption as string | undefined;
  if (!url) return null;
  return (
    <figure className="w-full">
      <img src={url} alt={alt} className="w-full rounded-[var(--radius-theme)] object-cover max-h-80" />
      {caption && <figcaption className="mt-2 text-center text-sm text-[var(--color-text-muted)]">{caption}</figcaption>}
    </figure>
  );
}
