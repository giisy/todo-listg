import { motion } from 'framer-motion'
import { Star, Pin, CheckCircle2, Circle, Trash2, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { useApp } from '@/context/AppContext'
import { PRIORITY_CONFIG } from '@/constants'
import { cn } from '@/utils/cn'
import type { Task } from '@/types'

export default function ImportantPage() {
  const { state, dispatch } = useApp()

  const favorites = state.tasks.filter(t => t.isFavorite && t.status !== 'archived')
  const pinned = state.tasks.filter(t => t.isPinned && !t.isFavorite && t.status !== 'archived')

  const Section = ({ title, icon, tasks }: { title: string; icon: React.ReactNode; tasks: Task[] }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-text-secondary">{icon}</span>
        <span className="text-sm font-semibold text-text-primary">{title}</span>
        <span className="text-2xs text-text-muted bg-white/5 px-2 py-0.5 rounded-full">{tasks.length}</span>
      </div>
      {tasks.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-xs text-text-muted">Nothing here yet</p>
        </div>
      ) : (
        tasks.map(task => {
          const isDone = task.status === 'done'
          const prio = PRIORITY_CONFIG[task.priority]
          return (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('card p-4 group hover:border-border/80 transition-all duration-200 flex items-start gap-3', isDone && 'opacity-50')}
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
                <p className={cn('text-sm font-medium', isDone && 'line-through text-text-muted')}>{task.title}</p>
                {task.description && <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{task.description}</p>}
                <div className="flex items-center gap-3 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium" style={{ background: prio.bg, color: prio.color }}>
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
                <button onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', payload: task.id })} className="btn-icon w-7 h-7">
                  <Star size={13} className={task.isFavorite ? 'text-accent-amber fill-current' : ''} />
                </button>
                <button onClick={() => dispatch({ type: 'TOGGLE_PIN', payload: task.id })} className="btn-icon w-7 h-7">
                  <Pin size={13} className={task.isPinned ? 'text-accent-blue fill-current' : ''} />
                </button>
                <button onClick={() => dispatch({ type: 'DELETE_TASK', payload: task.id })} className="btn-icon w-7 h-7 hover:text-accent-rose">
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          )
        })
      )}
    </div>
  )

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Important</h2>
          <p className="text-xs text-text-muted mt-0.5">Your starred and pinned tasks</p>
        </div>
        <Section title="Starred" icon={<Star size={15} className="text-accent-amber fill-current" />} tasks={favorites} />
        <Section title="Pinned" icon={<Pin size={15} className="text-accent-blue" />} tasks={pinned} />
      </div>
    </div>
  )
}