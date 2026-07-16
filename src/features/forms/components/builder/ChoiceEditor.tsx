import { useRef, useEffect, type KeyboardEvent } from 'react';
import {
  DndContext, closestCenter,
  KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, CircleDot, Square } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface ChoiceRowProps {
  id: string;
  value: string;
  isLast: boolean;
  isOnly: boolean;
  isSingle: boolean;          // true = SingleChoice, false = MultiChoice
  onChange: (val: string) => void;
  onDelete: () => void;
  onEnter: () => void;        // crée la suivante
  onBackspaceEmpty: () => void; // remonte au champ précédent
  autoFocus?: boolean;
}

function ChoiceRow({
  id, value, isOnly, isSingle,
  onChange, onDelete, onEnter, onBackspaceEmpty, autoFocus,
}: ChoiceRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnter();
    } else if (e.key === 'Backspace' && value === '') {
      e.preventDefault();
      onBackspaceEmpty();
    }
  }

  const PreviewIcon = isSingle ? CircleDot : Square;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'group flex items-center gap-2 px-2 py-1.5 rounded-md',
        'hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]',
        isDragging && 'opacity-40',
      )}
    >
      {/* Poignée drag */}
      <button
        {...listeners}
        {...attributes}
        tabIndex={-1}
        aria-label="Réordonner"
        className="cursor-grab active:cursor-grabbing text-muted opacity-0 group-hover:opacity-100 shrink-0 transition-opacity"
      >
        <GripVertical size={14} />
      </button>

      {/* Icône aperçu type */}
      <PreviewIcon size={13} className="text-muted shrink-0" />

      {/* Champ texte */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={`Option ${id}`}
        className={cn(
          'flex-1 bg-transparent text-sm text-(--color-text)',
          'placeholder-[color-mix(in_srgb,var(--color-text-muted)_50%,transparent)]',
          'focus:outline-none border-b border-transparent focus:border-(--color-primary)',
          'transition-colors pb-0.5',
        )}
      />

      {/* Supprimer */}
      <button
        tabIndex={-1}
        aria-label={`Supprimer l'option`}
        disabled={isOnly}
        onClick={onDelete}
        className={cn(
          'shrink-0 size-5 flex items-center justify-center rounded',
          'text-muted opacity-0 group-hover:opacity-100 transition-all',
          'hover:text-danger hover:bg-(--color-danger-soft)',
          'disabled:pointer-events-none disabled:opacity-0',
        )}
      >
        <X size={12} />
      </button>
    </div>
  );
}

interface Props {
  options: string[];
  isSingle: boolean;
  onChange: (options: string[]) => void;
}

export function ChoiceEditor({ options, isSingle, onChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // ids stables = index converti en string pour le tri
  const ids = options.map((_, i) => String(i));

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    onChange(arrayMove(options, oldIndex, newIndex));
  }

  function addOption(afterIndex?: number) {
    const idx = afterIndex !== undefined ? afterIndex + 1 : options.length;
    const next = [...options.slice(0, idx), '', ...options.slice(idx)];
    onChange(next);
  }

  function removeOption(index: number) {
    if (options.length <= 1) return;
    const next = options.filter((_, i) => i !== index);
    onChange(next);
  }

  function updateOption(index: number, val: string) {
    const next = [...options];
    next[index] = val;
    onChange(next);
  }

  function addOther() {
    onChange([...options, 'Autre…']);
  }

  return (
    <div className="space-y-1">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {options.map((opt, i) => (
            <ChoiceRow
              key={i}
              id={String(i)}
              value={opt}
              isLast={i === options.length - 1}
              isOnly={options.length === 1}
              isSingle={isSingle}
              autoFocus={opt === '' && i === options.length - 1}
              onChange={(val) => updateOption(i, val)}
              onDelete={() => removeOption(i)}
              onEnter={() => addOption(i)}
              onBackspaceEmpty={() => {
                removeOption(i);
              }}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Actions bas */}
      <div className="flex items-center gap-3 pt-1 pl-6">
        <button
          onClick={() => addOption()}
          className="text-xs text-muted hover:text-primary transition-colors font-medium"
        >
          + Ajouter une option
        </button>
        <span className="text-muted text-xs">·</span>
        <button
          onClick={addOther}
          className="text-xs text-muted hover:text-primary transition-colors font-medium"
        >
          + Ajouter « Autre »
        </button>
      </div>
    </div>
  );
}
