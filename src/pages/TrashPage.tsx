import { motion } from 'framer-motion'
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { useApp } from '@/context/AppContext'
import { PRIORITY_CONFIG } from '@/constants'

export default function TrashPage() {
  const { state, dispatch } = useApp()

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Trash</h2>
            <p className="text-xs text-text-muted mt-0.5">{state.trash.length} deleted tasks</p>
          </div>
        </div>

        {state.trash.length === 0 ? (
          <div className="card p-12 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <Trash2 size={28} className="text-text-muted" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-text-primary">Trash is empty</p>
              <p className="text-xs text-text-muted mt-1">Deleted tasks will appear here</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {state.trash.map(task => {
              const prio = PRIORITY_CONFIG[task.priority]
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-4 group hover:border-border/80 transition-all duration-200 flex items-center gap-3 opacity-60 hover:opacity-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary line-through">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium"
                        style={{ background: prio.bg, color: prio.color }}
                      >
                        {prio.label}
                      </span>
                      <span className="text-2xs text-text-muted">
                        Deleted {format(new Date(task.updatedAt), 'MMM d')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'RESTORE_TASK', payload: task.id })}
                    className="btn-ghost text-xs opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <RotateCcw size={13} />
                    Restore
                  </button>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}