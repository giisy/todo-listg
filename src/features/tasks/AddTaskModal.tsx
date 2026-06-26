import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Calendar, Tag, Flag, Repeat, AlarmClock, Hash } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { PRIORITY_CONFIG } from '@/constants'
import { cn } from '@/utils/cn'
import type { Priority, RepeatType } from '@/types'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  categoryId: z.string().optional(),
  dueDate: z.string().optional(),
  reminder: z.string().optional(),
  repeat: z.enum(['none', 'daily', 'weekly', 'monthly']),
  tags: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const TASK_COLORS = [
  '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B',
  '#F43F5E', '#06B6D4', '#EC4899', '#84CC16',
]

export default function AddTaskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, generateId } = useApp()
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'medium', repeat: 'none' },
  })

  const onSubmit = (data: FormData) => {
    dispatch({
      type: 'ADD_TASK',
      payload: {
        id: generateId(),
        title: data.title,
        description: data.description,
        priority: data.priority as Priority,
        status: 'todo',
        categoryId: data.categoryId,
        dueDate: data.dueDate,
        reminder: data.reminder,
        repeat: data.repeat as RepeatType,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        color: selectedColor,
        isFavorite: false,
        isPinned: false,
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })
    reset()
    setSelectedColor(undefined)
    onClose()
  }

  const handleClose = () => {
    reset()
    setSelectedColor(undefined)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="modal-content"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <div>
                <h2 className="text-sm font-semibold text-text-primary">Add New Task</h2>
                <p className="text-xs text-text-muted mt-0.5">Fill in the details below</p>
              </div>
              <button onClick={handleClose} className="btn-icon">
                <X size={15} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
              {/* Title */}
              <div>
                <input
                  {...register('title')}
                  placeholder="Task title..."
                  className={cn('input text-base font-medium', errors.title && 'border-accent-rose')}
                  autoFocus
                />
                {errors.title && (
                  <p className="text-2xs text-accent-rose mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <textarea
                {...register('description')}
                placeholder="Add a description (optional)..."
                rows={3}
                className="input resize-none"
              />

              {/* Priority + Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs text-text-muted font-medium mb-1.5 flex items-center gap-1">
                    <Flag size={10} /> Priority
                  </label>
                  <select {...register('priority')} className="input">
                    {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-2xs text-text-muted font-medium mb-1.5 flex items-center gap-1">
                    <Tag size={10} /> Category
                  </label>
                  <select {...register('categoryId')} className="input">
                    <option value="">No category</option>
                    {state.categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Due Date + Reminder */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs text-text-muted font-medium mb-1.5 flex items-center gap-1">
                    <Calendar size={10} /> Due Date
                  </label>
                  <input type="date" {...register('dueDate')} className="input" />
                </div>
                <div>
                  <label className="block text-2xs text-text-muted font-medium mb-1.5 flex items-center gap-1">
                    <AlarmClock size={10} /> Reminder
                  </label>
                  <input type="datetime-local" {...register('reminder')} className="input" />
                </div>
              </div>

              {/* Repeat + Tags */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs text-text-muted font-medium mb-1.5 flex items-center gap-1">
                    <Repeat size={10} /> Repeat
                  </label>
                  <select {...register('repeat')} className="input">
                    <option value="none">No repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-2xs text-text-muted font-medium mb-1.5 flex items-center gap-1">
                    <Hash size={10} /> Tags
                  </label>
                  <input {...register('tags')} placeholder="work, design, urgent" className="input" />
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-2xs text-text-muted font-medium mb-2">Task Color</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedColor(undefined)}
                    className={cn(
                      'w-6 h-6 rounded-full border-2 transition-all bg-bg-card',
                      !selectedColor ? 'border-accent-blue scale-110' : 'border-border'
                    )}
                  />
                  {TASK_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'w-6 h-6 rounded-full border-2 transition-all',
                        selectedColor === color ? 'border-white scale-110' : 'border-transparent'
                      )}
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                <button type="button" onClick={handleClose} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-primary">Add Task</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}