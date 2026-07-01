import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Filter, Calendar, Tag, Briefcase, Clock, ChevronDown, Check } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { PRIORITY_CONFIG } from '@/constants'
import { cn } from '@/utils/cn'
import type { Priority, TaskStatus, SearchFilters } from '@/types'
import { format } from 'date-fns'

export default function AdvancedSearchModal() {
  const { state, dispatch } = useApp()
  const { showAdvancedSearch, searchFilters, categories, tags, tasks } = state

  const [localFilters, setLocalFilters] = useState<SearchFilters>(searchFilters || {})
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (task.status === 'archived') return false

      // Apply search query
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase()
        const matchesTitle = task.title.toLowerCase().includes(query)
        const matchesDescription = task.description?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesDescription) return false
      }

      // Apply filters
      if (localFilters.priority && localFilters.priority !== 'all' && task.priority !== localFilters.priority) {
        return false
      }

      if (localFilters.status && localFilters.status !== 'all' && task.status !== localFilters.status) {
        return false
      }

      if (localFilters.categoryId && localFilters.categoryId !== 'all' && task.categoryId !== localFilters.categoryId) {
        return false
      }

      if (localFilters.dateFrom && task.dueDate) {
        const taskDate = new Date(task.dueDate)
        const fromDate = new Date(localFilters.dateFrom)
        if (taskDate < fromDate) return false
      }

      if (localFilters.dateTo && task.dueDate) {
        const taskDate = new Date(task.dueDate)
        const toDate = new Date(localFilters.dateTo)
        if (taskDate > toDate) return false
      }

      if (localFilters.tags && localFilters.tags.length > 0) {
        const hasAllTags = localFilters.tags.every(tag => task.tags.includes(tag))
        if (!hasAllTags) return false
      }

      return true
    })
  }, [tasks, state.searchQuery, localFilters])

  const priorities: (Priority | 'all')[] = ['all', 'low', 'medium', 'high', 'urgent']
  const statuses: (TaskStatus | 'all')[] = ['all', 'todo', 'in_progress', 'done']

  const handleApplyFilters = () => {
    dispatch({ type: 'SET_SEARCH_FILTERS', payload: localFilters })
    dispatch({ type: 'TOGGLE_ADVANCED_SEARCH' })
  }

  const handleClearFilters = () => {
    const cleared = {}
    setLocalFilters(cleared)
    dispatch({ type: 'CLEAR_SEARCH_FILTERS' })
  }

  const handleClose = () => {
    dispatch({ type: 'TOGGLE_ADVANCED_SEARCH' })
  }

  return (
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
            className="modal-content max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-bg-card border-b border-border p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center">
                  <Filter size={20} className="text-accent-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Advanced Search</h3>
                  <p className="text-xs text-text-muted">{filteredTasks.length} tasks found</p>
                </div>
              </div>
              <button onClick={handleClose} className="btn-icon">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Filters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Priority Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-muted flex items-center gap-2">
                    <Tag size={12} />
                    Priority
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-border hover:border-border/80 text-sm transition-all"
                    >
                      <span className="text-text-primary">
                        {localFilters.priority ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIORITY_CONFIG[localFilters.priority as Priority].dot }} />
                            {PRIORITY_CONFIG[localFilters.priority as Priority].label}
                          </span>
                        ) : (
                          'All Priorities'
                        )}
                      </span>
                      <ChevronDown size={14} className="text-text-muted" />
                    </button>

                    <AnimatePresence>
                      {showPriorityDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="absolute z-20 w-full mt-1 bg-bg-card border border-border rounded-md shadow-elevated overflow-hidden"
                        >
                          {priorities.map(priority => (
                            <button
                              key={priority}
                              onClick={() => {
                                setLocalFilters({ ...localFilters, priority: priority === 'all' ? undefined : priority })
                                setShowPriorityDropdown(false)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-sm text-text-primary"
                            >
                              {priority !== 'all' && (
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIORITY_CONFIG[priority].dot }} />
                              )}
                              <span>{priority === 'all' ? 'All Priorities' : PRIORITY_CONFIG[priority].label}</span>
                              {localFilters.priority === priority && <Check size={14} className="ml-auto text-accent-blue" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-muted flex items-center gap-2">
                    <Clock size={12} />
                    Status
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-border hover:border-border/80 text-sm transition-all"
                    >
                      <span className="text-text-primary">
                        {localFilters.status ? (
                          localFilters.status.charAt(0).toUpperCase() + localFilters.status.slice(1).replace('_', ' ')
                        ) : (
                          'All Statuses'
                        )}
                      </span>
                      <ChevronDown size={14} className="text-text-muted" />
                    </button>

                    <AnimatePresence>
                      {showStatusDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="absolute z-20 w-full mt-1 bg-bg-card border border-border rounded-md shadow-elevated overflow-hidden"
                        >
                          {statuses.map(status => (
                            <button
                              key={status}
                              onClick={() => {
                                setLocalFilters({ ...localFilters, status: status === 'all' ? undefined : status })
                                setShowStatusDropdown(false)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-sm text-text-primary"
                            >
                              <span>{status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</span>
                              {localFilters.status === status && <Check size={14} className="ml-auto text-accent-blue" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-muted flex items-center gap-2">
                    <Briefcase size={12} />
                    Category
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-border hover:border-border/80 text-sm transition-all"
                    >
                      <span className="text-text-primary">
                        {localFilters.categoryId ? (
                          categories.find(c => c.id === localFilters.categoryId)?.name || 'Uncategorized'
                        ) : (
                          'All Categories'
                        )}
                      </span>
                      <ChevronDown size={14} className="text-text-muted" />
                    </button>

                    <AnimatePresence>
                      {showCategoryDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="absolute z-20 w-full mt-1 bg-bg-card border border-border rounded-md shadow-elevated overflow-hidden"
                        >
                          <button
                            onClick={() => {
                              setLocalFilters({ ...localFilters, categoryId: undefined })
                              setShowCategoryDropdown(false)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-sm text-text-primary"
                          >
                            <span>All Categories</span>
                            {!localFilters.categoryId && <Check size={14} className="ml-auto text-accent-blue" />}
                          </button>
                          {categories.map(category => (
                            <button
                              key={category.id}
                              onClick={() => {
                                setLocalFilters({ ...localFilters, categoryId: category.id })
                                setShowCategoryDropdown(false)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-sm text-text-primary"
                            >
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: category.color }} />
                              <span>{category.name}</span>
                              {localFilters.categoryId === category.id && <Check size={14} className="ml-auto text-accent-blue" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-2 md:col-span-2 lg:col-span-1">
                  <label className="text-xs font-medium text-text-muted flex items-center gap-2">
                    <Calendar size={12} />
                    Date Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={localFilters.dateFrom || ''}
                      onChange={e => setLocalFilters({ ...localFilters, dateFrom: e.target.value || undefined })}
                      className="input flex-1"
                      placeholder="From"
                    />
                    <input
                      type="date"
                      value={localFilters.dateTo || ''}
                      onChange={e => setLocalFilters({ ...localFilters, dateTo: e.target.value || undefined })}
                      className="input flex-1"
                      placeholder="To"
                    />
                  </div>
                </div>
              </div>

              {/* Search Results Preview */}
              {filteredTasks.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                    <Search size={14} className="text-accent-blue" />
                    Search Results ({filteredTasks.length})
                  </h4>
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                    {filteredTasks.slice(0, 5).map(task => {
                      const prio = PRIORITY_CONFIG[task.priority]
                      return (
                        <div key={task.id} className="card p-3 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${prio.dot}20` }}>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: prio.dot }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary line-clamp-1">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-2xs" style={{ color: prio.color }}>{prio.label}</span>
                              {task.dueDate && (
                                <span className="text-2xs text-text-muted">
                                  {format(new Date(task.dueDate), 'MMM d')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {filteredTasks.length > 5 && (
                      <div className="text-center py-2">
                        <span className="text-xs text-text-muted">+ {filteredTasks.length - 5} more tasks</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {filteredTasks.length === 0 && (
                <div className="text-center py-8">
                  <Search size={32} className="text-text-muted mx-auto mb-2" />
                  <p className="text-sm text-text-primary">No tasks found</p>
                  <p className="text-xs text-text-muted mt-1">Try adjusting your filters</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-bg-card border-t border-border p-4 flex items-center justify-between gap-3">
              <button
                onClick={handleClearFilters}
                className="btn-ghost text-accent-rose"
              >
                Clear All
              </button>
              <div className="flex gap-2">
                <button onClick={handleClose} className="btn-ghost">
                  Cancel
                </button>
                <button onClick={handleApplyFilters} className="btn-primary">
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}