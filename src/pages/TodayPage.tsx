import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, isToday, isPast } from 'date-fns'
import {
  Plus, CheckCircle2, Circle, Star, Pin, Trash2,
  Flag, Filter, SortAsc, MoreHorizontal, Calendar,
  Tag, AlertTriangle,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { PRIORITY_CONFIG } from '@/constants'
import { cn } from '@/utils/cn'
import type { Task, Priority } from '@/types'
import AddTaskModal from '@/features/tasks/AddTaskModal'

type SortBy = 'createdAt' | 'dueDate' | 'priority' | 'title'
type FilterBy = 'all' | 'todo' | 'done' | 'high' | 'favorite'

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 }

export default function TodayPage() {
  const { state, dispatch } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [sortBy, setSortBy] = useState<SortBy>('createdAt')
  const [filterBy, setFilterBy] = useState<FilterBy>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = state.tasks.filter(t => t.status !== 'archived')

    // Search
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase()
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      )
    }

    // Filter
    switch (filterBy) {
      case 'todo': list = list.filter(t => t.status === 'todo' || t.status === 'in_progress'); break
      case 'done': list = list.filter(t => t.status === 'done'); break
      case 'high': list = list.filter(t => t.priority === 'high' || t.priority === 'urgent'); break
      case 'favorite': list = list.filter(t => t.isFavorite); break
    }

    // Sort
    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case 'priority':
          return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    // Pinned always first
    const pinned = list.filter(t => t.isPinned)
    const rest = list.filter(t => !t.isPinned)
    return [...pinned, ...rest]
  }, [state.tasks, state.searchQuery, filterBy, sortBy])

  const todoCount = filtered.filter(t => t.status !== 'done').length
  const doneCount = filtered.filter(t => t.status === 'done').length
  const progress = filtered.length > 0 ? Math.round((doneCount / filtered.length) * 100) : 0

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-4xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Today's Tasks</h2>
            <p className="text-xs text-text-muted mt-0.5">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={15} strokeWidth={2.5} />
            Add Task
          </button>
        </div>

        {/* Progress bar */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-secondary font-medium">
              {doneCount} of {filtered.length} completed
            </span>
            <span className="text-xs font-bold text-accent-blue">{progress}%</span>
          </div>
          <div className="h-1.5 bg-border/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full"
            />
          </div>
          <div className="flex items-center gap-4 mt-3">
            <span className="text-2xs text-text-muted">{todoCount} remaining</span>
            <span className="text-2xs text-text-muted">·</span>
            <span className="text-2xs text-accent-emerald">{doneCount} done</span>
          </div>
        </div>

        {/* Filters + Sort */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter tabs */}
          {([
            { id: 'all', label: 'All' },
            { id: 'todo', label: 'To Do' },
            { id: 'done', label: 'Done' },
            { id: 'high', label: 'High Priority' },
            { id: 'favorite', label: '⭐ Favorites' },
          ] as { id: FilterBy; label: string }[]).map(f => (
            <button
              key={f.id}
              onClick={() => setFilterBy(f.id)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
                filterBy === f.id
                  ? 'bg-accent-blue text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              )}
            >
              {f.label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="input py-1.5 w-auto text-xs"
            >
              <option value="createdAt">Newest</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>

        {/* Task list */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card p-12 flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent-blue/10 flex items-center justify-center">
              <CheckCircle2 size={28} className="text-accent-blue/60" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-text-primary">
                {state.searchQuery ? 'No tasks found' : 'No tasks yet'}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {state.searchQuery ? 'Try a different search term' : 'Click "Add Task" to get started'}
              </p>
            </div>
            {!state.searchQuery && (
              <button onClick={() => setShowModal(true)} className="btn-primary text-xs">
                <Plus size={13} /> Add your first task
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filtered.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  activeMenu={activeMenu}
                  setActiveMenu={setActiveMenu}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AddTaskModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}

function TaskCard({ task, activeMenu, setActiveMenu }: {
  task: Task
  activeMenu: string | null
  setActiveMenu: (id: string | null) => void
}) {
  const { dispatch } = useApp()
  const isDone = task.status === 'done'
  const prio = PRIORITY_CONFIG[task.priority]
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && !isDone
  const menuOpen = activeMenu === task.id

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'card p-4 group hover:border-border/80 transition-all duration-200',
        task.isPinned && 'border-accent-blue/20',
        isDone && 'opacity-60',
      )}
      style={task.color ? { borderLeftColor: task.color, borderLeftWidth: 3 } : undefined}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_TASK', payload: task.id })}
          className="flex-shrink-0 mt-0.5 transition-transform duration-150 hover:scale-110"
        >
          {isDone
            ? <CheckCircle2 size={18} className="text-accent-emerald" />
            : <Circle size={18} className="text-text-muted group-hover:text-text-secondary transition-colors" />
          }
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn(
              'text-sm font-medium leading-snug',
              isDone ? 'line-through text-text-muted' : 'text-text-primary'
            )}>
              {task.isPinned && <Pin size={11} className="inline mr-1 text-accent-blue" />}
              {task.title}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', payload: task.id })}
                className="btn-icon w-7 h-7"
              >
                <Star size={13} className={task.isFavorite ? 'text-accent-amber fill-current' : ''} />
              </button>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_PIN', payload: task.id })}
                className="btn-icon w-7 h-7"
              >
                <Pin size={13} className={task.isPinned ? 'text-accent-blue fill-current' : ''} />
              </button>
              <button
                onClick={() => dispatch({ type: 'DELETE_TASK', payload: task.id })}
                className="btn-icon w-7 h-7 hover:text-accent-rose"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-text-muted mt-1 line-clamp-2">{task.description}</p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {/* Priority */}
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium"
              style={{ background: prio.bg, color: prio.color }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: prio.dot }} />
              {prio.label}
            </span>

            {/* Due date */}
            {task.dueDate && (
              <span className={cn(
                'inline-flex items-center gap-1 text-2xs',
                isOverdue ? 'text-accent-rose' : isToday(new Date(task.dueDate)) ? 'text-accent-amber' : 'text-text-muted'
              )}>
                {isOverdue && <AlertTriangle size={10} />}
                <Calendar size={10} />
                {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}

            {/* Category */}
            {task.categoryId && (
              <span className="inline-flex items-center gap-1 text-2xs text-text-muted">
                <Tag size={10} />
                {task.categoryId}
              </span>
            )}

            {/* Tags */}
            {task.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-2xs px-1.5 py-0.5 rounded bg-white/5 text-text-muted">
                #{tag}
              </span>
            ))}
          </div>

          {/* Progress bar if set */}
          {task.progress > 0 && task.progress < 100 && (
            <div className="mt-2">
              <div className="h-1 bg-border/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-blue rounded-full transition-all duration-500"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}