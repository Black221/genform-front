interface Props {
  content: Record<string, unknown>;
}

export function EmbedBlock({ content }: Props) {
  const url = content.url as string | undefined;
  if (!url) return null;
  return (
    <div className="w-full aspect-video rounded-[var(--radius-theme)] overflow-hidden border border-[var(--color-border)]">
      <iframe
        src={url}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="embed"
      />
    </div>
  );
}
