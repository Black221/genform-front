import { useState, useCallback } from 'react';
import { generateId } from '@/shared/lib/generateId';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Section, Question, ContentBlock, ContentBlockType, QuestionType } from '@/shared/types';
import { QuestionEditorCard } from './QuestionEditorCard';
import { ContentBlockEditor } from './ContentBlockEditor';
import { QuestionTypePicker } from './QuestionTypePicker';
import { BlockTypePicker } from './BlockTypePicker';
import { Dialog } from '@/shared/ui/Dialog';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

type Item = ({ kind: 'question' } & Question) | ({ kind: 'block' } & ContentBlock);

interface Props {
  section: Section;
  questions: Question[];
  contentBlocks: ContentBlock[];
  onUpdateSection: (s: Section) => void;
  onDeleteSection: () => void;
  onUpdateQuestions: (qs: Question[]) => void;
  onUpdateBlocks: (bs: ContentBlock[]) => void;
}

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="relative group/item"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-3 cursor-grab text-[var(--color-border)] hover:text-[var(--color-text-muted)] px-1 z-10"
        style={{ touchAction: 'none' }}
      >
        ⠿
      </div>
      <div className="pl-5">{children}</div>
    </div>
  );
}

export function SectionEditor({ section, questions, contentBlocks, onUpdateSection, onDeleteSection, onUpdateQuestions, onUpdateBlocks }: Props) {
  const [questionPickerOpen, setQuestionPickerOpen] = useState(false);
  const [blockPickerOpen, setBlockPickerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const items: Item[] = [
    ...questions.map((q) => ({ kind: 'question' as const, ...q })),
    ...contentBlocks.map((b) => ({ kind: 'block' as const, ...b })),
  ].sort((a, b) => a.position - b.position);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex).map((item, pos) => ({ ...item, position: pos }));
    onUpdateQuestions(reordered.filter((i) => i.kind === 'question').map(({ kind: _, ...q }) => q as Question));
    onUpdateBlocks(reordered.filter((i) => i.kind === 'block').map(({ kind: _, ...b }) => b as ContentBlock));
  };

  const addQuestion = useCallback(
    (type: QuestionType) => {
      const newQ: Question = {
        id: generateId(),
        sectionId: section.id,
        label: '',
        type,
        required: false,
        position: items.length,
      };
      onUpdateQuestions([...questions, newQ]);
      setQuestionPickerOpen(false);
    },
    [questions, items.length, section.id, onUpdateQuestions],
  );

  const addBlock = useCallback(
    (type: ContentBlockType) => {
      const newB: ContentBlock = {
        id: generateId(),
        sectionId: section.id,
        type,
        position: items.length,
        content: {},
      };
      onUpdateBlocks([...contentBlocks, newB]);
      setBlockPickerOpen(false);
    },
    [contentBlocks, items.length, section.id, onUpdateBlocks],
  );

  return (
    <div className="border border-[var(--color-border)] rounded-[var(--radius-theme)] bg-[var(--color-surface)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg)]/50">
        <button type="button" onClick={() => setCollapsed((c) => !c)} className="text-[var(--color-text-muted)] text-sm">
          {collapsed ? '▶' : '▼'}
        </button>
        <Input
          value={section.title ?? ''}
          onChange={(e) => onUpdateSection({ ...section, title: e.target.value })}
          placeholder="Titre de la section (optionnel)"
          className="flex-1 bg-transparent border-none p-0 text-sm font-medium"
        />
        <button type="button" onClick={onDeleteSection} className="text-xs text-red-400 hover:text-red-300">
          Supprimer
        </button>
      </div>

      {!collapsed && (
        <div className="p-4 flex flex-col gap-3">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              {items.map((item) =>
                item.kind === 'question' ? (
                  <SortableItem key={item.id} id={item.id}>
                    <QuestionEditorCard
                      question={item}
                      onChange={(q) => onUpdateQuestions(questions.map((x) => (x.id === q.id ? q : x)))}
                      onDelete={() => onUpdateQuestions(questions.filter((x) => x.id !== item.id))}
                    />
                  </SortableItem>
                ) : (
                  <SortableItem key={item.id} id={item.id}>
                    <ContentBlockEditor
                      block={item}
                      onChange={(b) => onUpdateBlocks(contentBlocks.map((x) => (x.id === b.id ? b : x)))}
                      onDelete={() => onUpdateBlocks(contentBlocks.filter((x) => x.id !== item.id))}
                    />
                  </SortableItem>
                ),
              )}
            </SortableContext>
          </DndContext>

          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" variant="secondary" onClick={() => setQuestionPickerOpen(true)}>+ Question</Button>
            <Button size="sm" variant="ghost" onClick={() => setBlockPickerOpen(true)}>+ Bloc</Button>
          </div>
        </div>
      )}

      <Dialog open={questionPickerOpen} onOpenChange={setQuestionPickerOpen} title="Type de question">
        <QuestionTypePicker onSelect={addQuestion} />
      </Dialog>
      <Dialog open={blockPickerOpen} onOpenChange={setBlockPickerOpen} title="Type de bloc">
        <BlockTypePicker onSelect={addBlock} />
      </Dialog>
    </div>
  );
}
