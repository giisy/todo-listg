import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X, CheckCircle2, Circle, Trash2, Calendar } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { useApp } from '@/context/AppContext'
import { PRIORITY_CONFIG } from '@/constants'
import { cn } from '@/utils/cn'
import type { Task } from '@/types'
import { generateId } from '@/utils/generateId'

export default function CalendarPage() {
  const { state, dispatch } = useApp()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get tasks for each day
  const getTasksForDay = (date: Date) => {
    return state.tasks.filter(task => {
      if (!task.dueDate || task.status === 'archived') return false
      return isSameDay(new Date(task.dueDate), date)
    })
  }

  // Get month name and year
  const monthName = format(currentDate, 'MMMM yyyy')

  // Tasks for selected day
  const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay) : []

  // Navigate months
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const goToToday = () => setCurrentDate(new Date())

  // Handle task actions
  const toggleTask = (taskId: string) => dispatch({ type: 'TOGGLE_TASK', payload: taskId })
  const toggleFavorite = (taskId: string) => dispatch({ type: 'TOGGLE_FAVORITE', payload: taskId })
  const togglePin = (taskId: string) => dispatch({ type: 'TOGGLE_PIN', payload: taskId })
  const deleteTask = (taskId: string) => dispatch({ type: 'DELETE_TASK', payload: taskId })

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Calendar</h2>
              <p className="text-xs text-text-muted mt-0.5">View and manage your tasks by date</p>
            </div>
            <button onClick={goToToday} className="btn-primary text-xs">
              Today
            </button>
          </div>

          {/* Calendar Header */}
          <div className="card p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CalendarIcon size={20} className="text-accent-blue" />
                <h3 className="text-lg font-semibold text-text-primary capitalize">{monthName}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousMonth}
                  className="btn-icon"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={goToNextMonth}
                  className="btn-icon"
                  aria-label="Next month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center py-2 text-xs font-medium text-text-muted">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map(day => {
                const tasks = getTasksForDay(day)
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isSelected = selectedDay && isSameDay(day, selectedDay)
                const isDayToday = isToday(day)

                return (
                  <motion.button
                    key={day.toString()}
                    onClick={() => setSelectedDay(day)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'relative aspect-square rounded-lg border flex flex-col items-center justify-center transition-all duration-200',
                      isCurrentMonth
                        ? 'border-border bg-bg-card hover:border-border/80'
                        : 'border-border/30 bg-bg-card/50 opacity-50',
                      isSelected && 'border-accent-blue bg-accent-blue/10',
                      isDayToday && 'border-accent-blue/50'
                    )}
                  >
                    <span className={cn(
                      'text-sm font-medium',
                      isDayToday && 'text-accent-blue',
                      isSelected && 'text-accent-blue'
                    )}>
                      {format(day, 'd')}
                    </span>
                    {tasks.length > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {tasks.slice(0, 3).map(task => (
                          <div
                            key={task.id}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: task.color || PRIORITY_CONFIG[task.priority].dot }}
                          />
                        ))}
                        {tasks.length > 3 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-text-muted" />
                        )}
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Selected Day Tasks */}
          <AnimatePresence>
            {selectedDay && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      {format(selectedDay, 'EEEE, MMMM d')}
                    </h3>
                    <p className="text-xs text-text-muted">
                      {selectedDayTasks.length} {selectedDayTasks.length === 1 ? 'task' : 'tasks'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="btn-icon"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>

                {selectedDayTasks.length === 0 ? (
                  <div className="py-8 text-center">
                    <CalendarIcon size={32} className="text-text-muted mx-auto mb-2" />
                    <p className="text-sm text-text-muted">No tasks scheduled</p>
                    <p className="text-xs text-text-muted mt-1">Select another day or create a new task</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedDayTasks.map(task => {
                      const isDone = task.status === 'done'
                      const prio = PRIORITY_CONFIG[task.priority]
                      
                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            'card p-3 group hover:border-border/80 transition-all duration-200 flex items-start gap-3',
                            isDone && 'opacity-50'
                          )}
                          style={task.color ? { borderLeftColor: task.color, borderLeftWidth: 3 } : undefined}
                        >
                          {/* Checkbox */}
                          <button
                            onClick={() => toggleTask(task.id)}
                            className="flex-shrink-0 mt-0.5 hover:scale-110 transition-transform"
                          >
                            {isDone ? (
                              <CheckCircle2 size={16} className="text-accent-emerald" />
                            ) : (
                              <Circle size={16} className="text-text-muted group-hover:text-text-secondary" />
                            )}
                          </button>

                          {/* Task Content */}
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-sm font-medium', isDone && 'line-through text-text-muted')}>
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{task.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium"
                                style={{ background: prio.bg, color: prio.color }}
                              >
                                <span className="w-1 h-1 rounded-full" style={{ background: prio.dot }} />
                                {prio.label}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => toggleFavorite(task.id)}
                              className="btn-icon w-6 h-6"
                              aria-label="Toggle favorite"
                            >
                              <Star
                                size={12}
                                className={cn(task.isFavorite && 'text-accent-amber fill-current')}
                              />
                            </button>
                            <button
                              onClick={() => togglePin(task.id)}
                              className="btn-icon w-6 h-6"
                              aria-label="Toggle pin"
                            >
                              <Pin size={12} className={cn(task.isPinned && 'text-accent-blue fill-current')} />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="btn-icon w-6 h-6 hover:text-accent-rose"
                              aria-label="Delete task"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}