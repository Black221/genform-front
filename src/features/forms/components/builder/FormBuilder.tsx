import { useState, useCallback, useEffect } from 'react';
import { generateId } from '@/shared/lib/generateId';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import type { Question, QuestionType } from '@/shared/types';
import { QuestionEditorCard } from './QuestionEditorCard';
import { QuestionTypePicker } from './QuestionTypePicker';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';

interface Props {
  questions: Question[];
  onChange: (questions: Question[]) => void;
}

export function FormBuilder({ questions, onChange }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  // @dnd-kit/sortable 9.x / React 19 bug: DndContext initialise droppableRects
  // via useEffect (null au 1er render). SortableContext fait `id in droppableRects`
  // dès que items est non-vide → crash si l'effet n'a pas encore tourné.
  // Fix : on ne passe des items non-vides qu'après le premier effet.
  const [dndReady, setDndReady] = useState(false);
  useEffect(() => { setDndReady(true); }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const addQuestion = useCallback(
    (type: QuestionType) => {
      const newQ: Question = {
        id: generateId(),
        label: '',
        type,
        required: false,
        position: questions.length,
      };
      onChange([...questions, newQ]);
      setPickerOpen(false);
    },
    [questions, onChange],
  );

  const updateQuestion = useCallback(
    (updated: Question) => onChange(questions.map((q) => (q.id === updated.id ? updated : q))),
    [questions, onChange],
  );

  const deleteQuestion = useCallback(
    (id: string) => onChange(questions.filter((q) => q.id !== id)),
    [questions, onChange],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      const reordered = arrayMove(questions, oldIndex, newIndex).map((q, i) => ({ ...q, position: i }));
      onChange(reordered);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {/* items vide tant que dndReady=false pour éviter id in null */}
        <SortableContext
          items={dndReady ? questions.map((q) => q.id) : []}
          strategy={verticalListSortingStrategy}
        >
          {dndReady && questions.map((q) => (
            <QuestionEditorCard
              key={q.id}
              question={q}
              onChange={updateQuestion}
              onDelete={() => deleteQuestion(q.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button variant="secondary" onClick={() => setPickerOpen(true)} className="self-start mt-2">
        + Ajouter une question
      </Button>

      <Dialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        title="Choisir le type de question"
      >
        <QuestionTypePicker onSelect={addQuestion} />
      </Dialog>
    </div>
  );
}
