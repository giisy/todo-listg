import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'  // ← tambahkan ini
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Filter, Calendar, Tag, Briefcase, Clock, ChevronDown, Check } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { PRIORITY_CONFIG } from '@/constants'
import { cn } from '@/utils/cn'
import type { Priority, TaskStatus, SearchFilters } from '@/types'
import { format } from 'date-fns'

export default function AdvancedSearchModal() {
  const { state, dispatch } = useApp()
  const { showAdvancedSearch, searchFilters, categories, tasks } = state

  const [localFilters, setLocalFilters] = useState<SearchFilters>(searchFilters || {})
  useEffect(() => {
    if (showAdvancedSearch) setLocalFilters(searchFilters || {})
  }, [showAdvancedSearch])

  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (task.status === 'archived') return false
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase()
        if (!task.title.toLowerCase().includes(query) && !task.description?.toLowerCase().includes(query)) return false
      }
      if (localFilters.priority && localFilters.priority !== 'all' && task.priority !== localFilters.priority) return false
      if (localFilters.status && localFilters.status !== 'all' && task.status !== localFilters.status) return false
      if (localFilters.categoryId && localFilters.categoryId !== 'all' && task.categoryId !== localFilters.categoryId) return false
      if (localFilters.dateFrom && task.dueDate && new Date(task.dueDate) < new Date(localFilters.dateFrom)) return false
      if (localFilters.dateTo && task.dueDate && new Date(task.dueDate) > new Date(localFilters.dateTo)) return false
      if (localFilters.tags?.length && !localFilters.tags.every(tag => task.tags.includes(tag))) return false
      return true
    })
  }, [tasks, state.searchQuery, localFilters])

  const priorities: (Priority | 'all')[] = ['all', 'low', 'medium', 'high', 'urgent']
  const statuses: (TaskStatus | 'all')[] = ['all', 'todo', 'in_progress', 'done']

  const handleApplyFilters = () => {
    dispatch({ type: 'SET_SEARCH_FILTERS', payload: localFilters })
    dispatch({ type: 'CLOSE_ADVANCED_SEARCH' })
  }

  const handleClearFilters = () => {
    setLocalFilters({})
    dispatch({ type: 'CLEAR_SEARCH_FILTERS' })
  }

  const handleClose = () => {
    setShowPriorityDropdown(false)
    setShowStatusDropdown(false)
    setShowCategoryDropdown(false)
    dispatch({ type: 'CLOSE_ADVANCED_SEARCH' })
  }

  const activeFilterCount = [
    localFilters.priority,
    localFilters.status,
    localFilters.categoryId,
    localFilters.dateFrom,
    localFilters.dateTo,
  ].filter(Boolean).length

  // ← wrap seluruh modal dengan createPortal
  return createPortal(
    <AnimatePresence>
      {showAdvancedSearch && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-bg-card border border-border rounded-xl shadow-modal w-full max-w-4xl mx-4 flex flex-col"
            style={{ maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-shrink-0 border-b border-border p-4 flex items-center justify-between rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center">
                  <Filter size={20} className="text-accent-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Advanced Search</h3>
                  <p className="text-xs text-text-muted">
                    {filteredTasks.length} tasks found
                    {activeFilterCount > 0 && (
                      <span className="ml-1 text-accent-blue">· {activeFilterCount} filter active</span>
                    )}
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className="btn-icon"><X size={20} /></button>
            </div>

            {/* Filters — overflow visible supaya dropdown tidak terpotong */}
            <div className="flex-shrink-0 p-6 pb-4" style={{ overflow: 'visible' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Priority */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-muted flex items-center gap-2">
                    <Tag size={12} /> Priority
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => { setShowPriorityDropdown(!showPriorityDropdown); setShowStatusDropdown(false); setShowCategoryDropdown(false) }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-border bg-bg-card hover:border-accent-blue/50 text-sm transition-all"
                    >
                      <span className="text-text-primary">
                        {localFilters.priority && localFilters.priority !== 'all' ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIORITY_CONFIG[localFilters.priority as Priority].dot }} />
                            {PRIORITY_CONFIG[localFilters.priority as Priority].label}
                          </span>
                        ) : 'All Priorities'}
                      </span>
                      <ChevronDown size={14} className={cn('text-text-muted transition-transform', showPriorityDropdown && 'rotate-180')} />
                    </button>
                    <AnimatePresence>
                      {showPriorityDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute z-50 w-full mt-1 bg-bg-card border border-border rounded-md shadow-elevated overflow-hidden"
                        >
                          {priorities.map(priority => (
                            <button
                              key={priority}
                              onClick={() => { setLocalFilters({ ...localFilters, priority: priority === 'all' ? undefined : priority }); setShowPriorityDropdown(false) }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-sm text-text-primary"
                            >
                              {priority !== 'all' && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIORITY_CONFIG[priority].dot }} />}
                              <span>{priority === 'all' ? 'All Priorities' : PRIORITY_CONFIG[priority].label}</span>
                              {(priority === 'all' ? !localFilters.priority : localFilters.priority === priority) && <Check size={14} className="ml-auto text-accent-blue" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-muted flex items-center gap-2">
                    <Clock size={12} /> Status
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowPriorityDropdown(false); setShowCategoryDropdown(false) }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-border bg-bg-card hover:border-accent-blue/50 text-sm transition-all"
                    >
                      <span className="text-text-primary">
                        {localFilters.status && localFilters.status !== 'all'
                          ? localFilters.status.charAt(0).toUpperCase() + localFilters.status.slice(1).replace('_', ' ')
                          : 'All Statuses'}
                      </span>
                      <ChevronDown size={14} className={cn('text-text-muted transition-transform', showStatusDropdown && 'rotate-180')} />
                    </button>
                    <AnimatePresence>
                      {showStatusDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute z-50 w-full mt-1 bg-bg-card border border-border rounded-md shadow-elevated overflow-hidden"
                        >
                          {statuses.map(status => (
                            <button
                              key={status}
                              onClick={() => { setLocalFilters({ ...localFilters, status: status === 'all' ? undefined : status }); setShowStatusDropdown(false) }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-sm text-text-primary"
                            >
                              <span>{status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</span>
                              {(status === 'all' ? !localFilters.status : localFilters.status === status) && <Check size={14} className="ml-auto text-accent-blue" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-muted flex items-center gap-2">
                    <Briefcase size={12} /> Category
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => { setShowCategoryDropdown(!showCategoryDropdown); setShowPriorityDropdown(false); setShowStatusDropdown(false) }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-border bg-bg-card hover:border-accent-blue/50 text-sm transition-all"
                    >
                      <span className="text-text-primary">
                        {localFilters.categoryId ? categories.find(c => c.id === localFilters.categoryId)?.name || 'Unknown' : 'All Categories'}
                      </span>
                      <ChevronDown size={14} className={cn('text-text-muted transition-transform', showCategoryDropdown && 'rotate-180')} />
                    </button>
                    <AnimatePresence>
                      {showCategoryDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute z-50 w-full mt-1 bg-bg-card border border-border rounded-md shadow-elevated overflow-hidden max-h-48 overflow-y-auto"
                        >
                          <button
                            onClick={() => { setLocalFilters({ ...localFilters, categoryId: undefined }); setShowCategoryDropdown(false) }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-sm text-text-primary"
                          >
                            <span>All Categories</span>
                            {!localFilters.categoryId && <Check size={14} className="ml-auto text-accent-blue" />}
                          </button>
                          {categories.map(category => (
                            <button
                              key={category.id}
                              onClick={() => { setLocalFilters({ ...localFilters, categoryId: category.id }); setShowCategoryDropdown(false) }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-sm text-text-primary"
                            >
                              <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: category.color }} />
                              <span className="truncate">{category.name}</span>
                              {localFilters.categoryId === category.id && <Check size={14} className="ml-auto flex-shrink-0 text-accent-blue" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <label className="text-xs font-medium text-text-muted flex items-center gap-2">
                    <Calendar size={12} /> Date Range
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={localFilters.dateFrom || ''}
                      onChange={e => setLocalFilters({ ...localFilters, dateFrom: e.target.value || undefined })}
                      className="input flex-1"
                    />
                    <span className="text-text-muted text-xs flex-shrink-0">to</span>
                    <input
                      type="date"
                      value={localFilters.dateTo || ''}
                      onChange={e => setLocalFilters({ ...localFilters, dateTo: e.target.value || undefined })}
                      className="input flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto px-6 pb-2 min-h-0">
              {filteredTasks.length > 0 ? (
                <div className="space-y-2 pb-2">
                  <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2 py-2 sticky top-0 bg-bg-card">
                    <Search size={14} className="text-accent-blue" />
                    Results ({filteredTasks.length})
                  </h4>
                  {filteredTasks.map(task => {
                    const prio = PRIORITY_CONFIG[task.priority]
                    return (
                      <div key={task.id} className="card p-3 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${prio.dot}20` }}>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: prio.dot }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm font-medium text-text-primary line-clamp-1', task.status === 'done' && 'line-through text-text-muted')}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-2xs font-medium" style={{ color: prio.color }}>{prio.label}</span>
                            <span className="text-2xs text-text-muted capitalize">{task.status.replace('_', ' ')}</span>
                            {task.dueDate && <span className="text-2xs text-text-muted">{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>}
                            {task.tags.length > 0 && <span className="text-2xs text-text-muted">#{task.tags.slice(0, 2).join(' #')}</span>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search size={32} className="text-text-muted mx-auto mb-3" />
                  <p className="text-sm font-medium text-text-primary">No tasks found</p>
                  <p className="text-xs text-text-muted mt-1">Try adjusting your filters</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-border p-4 flex items-center justify-between gap-3 rounded-b-xl">
              <button onClick={handleClearFilters} className="btn-ghost text-accent-rose">Clear All</button>
              <div className="flex gap-2">
                <button onClick={handleClose} className="btn-ghost">Cancel</button>
                <button onClick={handleApplyFilters} className="btn-primary">Apply Filters</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body  // ← render ke body, keluar dari stacking context header
  )
}