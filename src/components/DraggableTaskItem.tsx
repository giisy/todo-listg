import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { GripVertical, CheckCircle2, Circle, Trash2, Calendar, Star, Pin } from 'lucide-react'
import { format } from 'date-fns'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import { PRIORITY_CONFIG } from '@/constants'
import { cn } from '@/utils/cn'
import type { Task } from '@/types'

interface DraggableTaskItemProps {
  task: Task
  onTaskDelete?: (taskId: string) => void
}

export default function DraggableTaskItem({ task, onTaskDelete }: DraggableTaskItemProps) {
  const { dispatch } = useApp()
  const toast = useToast()
  const isDone = task.status === 'done'
  const prio = PRIORITY_CONFIG[task.priority]

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleToggle = () => {
    dispatch({ type: 'TOGGLE_TASK', payload: task.id })
    if (isDone) {
      toast('Task marked as incomplete', 'info')
    } else {
      toast('Task completed!', 'success')
    }
  }

  const handleDelete = () => {
    dispatch({ type: 'DELETE_TASK', payload: task.id })
    toast('Task deleted', 'info')
  }

  const handleToggleFavorite = () => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: task.id })
    if (task.isFavorite) {
      toast('Task removed from favorites', 'info')
    } else {
      toast('Task added to favorites', 'success')
    }
  }

  const handleTogglePin = () => {
    dispatch({ type: 'TOGGLE_PIN', payload: task.id })
    if (task.isPinned) {
      toast('Task unpinned', 'info')
    } else {
      toast('Task pinned', 'success')
    }
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'card p-4 group hover:border-border/80 transition-all duration-200 flex items-start gap-3',
        isDone && 'opacity-50',
        isDragging && 'opacity-50 rotate-2 scale-105 shadow-elevated'
      )}
      style={{
        ...style,
        borderLeftColor: task.color || undefined,
        borderLeftWidth: task.color ? 3 : undefined,
      }}
    >
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 mt-0.5 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
        aria-label="Drag to reorder"
      >
        <GripVertical size={14} className="text-text-muted" />
      </button>

      <button
        onClick={handleToggle}
        className="flex-shrink-0 mt-0.5 hover:scale-110 transition-transform"
      >
        {isDone ? (
          <CheckCircle2 size={17} className="text-accent-emerald" />
        ) : (
          <Circle size={17} className="text-text-muted group-hover:text-text-secondary" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', isDone && 'line-through text-text-muted')}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{task.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium"
            style={{ background: prio.bg, color: prio.color }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: prio.dot }} />
            {prio.label}
          </span>
          {task.dueDate && (
            <span className="text-2xs text-text-muted flex items-center gap-1">
              <Calendar size={10} />
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleToggleFavorite}
          className="btn-icon w-7 h-7"
          aria-label="Toggle favorite"
        >
          <Star
            size={13}
            className={cn(task.isFavorite && 'text-accent-amber fill-current')}
          />
        </button>
        <button
          onClick={handleTogglePin}
          className="btn-icon w-7 h-7"
          aria-label="Toggle pin"
        >
          <Pin size={13} className={cn(task.isPinned && 'text-accent-blue fill-current')} />
        </button>
        <button
          onClick={handleDelete}
          className="btn-icon w-7 h-7 hover:text-accent-rose"
          aria-label="Delete task"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  )
}