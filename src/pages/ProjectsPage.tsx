import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FolderOpen, CheckCircle2, Circle, Trash2, Star, ChevronDown, ChevronRight } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { PRIORITY_CONFIG } from '@/constants'
import { cn } from '@/utils/cn'
import AddTaskModal from '@/features/tasks/AddTaskModal'

export default function ProjectsPage() {
  const { state, dispatch } = useApp()
  const [expandedCats, setExpandedCats] = useState<string[]>(['work', 'personal'])
  const [showModal, setShowModal] = useState(false)

  const toggle = (id: string) => {
    setExpandedCats(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-4xl mx-auto space-y-5">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Projects</h2>
            <p className="text-xs text-text-muted mt-0.5">Tasks organized by category</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={15} />
            Add Task
          </button>
        </div>

        {state.categories.map(cat => {
          const catTasks = state.tasks.filter(t => t.categoryId === cat.id && t.status !== 'archived')
          const done = catTasks.filter(t => t.status === 'done').length
          const progress = catTasks.length > 0 ? Math.round((done / catTasks.length) * 100) : 0
          const isExpanded = expandedCats.includes(cat.id)

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="card overflow-hidden"
            >
              <button
                onClick={() => toggle(cat.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-white/3 transition-all duration-150"
              >
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: `${cat.color}20` }}
                >
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">{cat.name}</span>
                    <span className="text-2xs text-text-muted bg-white/5 px-2 py-0.5 rounded-full">
                      {catTasks.length} tasks
                    </span>
                  </div>
                  {catTasks.length > 0 && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1 bg-border/50 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%`, background: cat.color }}
                        />
                      </div>
                      <span className="text-2xs text-text-muted flex-shrink-0">{done}/{catTasks.length}</span>
                    </div>
                  )}
                </div>
                <div className="text-text-muted flex-shrink-0">
                  {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border/40 p-3 space-y-1">
                      {catTasks.length === 0 ? (
                        <p className="text-xs text-text-muted text-center py-4">No tasks in this category</p>
                      ) : (
                        catTasks.map(task => {
                          const isDone = task.status === 'done'
                          const prio = PRIORITY_CONFIG[task.priority]
                          return (
                            <div
                              key={task.id}
                              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/3 group transition-all"
                            >
                              <button
                                onClick={() => dispatch({ type: 'TOGGLE_TASK', payload: task.id })}
                                className="flex-shrink-0 hover:scale-110 transition-transform"
                              >
                                {isDone
                                  ? <CheckCircle2 size={15} className="text-accent-emerald" />
                                  : <Circle size={15} className="text-text-muted" />
                                }
                              </button>
                              <p className={`text-sm flex-1 truncate ${isDone ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                                {task.title}
                              </p>
                              <span
                                className="text-2xs px-2 py-0.5 rounded-full flex-shrink-0"
                                style={{ background: prio.bg, color: prio.color }}
                              >
                                {prio.label}
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', payload: task.id })}
                                  className="btn-icon w-6 h-6"
                                >
                                  <Star size={11} className={task.isFavorite ? 'text-accent-amber fill-current' : ''} />
                                </button>
                                <button
                                  onClick={() => dispatch({ type: 'DELETE_TASK', payload: task.id })}
                                  className="btn-icon w-6 h-6 hover:text-accent-rose"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}

        {(() => {
          const uncategorized = state.tasks.filter(t => !t.categoryId && t.status !== 'archived')
          if (uncategorized.length === 0) return null
          return (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <FolderOpen size={15} className="text-text-muted" />
                <span className="text-sm font-semibold text-text-primary">Uncategorized</span>
                <span className="text-2xs text-text-muted bg-white/5 px-2 py-0.5 rounded-full">{uncategorized.length}</span>
              </div>
              <div className="space-y-1">
                {uncategorized.map(task => {
                  const isDone = task.status === 'done'
                  return (
                    <div key={task.id} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/3 group transition-all">
                      <button onClick={() => dispatch({ type: 'TOGGLE_TASK', payload: task.id })} className="flex-shrink-0">
                        {isDone ? <CheckCircle2 size={15} className="text-accent-emerald" /> : <Circle size={15} className="text-text-muted" />}
                      </button>
                      <p className={`text-sm flex-1 truncate ${isDone ? 'line-through text-text-muted' : 'text-text-primary'}`}>{task.title}</p>
                      <button onClick={() => dispatch({ type: 'DELETE_TASK', payload: task.id })} className="btn-icon w-6 h-6 hover:text-accent-rose opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )
        })()}

      </div>

      <AddTaskModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}