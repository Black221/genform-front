import { useRef } from 'react';
import { generateId } from '@/shared/lib/generateId';
import { cn } from '@/shared/lib/cn';

export interface CapturedPhoto {
  id: string;
  blob: Blob;
  preview: string;
  contentType: string;
}

interface Props {
  photos: CapturedPhoto[];
  onChange: (photos: CapturedPhoto[]) => void;
  maxPhotos?: number;
}

async function compressImage(file: File, maxPx = 1200, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Compression failed')),
        'image/jpeg',
        quality,
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function PhotoCapture({ photos, onChange, maxPhotos = 5 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = maxPhotos - photos.length;
    const toProcess = files.slice(0, remaining);

    const newPhotos: CapturedPhoto[] = await Promise.all(
      toProcess.map(async (file) => {
        const blob = await compressImage(file);
        return {
          id: generateId(),
          blob,
          preview: URL.createObjectURL(blob),
          contentType: 'image/jpeg',
        };
      }),
    );

    onChange([...photos, ...newPhotos]);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const remove = (id: string) => {
    const photo = photos.find((p) => p.id === id);
    if (photo) URL.revokeObjectURL(photo.preview);
    onChange(photos.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-3">
      {/* Thumbnails */}
      {photos.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {photos.map((photo) => (
            <div key={photo.id} className="relative size-16 rounded-xl overflow-hidden border border-theme">
              <img src={photo.preview} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => remove(photo.id)}
                className="absolute top-0.5 right-0.5 size-5 rounded-full bg-black/60 text-white flex items-center justify-center text-xs leading-none hover:bg-black/80"
                aria-label="Supprimer"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add button */}
      {photos.length < maxPhotos && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
          <button
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--brand-teranga)]',
              'text-sm font-medium text-[var(--brand-teranga)] hover:bg-[var(--brand-teranga-light)] transition-colors',
            )}
          >
            <IconCamera className="size-4" />
            Ajouter une photo {photos.length > 0 && `(${photos.length}/${maxPhotos})`}
          </button>
        </>
      )}
    </div>
  );
}

function IconCamera({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
