import { useRef } from 'react';
import { useController } from 'react-hook-form';
import { Camera, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { generateId } from '@/shared/lib/generateId';
import type { FieldProps } from '../fieldRegistry';

export interface PhotoEntry {
  id: string;
  blob: Blob;
  preview: string;
  contentType: string;
}

async function compress(file: File, maxPx = 1200, quality = 0.82): Promise<Blob> {
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
        (blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
        'image/jpeg',
        quality,
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

const MAX_PHOTOS = 5;

export default function PhotoField({ question, error, control }: FieldProps) {
  const { field } = useController({
    name: question.id,
    control: control as never,
    defaultValue: [],
  });

  const photos = (field.value as PhotoEntry[]) ?? [];
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const toProcess = files.slice(0, MAX_PHOTOS - photos.length);
    const added: PhotoEntry[] = await Promise.all(
      toProcess.map(async (file) => {
        const blob = await compress(file);
        return { id: generateId(), blob, preview: URL.createObjectURL(blob), contentType: 'image/jpeg' };
      }),
    );
    field.onChange([...photos, ...added]);
    e.target.value = '';
  };

  const remove = (id: string) => {
    const photo = photos.find((p) => p.id === id);
    if (photo) URL.revokeObjectURL(photo.preview);
    field.onChange(photos.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-(--color-text)">
        {question.label}
        {question.required && <span className="text-red-400 ml-1">*</span>}
      </p>

      {photos.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {photos.map((photo) => (
            <div key={photo.id} className="relative size-20 rounded-theme overflow-hidden border border-theme">
              <img src={photo.preview} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(photo.id)}
                className="absolute top-1 right-1 size-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                aria-label="Supprimer"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length < MAX_PHOTOS && (
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
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-theme border border-dashed text-sm font-medium transition-colors',
              'border-primary/40 text-primary hover:bg-primary/5',
            )}
          >
            <Camera size={15} />
            Ajouter une photo
            {photos.length > 0 && <span className="text-muted font-normal">({photos.length}/{MAX_PHOTOS})</span>}
          </button>
        </>
      )}

      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
