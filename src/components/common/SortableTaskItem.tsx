import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SortableTaskItemProps {
  id: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export default function SortableTaskItem({ id, children, className, disabled }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group',
        isDragging && 'opacity-50 scale-[1.02]',
        className
      )}
    >
      <div className="flex items-start gap-2">
        {!disabled && (
          <div
            {...attributes}
            {...listeners}
            className={cn(
              'flex-shrink-0 mt-1 p-1 rounded-md text-text-muted opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing',
              'hover:bg-white/10 hover:text-text-secondary'
            )}
            aria-label="Drag task"
          >
            <GripVertical size={14} />
          </div>
        )}
        {disabled && <div className="flex-shrink-0 w-5 mt-1" />}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}