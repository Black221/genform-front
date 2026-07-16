import { useRef } from 'react';
import { useController } from 'react-hook-form';
import { Paperclip, X, FileText } from 'lucide-react';
import { generateId } from '@/shared/lib/generateId';
import type { FieldProps } from '../fieldRegistry';

export interface FileEntry {
  id: string;
  file: File;
  name: string;
  size: number;
}

const MAX_FILES = 5;
const MAX_MB = 10;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function FileField({ question, error, control }: FieldProps) {
  const { field } = useController({
    name: question.id,
    control: control as never,
    defaultValue: [],
  });

  const files = (field.value as FileEntry[]) ?? [];
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
      .filter((f) => f.size <= MAX_MB * 1024 * 1024)
      .slice(0, MAX_FILES - files.length);

    const added: FileEntry[] = picked.map((file) => ({
      id: generateId(),
      file,
      name: file.name,
      size: file.size,
    }));

    field.onChange([...files, ...added]);
    e.target.value = '';
  };

  const remove = (id: string) => field.onChange(files.filter((f) => f.id !== id));

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-display font-semibold" style={{ color: 'var(--color-text)' }}>
        {question.label}
        {question.required && <span className="ml-1" style={{ color: 'var(--color-danger, #C2453B)' }}>*</span>}
      </p>

      {/* Liste des fichiers sélectionnés */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <FileText size={16} className="shrink-0" style={{ color: 'var(--color-primary)' }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" style={{ color: 'var(--color-text)' }}>{f.name}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatSize(f.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(f.id)}
                className="shrink-0 transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-text-muted)' }}
                aria-label="Supprimer"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Zone de dépôt */}
      {files.length < MAX_FILES && (
        <>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2.5 w-full py-8 rounded-xl border-2 border-dashed transition-colors"
            style={{ borderColor: 'var(--color-border)' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dt = e.dataTransfer;
              const fakeEvent = { target: { files: dt.files, value: '' } } as unknown as React.ChangeEvent<HTMLInputElement>;
              handleChange(fakeEvent);
            }}
          >
            <Paperclip size={22} style={{ color: 'var(--color-primary)' }} />
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                Choisir un fichier
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                ou glisser-déposer · max {MAX_MB} Mo · {MAX_FILES} fichiers
              </p>
            </div>
            {files.length > 0 && (
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {files.length}/{MAX_FILES} fichier{files.length > 1 ? 's' : ''} sélectionné{files.length > 1 ? 's' : ''}
              </span>
            )}
          </button>
        </>
      )}

      {error && (
        <p className="text-xs font-medium" style={{ color: 'var(--color-danger, #C2453B)' }}>
          {error.message}
        </p>
      )}
    </div>
  );
}
