import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, isToday, isPast } from 'date-fns'
import {
  Plus, CheckCircle2, Circle, Star, Pin, Trash2,
  AlertTriangle, Calendar, Edit3,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { PRIORITY_CONFIG } from '@/constants'
import { cn } from '@/utils/cn'
import type { Task } from '@/types'
import AddTaskModal from '@/features/tasks/AddTaskModal'
import EditTaskModal from '@/features/tasks/EditTaskModal'

type SortBy = 'createdAt' | 'dueDate' | 'priority' | 'title'
type FilterBy = 'all' | 'todo' | 'done' | 'high'  // hapus 'favorite'

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 }

export default function TodayPage() {
  const { state, dispatch } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [sortBy, setSortBy] = useState<SortBy>('createdAt')
  const [filterBy, setFilterBy] = useState<FilterBy>('all')

  const filtered = useMemo(() => {
    let list = state.tasks.filter(t => t.status !== 'archived')

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase()
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      )
    }

    switch (filterBy) {
      case 'todo': list = list.filter(t => t.status === 'todo' || t.status === 'in_progress'); break
      case 'done': list = list.filter(t => t.status === 'done'); break
      case 'high': list = list.filter(t => t.priority === 'high' || t.priority === 'urgent'); break
    }

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

    const pinned = list.filter(t => t.isPinned)
    const rest = list.filter(t => !t.isPinned)
    return [...pinned, ...rest]
  }, [state.tasks, state.searchQuery, filterBy, sortBy])

  const doneCount = filtered.filter(t => t.status === 'done').length
  const todoCount = filtered.filter(t => t.status !== 'done').length
  const progress = filtered.length > 0 ? Math.round((doneCount / filtered.length) * 100) : 0

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-text-primary">Today's Tasks</h2>
            <p className="text-xs text-text-muted mt-0.5">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary text-xs lg:text-sm">
            <Plus size={14} strokeWidth={2.5} />
            <span className="hidden sm:inline">Add Task</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-secondary font-medium">{doneCount} of {filtered.length} completed</span>
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
          <div className="flex items-center gap-4 mt-2">
            <span className="text-2xs text-text-muted">{todoCount} remaining</span>
            <span className="text-2xs text-text-muted">·</span>
            <span className="text-2xs text-accent-emerald">{doneCount} done</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
            {([
              { id: 'all', label: 'All' },
              { id: 'todo', label: 'To Do' },
              { id: 'done', label: 'Done' },
              { id: 'high', label: 'High' },
              // hapus Fav
            ] as { id: FilterBy; label: string }[]).map(f => (
              <button
                key={f.id}
                onClick={() => setFilterBy(f.id)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 whitespace-nowrap flex-shrink-0',
                  filterBy === f.id ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className="input py-1.5 w-auto text-xs">
              <option value="createdAt">Newest</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-10 lg:p-12 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-accent-blue/10 flex items-center justify-center">
              <CheckCircle2 size={24} className="text-accent-blue/60" />
            </div>
            {/* Hapus teks "Tap Add" dan tombol "Add your first task" */}
            <p className="text-sm font-semibold text-text-primary">
              {state.searchQuery ? 'No tasks found' : 'No tasks yet'}
            </p>
            {state.searchQuery && (
              <p className="text-xs text-text-muted">Try a different search term</p>
            )}
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filtered.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  <TaskCard task={task} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      <AddTaskModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}

function TaskCard({ task }: { task: Task }) {
  const { dispatch } = useApp()
  const [editOpen, setEditOpen] = useState(false)
  const isDone = task.status === 'done'
  const prio = PRIORITY_CONFIG[task.priority]
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && !isDone

  return (
    <>
      <div
        className={cn(
          'card p-3 lg:p-4 group hover:border-border/80 transition-all duration-200',
          task.isPinned && 'border-accent-blue/20',
          isDone && 'opacity-60',
        )}
        style={task.color ? { borderLeftColor: task.color, borderLeftWidth: 3 } : undefined}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_TASK', payload: task.id })}
            className="flex-shrink-0 mt-0.5 transition-transform duration-150 hover:scale-110"
          >
            {isDone
              ? <CheckCircle2 size={18} className="text-accent-emerald" />
              : <Circle size={18} className="text-text-muted group-hover:text-text-secondary transition-colors" />
            }
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p
                onClick={() => setEditOpen(true)}
                className={cn('text-sm font-medium leading-snug cursor-pointer hover:text-accent-blue transition-colors', isDone ? 'line-through text-text-muted' : 'text-text-primary')}
              >
                {task.isPinned && <Pin size={11} className="inline mr-1 text-accent-blue" />}
                {task.title}
              </p>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => setEditOpen(true)} className="btn-icon w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit3 size={13} />
                </button>
                <button onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', payload: task.id })} className="btn-icon w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Star size={13} className={task.isFavorite ? 'text-accent-amber fill-current' : ''} />
                </button>
                <button onClick={() => dispatch({ type: 'TOGGLE_PIN', payload: task.id })} className="btn-icon w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
                  <Pin size={13} className={task.isPinned ? 'text-accent-blue fill-current' : ''} />
                </button>
                <button onClick={() => dispatch({ type: 'DELETE_TASK', payload: task.id })} className="btn-icon w-7 h-7 hover:text-accent-rose opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {task.description && (
              <p className="text-xs text-text-muted mt-1 line-clamp-2">{task.description}</p>
            )}

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium"
                style={{ background: prio.bg, color: prio.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: prio.dot }} />
                {prio.label}
              </span>
              {task.dueDate && (
                <span className={cn('inline-flex items-center gap-1 text-2xs', isOverdue ? 'text-accent-rose' : isToday(new Date(task.dueDate)) ? 'text-accent-amber' : 'text-text-muted')}>
                  {isOverdue && <AlertTriangle size={10} />}
                  <Calendar size={10} />
                  {format(new Date(task.dueDate), 'MMM d')}
                </span>
              )}
              {task.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-2xs px-1.5 py-0.5 rounded bg-white/5 text-text-muted hidden sm:inline">#{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <EditTaskModal task={task} open={editOpen} onClose={() => setEditOpen(false)} />
    </>
  )
}