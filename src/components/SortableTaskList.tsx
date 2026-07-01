import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import DraggableTaskItem from './DraggableTaskItem'
import type { Task } from '@/types'

interface SortableTaskListProps {
  tasks: Task[]
  onTasksChange?: (tasks: Task[]) => void
  onTaskDelete?: (taskId: string) => void
}

export default function SortableTaskList({ tasks, onTasksChange, onTaskDelete }: SortableTaskListProps) {
  const { dispatch } = useApp()
  const toast = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex(task => task.id === active.id)
      const newIndex = tasks.findIndex(task => task.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newTasks = arrayMove(tasks, oldIndex, newIndex)
        
        if (onTasksChange) {
          onTasksChange(newTasks)
        }

        dispatch({
          type: 'REORDER_TASKS',
          payload: { oldIndex, newIndex, tasks: newTasks },
        })
        toast('Tasks reordered', 'info')
      }
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-xs text-text-muted">Nothing here yet</p>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {tasks.map(task => (
            <DraggableTaskItem key={task.id} task={task} onTaskDelete={onTaskDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}