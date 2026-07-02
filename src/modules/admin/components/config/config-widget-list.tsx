import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WidgetListItem {
  id: string;
  label: string;
}

interface ConfigWidgetListProps {
  items: WidgetListItem[];
  activeIds: string[];
  order: string[];
  onActiveChange: (activeIds: string[]) => void;
  onOrderChange: (order: string[]) => void;
}

function SortableRow({
  id,
  label,
  active,
  onToggle,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  id: string;
  label: string;
  active: boolean;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#0F1D32]/50 px-3 py-2",
        isDragging && "opacity-60 ring-2 ring-[#C8A95A]/50 z-10",
        !active && "opacity-50",
      )}
    >
      <button
        type="button"
        className="cursor-grab text-[#8899B4] hover:text-[#C8A95A] touch-none"
        {...attributes}
        {...listeners}
        aria-label={`Reordenar ${label}`}
      >
        <GripVertical className="size-4" />
      </button>
      <Checkbox
        checked={active}
        onCheckedChange={onToggle}
        aria-label={`Activar ${label}`}
        className="border-[#1A2F4A] data-[state=checked]:bg-[#C8A95A] data-[state=checked]:border-[#C8A95A]"
      />
      <span className="flex-1 text-sm text-[#E8EDF5]">{label}</span>
      <div className="flex gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={isFirst}
          onClick={onMoveUp}
          aria-label={`Subir ${label}`}
        >
          <ChevronUp className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={isLast}
          onClick={onMoveDown}
          aria-label={`Bajar ${label}`}
        >
          <ChevronDown className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function ConfigWidgetList({
  items,
  activeIds,
  order,
  onActiveChange,
  onOrderChange,
}: ConfigWidgetListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const orderedItems = order
    .map((id) => items.find((i) => i.id === id))
    .filter((i): i is WidgetListItem => !!i);

  const extra = items.filter((i) => !order.includes(i.id));
  const displayList = [...orderedItems, ...extra];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = displayList.findIndex((i) => i.id === active.id);
    const newIndex = displayList.findIndex((i) => i.id === over.id);
    const next = arrayMove(
      displayList.map((i) => i.id),
      oldIndex,
      newIndex,
    );
    onOrderChange(next);
  };

  const toggle = (id: string) => {
    if (activeIds.includes(id)) {
      onActiveChange(activeIds.filter((x) => x !== id));
    } else {
      onActiveChange([...activeIds, id]);
    }
  };

  const move = (id: string, dir: -1 | 1) => {
    const ids = displayList.map((i) => i.id);
    const idx = ids.indexOf(id);
    const target = idx + dir;
    if (target < 0 || target >= ids.length) return;
    onOrderChange(arrayMove(ids, idx, target));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={displayList.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2" role="list" aria-label="Lista de widgets">
          {displayList.map((item, idx) => (
            <SortableRow
              key={item.id}
              id={item.id}
              label={item.label}
              active={activeIds.includes(item.id)}
              onToggle={() => toggle(item.id)}
              onMoveUp={() => move(item.id, -1)}
              onMoveDown={() => move(item.id, 1)}
              isFirst={idx === 0}
              isLast={idx === displayList.length - 1}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
