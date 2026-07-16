import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import type { Section, Question, ContentBlock } from '@/shared/types';
import { generateId } from '@/shared/lib/generateId';
import { SectionEditor } from './SectionEditor';
import { Button } from '@/shared/ui/Button';

interface Props {
  sections: Section[];
  questions: Question[];
  contentBlocks: ContentBlock[];
  onSectionsChange: (s: Section[]) => void;
  onQuestionsChange: (q: Question[]) => void;
  onBlocksChange: (b: ContentBlock[]) => void;
}

export function SectionList({ sections, questions, contentBlocks, onSectionsChange, onQuestionsChange, onBlocksChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sections.findIndex((s) => s.id === active.id);
    const newIdx = sections.findIndex((s) => s.id === over.id);
    onSectionsChange(arrayMove(sections, oldIdx, newIdx).map((s, i) => ({ ...s, position: i })));
  };

  const addSection = () => {
    const newSection: Section = {
      id: generateId(),
      position: sections.length,
      title: `Section ${sections.length + 1}`,
    };
    onSectionsChange([...sections, newSection]);
  };

  const deleteSection = (id: string) => {
    onSectionsChange(sections.filter((s) => s.id !== id).map((s, i) => ({ ...s, position: i })));
    onQuestionsChange(questions.filter((q) => q.sectionId !== id));
    onBlocksChange(contentBlocks.filter((b) => b.sectionId !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map((section) => (
            <SectionEditor
              key={section.id}
              section={section}
              questions={questions.filter((q) => q.sectionId === section.id)}
              contentBlocks={contentBlocks.filter((b) => b.sectionId === section.id)}
              onUpdateSection={(s) => onSectionsChange(sections.map((x) => (x.id === s.id ? s : x)))}
              onDeleteSection={() => deleteSection(section.id)}
              onUpdateQuestions={(qs) => onQuestionsChange([...questions.filter((q) => q.sectionId !== section.id), ...qs])}
              onUpdateBlocks={(bs) => onBlocksChange([...contentBlocks.filter((b) => b.sectionId !== section.id), ...bs])}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button variant="secondary" onClick={addSection} className="self-start">
        + Ajouter une section
      </Button>
    </div>
  );
}
