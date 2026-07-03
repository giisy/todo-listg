import { motion, AnimatePresence } from 'framer-motion'
import { Star, Pin, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/utils/cn'
import type { Task } from '@/types'

export default function ImportantPage() {
  const { state, dispatch } = useApp()
  const toast = useToast()

  const favorites = state.tasks
    .filter(t => t.isFavorite && t.status !== 'archived')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const pinned = state.tasks
    .filter(t => t.isPinned && !t.isFavorite && t.status !== 'archived')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const handleDeleteTask = (taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId })
    toast('Task deleted', 'info')
  }

  const Section = ({ title, icon, tasks }: { title: string; icon: React.ReactNode; tasks: Task[] }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-text-secondary">{icon}</span>
        <span className="text-sm font-semibold text-text-primary">{title}</span>
        <span className="text-2xs text-text-muted bg-white/5 px-2 py-0.5 rounded-full">{tasks.length}</span>
      </div>
      
      {tasks.length === 0 ? (
        <p className="text-xs text-text-muted py-2 italic">No tasks in this section</p>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'card p-3 lg:p-4 flex items-center justify-between group hover:border-border/80 transition-all duration-200',
                  task.status === 'done' && 'opacity-60'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_TASK', payload: task.id })}
                    className="flex-shrink-0 transition-transform duration-150 hover:scale-110"
                  >
                    {task.status === 'done' ? (
                      <CheckCircle2 size={18} className="text-accent-emerald" />
                    ) : (
                      <Circle size={18} className="text-text-muted group-hover:text-text-secondary" />
                    )}
                  </button>
                  <span className={cn('text-sm font-medium truncate', task.status === 'done' && 'line-through text-text-muted')}>
                    {task.title}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="btn-icon w-7 h-7 hover:text-accent-rose opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
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
        <Section
          title="Starred"
          icon={<Star size={15} className="text-accent-amber fill-current" />}
          tasks={favorites}
        />
        <Section
          title="Pinned"
          icon={<Pin size={15} className="text-accent-blue" />}
          tasks={pinned}
        />
      </div>
    </div>
  )
}