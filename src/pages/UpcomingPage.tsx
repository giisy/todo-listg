import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, isToday, isTomorrow, isThisWeek, isPast } from 'date-fns'
import { Calendar, CheckCircle2, Circle, Star, Pin, Trash2, AlertTriangle } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { PRIORITY_CONFIG } from '@/constants'
import { cn } from '@/utils/cn'
import type { Task } from '@/types'

export default function UpcomingPage() {
  const { state, dispatch } = useApp()

  const grouped = useMemo(() => {
    const tasks = state.tasks.filter(t =>
      t.status !== 'archived' &&
      t.dueDate
    )

    const overdue: Task[] = []
    const today: Task[] = []
    const tomorrow: Task[] = []
    const thisWeek: Task[] = []
    const later: Task[] = []

    tasks.forEach(task => {
      const due = new Date(task.dueDate!)
      if (isPast(due) && !isToday(due) && task.status !== 'done') overdue.push(task)
      else if (isToday(due)) today.push(task)
      else if (isTomorrow(due)) tomorrow.push(task)
      else if (isThisWeek(due)) thisWeek.push(task)
      else later.push(task)
    })

    return { overdue, today, tomorrow, thisWeek, later }
  }, [state.tasks])

  const sections = [
    { key: 'overdue', label: '⚠️ Overdue', tasks: grouped.overdue, color: 'text-accent-rose' },
    { key: 'today', label: '📅 Today', tasks: grouped.today, color: 'text-accent-amber' },
    { key: 'tomorrow', label: '🌅 Tomorrow', tasks: grouped.tomorrow, color: 'text-accent-blue' },
    { key: 'thisWeek', label: '📆 This Week', tasks: grouped.thisWeek, color: 'text-text-primary' },
    { key: 'later', label: '🗓 Later', tasks: grouped.later, color: 'text-text-secondary' },
  ].filter(s => s.tasks.length > 0)

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Upcoming</h2>
          <p className="text-xs text-text-muted mt-0.5">All your tasks by deadline</p>
        </div>

        {sections.length === 0 ? (
          <div className="card p-12 flex flex-col items-center gap-4">
            <p className="text-4xl">🎉</p>
            <div className="text-center">
              <p className="text-sm font-semibold text-text-primary">All clear!</p>
              <p className="text-xs text-text-muted mt-1">No upcoming tasks with deadlines</p>
            </div>
          </div>
        ) : (
          sections.map(section => (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={cn('text-sm font-semibold', section.color)}>{section.label}</span>
                <span className="text-2xs text-text-muted bg-white/5 px-2 py-0.5 rounded-full">
                  {section.tasks.length}
                </span>
              </div>
              {section.tasks.map(task => (
                <UpcomingTaskCard key={task.id} task={task} />
              ))}
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

function UpcomingTaskCard({ task }: { task: Task }) {
  const { dispatch } = useApp()
  const isDone = task.status === 'done'
  const prio = PRIORITY_CONFIG[task.priority]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'card p-4 group hover:border-border/80 transition-all duration-200 flex items-start gap-3',
        isDone && 'opacity-50',
      )}
      style={task.color ? { borderLeftColor: task.color, borderLeftWidth: 3 } : undefined}
    >
      <button
        onClick={() => dispatch({ type: 'TOGGLE_TASK', payload: task.id })}
        className="flex-shrink-0 mt-0.5 hover:scale-110 transition-transform"
      >
        {isDone
          ? <CheckCircle2 size={17} className="text-accent-emerald" />
          : <Circle size={17} className="text-text-muted group-hover:text-text-secondary" />
        }
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
              {format(new Date(task.dueDate), 'EEE, MMM d')}
            </span>
          )}
          {task.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-2xs px-1.5 py-0.5 rounded bg-white/5 text-text-muted">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', payload: task.id })}
          className="btn-icon w-7 h-7"
        >
          <Star size={13} className={task.isFavorite ? 'text-accent-amber fill-current' : ''} />
        </button>
        <button
          onClick={() => dispatch({ type: 'DELETE_TASK', payload: task.id })}
          className="btn-icon w-7 h-7 hover:text-accent-rose"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  )
}