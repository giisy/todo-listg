import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

interface DraggableTaskListProps {
  tasks: Array<{ id: string }>
  onDragEnd: (event: DragEndEvent) => void
  children: React.ReactNode
  disabled?: boolean
}

export default function DraggableTaskList({ tasks, onDragEnd, children, disabled }: DraggableTaskListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  if (disabled) {
    return <div className="space-y-2">{children}</div>
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {children}
        </div>
      </SortableContext>
    </DndContext>
  )
}