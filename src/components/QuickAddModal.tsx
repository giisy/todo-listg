import { useState } from 'react'
import { createPortal } from 'react-dom'  // ← tambahkan ini
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Calendar, Flag } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/utils/cn'
import type { Priority, Task } from '@/types'
import { generateId } from '@/utils/generateId'

interface QuickAddModalProps {
  onClose: () => void
}

export default function QuickAddModal({ onClose }: QuickAddModalProps) {
  const { dispatch } = useApp()
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [dueDate, setDueDate] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast('Please enter a task title', 'error')
      return
    }
    const newTask: Task = {
      id: generateId(),
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status: 'todo',
      categoryId: undefined,
      dueDate: dueDate || undefined,
      reminder: undefined,
      repeat: 'none',
      tags: [],
      color: undefined,
      isFavorite: false,
      isPinned: false,
      progress: 0,
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_TASK', payload: newTask })
    toast('Task created successfully', 'success')
    onClose()
    setTitle('')
    setDescription('')
    setPriority('medium')
    setDueDate('')
  }

  const priorities: { value: Priority; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: '#9CA3AF' },
    { value: 'medium', label: 'Medium', color: '#F59E0B' },
    { value: 'high', label: 'High', color: '#EF4444' },
    { value: 'urgent', label: 'Urgent', color: '#DC2626' },
  ]

  // ← wrap dengan createPortal
  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="modal-content max-w-lg p-5"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}>
                <Plus size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Quick Add Task</h3>
                <p className="text-xs text-text-muted">Create a new task instantly</p>
              </div>
            </div>
            <button onClick={onClose} className="btn-icon"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task title..."
              className="input"
              autoFocus
            />

            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description (optional)..."
              className="input min-h-[80px] resize-none"
              rows={3}
            />

            <div>
              <label className="text-xs font-medium text-text-muted mb-2 flex items-center gap-2">
                <Flag size={12} /> Priority
              </label>
              <div className="flex gap-2">
                {priorities.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={cn(
                      'flex-1 py-2 px-3 rounded-md border text-sm font-medium transition-all',
                      priority === p.value ? 'border-current text-current' : 'border-border text-text-muted hover:border-border/80'
                    )}
                    style={priority === p.value ? { borderColor: p.color, color: p.color } : undefined}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-text-muted mb-2 flex items-center gap-2">
                <Calendar size={12} /> Due Date (optional)
              </label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input" />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" disabled={!title.trim()} className="btn-primary flex-1">Add Task</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body  // ← render ke body
  )
}

export function QuickAddButton() {
  const { state, dispatch } = useApp()
  return (
    <>
      <button
        onClick={() => dispatch({ type: 'TOGGLE_QUICK_ADD' })}
        className={cn('btn-icon relative', state.showQuickAdd && 'text-accent-blue bg-accent-blue/10')}
        title="Quick Add Task (Cmd+N)"
      >
        <Plus size={15} />
      </button>
      {state.showQuickAdd && <QuickAddModal onClose={() => dispatch({ type: 'CLOSE_QUICK_ADD' })} />}
    </>
  )
}