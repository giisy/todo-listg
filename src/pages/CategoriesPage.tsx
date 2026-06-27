import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Tag, Trash2, Edit3, Check, X } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { cn } from '@/utils/cn'

const CATEGORY_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#F43F5E', '#06B6D4', '#EC4899', '#84CC16']
const CATEGORY_ICONS = ['💼', '🏠', '💪', '📚', '💰', '🎯', '🎨', '🚀', '📱', '🌍', '🎵', '🏋️']

export default function CategoriesPage() {
  const { state, dispatch, generateId } = useApp()
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(CATEGORY_COLORS[0])
  const [newIcon, setNewIcon] = useState(CATEGORY_ICONS[0])

  const handleAdd = () => {
    if (!newName.trim()) return
    dispatch({
      type: 'ADD_CATEGORY',
      payload: {
        id: generateId(),
        name: newName,
        color: newColor,
        icon: newIcon,
      },
    })
    setNewName('')
    setNewColor(CATEGORY_COLORS[0])
    setNewIcon(CATEGORY_ICONS[0])
    setIsAdding(false)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-4xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Categories</h2>
            <p className="text-xs text-text-muted mt-0.5">{state.categories.length} categories</p>
          </div>
          <button onClick={() => setIsAdding(true)} className="btn-primary">
            <Plus size={15} />
            New Category
          </button>
        </div>

        {/* Add form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="card p-5 space-y-4"
            >
              <h3 className="text-sm font-semibold text-text-primary">New Category</h3>
              <input
                placeholder="Category name..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="input"
                autoFocus
              />
              <div>
                <label className="block text-2xs text-text-muted font-medium mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewIcon(icon)}
                      className={cn(
                        'w-9 h-9 rounded-md text-base flex items-center justify-center transition-all border',
                        newIcon === icon ? 'border-accent-blue bg-accent-blue/10 scale-110' : 'border-border hover:border-border/80 bg-bg-card'
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-2xs text-text-muted font-medium mb-2">Color</label>
                <div className="flex items-center gap-2">
                  {CATEGORY_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewColor(color)}
                      className={cn(
                        'w-7 h-7 rounded-full border-2 transition-all',
                        newColor === color ? 'border-white scale-110' : 'border-transparent'
                      )}
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                <button onClick={() => setIsAdding(false)} className="btn-ghost text-xs">
                  <X size={12} /> Cancel
                </button>
                <button onClick={handleAdd} className="btn-primary text-xs">
                  <Check size={12} /> Add Category
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.categories.map(cat => {
            const catTasks = state.tasks.filter(t => t.categoryId === cat.id)
            const done = catTasks.filter(t => t.status === 'done').length
            const progress = catTasks.length > 0 ? Math.round((done / catTasks.length) * 100) : 0

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card p-5 hover:border-border/80 transition-all duration-200 group"
                style={{ borderLeftColor: cat.color, borderLeftWidth: 3 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ background: `${cat.color}20` }}
                    >
                      {cat.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{cat.name}</p>
                      <p className="text-2xs text-text-muted">{catTasks.length} tasks</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs text-text-muted">{done}/{catTasks.length} done</span>
                    <span className="text-2xs font-medium" style={{ color: cat.color }}>{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-border/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: cat.color }}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

      </div>
    </div>
  )
}