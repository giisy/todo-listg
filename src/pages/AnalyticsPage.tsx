import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  format, subDays, isToday, isSameDay,
  startOfMonth, endOfMonth, eachDayOfInterval,
  addMonths, subMonths, isSameMonth,
} from 'date-fns'
import {
  CheckCircle2, Clock, AlertTriangle, TrendingUp,
  Target, Flame, Award, ChevronLeft, ChevronRight,
  X, Calendar as CalendarIcon,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { PRIORITY_CONFIG } from '@/constants'
import { cn } from '@/utils/cn'

export default function AnalyticsPage() {
  const { state } = useApp()
  const { tasks, activity } = state
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'done').length
    const pending = tasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length
    const overdue = tasks.filter(t =>
      t.status !== 'done' && t.dueDate &&
      new Date(t.dueDate) < new Date() && !isToday(new Date(t.dueDate))
    ).length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    const favorites = tasks.filter(t => t.isFavorite).length

    const byPriority = {
      urgent: tasks.filter(t => t.priority === 'urgent').length,
      high:   tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low:    tasks.filter(t => t.priority === 'low').length,
    }

    // Streak dari completedAt tasks
    let streak = 0
    for (let i = 0; i < 30; i++) {
      const date = subDays(new Date(), i)
      const hasCompleted = tasks.some(t =>
        t.completedAt && isSameDay(new Date(t.completedAt), date)
      )
      if (hasCompleted) streak++
      else break
    }

    return { total, completed, pending, overdue, completionRate, favorites, byPriority, streak }
  }, [tasks])

  // Activity per hari untuk kalender
  const getActivityForDay = (date: Date) => {
    const created = tasks.filter(t => isSameDay(new Date(t.createdAt), date))
    const completed = tasks.filter(t => t.completedAt && isSameDay(new Date(t.completedAt), date))
    const deleted = activity.filter(a =>
      a.type === 'deleted' && isSameDay(new Date(a.timestamp), date)
    )
    return { created, completed, deleted }
  }

  const selectedDayActivity = selectedDay ? getActivityForDay(selectedDay) : null

  const monthStart = startOfMonth(calendarDate)
  const monthEnd = endOfMonth(calendarDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Padding hari kosong di awal bulan
  const firstDayOfWeek = monthStart.getDay() // 0 = Sunday
  const paddingDays = Array.from({ length: firstDayOfWeek })

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-5xl mx-auto space-y-6">

        <div>
          <h2 className="text-xl font-bold text-text-primary">Analytics</h2>
          <p className="text-xs text-text-muted mt-0.5">Your productivity overview</p>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Tasks',     value: stats.total,              icon: <Target size={16} />,      color: 'text-[var(--accent-color)]', bg: 'bg-[var(--accent-color)]/10' },
            { label: 'Completed',       value: stats.completed,          icon: <CheckCircle2 size={16} />, color: 'text-accent-emerald',        bg: 'bg-accent-emerald/10' },
            { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: <TrendingUp size={16} />,  color: 'text-accent-purple',         bg: 'bg-accent-purple/10' },
            { label: 'Current Streak',  value: `${stats.streak}d`,       icon: <Flame size={16} />,        color: 'text-accent-amber',          bg: 'bg-accent-amber/10' },
          ].map(s => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
              <div className={cn('w-9 h-9 rounded-md flex items-center justify-center', s.bg, s.color)}>{s.icon}</div>
              <div>
                <div className="text-2xl font-bold text-text-primary">{s.value}</div>
                <div className="text-xs text-text-secondary mt-0.5">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Activity Calendar — ganti Last 7 Days */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-2 card p-5"
          >
            {/* Calendar header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon size={14} className="text-text-secondary" />
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Activity — {format(calendarDate, 'MMMM yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setCalendarDate(subMonths(calendarDate, 1))} className="btn-icon w-7 h-7">
                  <ChevronLeft size={13} />
                </button>
                <button
                  onClick={() => { setCalendarDate(new Date()); setSelectedDay(new Date()) }}
                  className="text-2xs text-[var(--accent-color)] px-2 py-1 rounded hover:bg-[var(--accent-color)]/10 transition-colors"
                >
                  Today
                </button>
                <button onClick={() => setCalendarDate(addMonths(calendarDate, 1))} className="btn-icon w-7 h-7">
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-2xs text-text-muted py-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {paddingDays.map((_, i) => <div key={`pad-${i}`} />)}

              {calendarDays.map(day => {
                const { created, completed, deleted } = getActivityForDay(day)
                const hasActivity = created.length > 0 || completed.length > 0 || deleted.length > 0
                const isSelected = selectedDay && isSameDay(day, selectedDay)
                const isDayToday = isToday(day)
                const isCurrentMonth = isSameMonth(day, calendarDate)

                return (
                  <motion.button
                    key={day.toString()}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'relative aspect-square rounded-lg border flex flex-col items-center justify-center transition-all duration-200 text-xs',
                      isCurrentMonth ? 'border-border bg-bg-card hover:border-border/80' : 'border-border/20 bg-bg-card/30 opacity-40',
                      isSelected && 'border-[var(--accent-color)] bg-[var(--accent-color)]/10',
                      isDayToday && !isSelected && 'border-[var(--accent-color)]/50',
                    )}
                  >
                    <span className={cn(
                      'font-medium text-xs',
                      isDayToday ? 'text-[var(--accent-color)]' : 'text-text-primary',
                      isSelected && 'text-[var(--accent-color)]',
                    )}>
                      {format(day, 'd')}
                    </span>
                    {hasActivity && (
                      <div className="flex gap-0.5 mt-0.5">
                        {completed.length > 0 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald" title={`${completed.length} completed`} />
                        )}
                        {created.length > 0 && (
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-color)', opacity: 0.7 }} title={`${created.length} created`} />
                        )}
                        {deleted.length > 0 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-rose/70" title={`${deleted.length} deleted`} />
                        )}
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-accent-emerald" />
                <span className="text-2xs text-text-muted">Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--accent-color)', opacity: 0.7 }} />
                <span className="text-2xs text-text-muted">Created</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-accent-rose/70" />
                <span className="text-2xs text-text-muted">Deleted</span>
              </div>
            </div>
          </motion.div>

          {/* Priority breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="card p-5"
          >
            <div className="flex items-center gap-2 mb-5">
              <Target size={14} className="text-text-secondary" />
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">By Priority</span>
            </div>
            <div className="space-y-3">
              {(Object.entries(stats.byPriority) as [keyof typeof stats.byPriority, number][]).map(([key, count]) => {
                const prio = PRIORITY_CONFIG[key]
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: prio.dot }} />
                        <span className="text-xs text-text-secondary">{prio.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-text-primary">{count}</span>
                        <span className="text-2xs text-text-muted">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: prio.dot }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Selected Day Detail Popup */}
        <AnimatePresence>
          {selectedDay && selectedDayActivity && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="card p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">
                    {format(selectedDay, 'EEEE, MMMM d, yyyy')}
                  </h3>
                  <p className="text-2xs text-text-muted mt-0.5">
                    {selectedDayActivity.created.length} created ·{' '}
                    {selectedDayActivity.completed.length} completed ·{' '}
                    {selectedDayActivity.deleted.length} deleted
                  </p>
                </div>
                <button onClick={() => setSelectedDay(null)} className="btn-icon w-7 h-7">
                  <X size={14} />
                </button>
              </div>

              {selectedDayActivity.created.length === 0 &&
               selectedDayActivity.completed.length === 0 &&
               selectedDayActivity.deleted.length === 0 ? (
                <div className="py-6 text-center">
                  <CalendarIcon size={28} className="text-text-muted mx-auto mb-2" />
                  <p className="text-sm text-text-muted">No activity on this day</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Completed tasks */}
                  {selectedDayActivity.completed.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-accent-emerald" />
                        <span className="text-2xs font-semibold text-text-secondary uppercase tracking-wider">
                          Completed ({selectedDayActivity.completed.length})
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {selectedDayActivity.completed.map(task => (
                          <div key={task.id} className="flex items-center gap-2 px-3 py-2 rounded-md bg-accent-emerald/5 border border-accent-emerald/20">
                            <CheckCircle2 size={13} className="text-accent-emerald flex-shrink-0" />
                            <span className="text-xs text-text-primary truncate line-through text-text-muted">{task.title}</span>
                            <span className="ml-auto text-2xs text-text-muted flex-shrink-0">
                              {task.completedAt ? format(new Date(task.completedAt), 'HH:mm') : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Created tasks */}
                  {selectedDayActivity.created.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-color)', opacity: 0.8 }} />
                        <span className="text-2xs font-semibold text-text-secondary uppercase tracking-wider">
                          Created ({selectedDayActivity.created.length})
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {selectedDayActivity.created.map(task => (
                          <div key={task.id} className="flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--accent-color)]/5 border border-[var(--accent-color)]/20">
                            <div className="w-3 h-3 rounded-full border-2 border-[var(--accent-color)]/60 flex-shrink-0" />
                            <span className="text-xs text-text-primary truncate">{task.title}</span>
                            <span className="ml-auto text-2xs text-text-muted flex-shrink-0">
                              {format(new Date(task.createdAt), 'HH:mm')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deleted tasks — dari activity log */}
                  {selectedDayActivity.deleted.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-accent-rose/70" />
                        <span className="text-2xs font-semibold text-text-secondary uppercase tracking-wider">
                          Deleted ({selectedDayActivity.deleted.length})
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {selectedDayActivity.deleted.map(log => (
                          <div key={log.id} className="flex items-center gap-2 px-3 py-2 rounded-md bg-accent-rose/5 border border-accent-rose/20">
                            <AlertTriangle size={13} className="text-accent-rose flex-shrink-0" />
                            <span className="text-xs text-text-muted truncate line-through">{log.taskTitle}</span>
                            <span className="ml-auto text-2xs text-text-muted flex-shrink-0">
                              {format(new Date(log.timestamp), 'HH:mm')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-accent-amber" />
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Pending</span>
            </div>
            <div className="text-3xl font-bold text-text-primary">{stats.pending}</div>
            <p className="text-xs text-text-muted mt-1">tasks still to do</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-accent-rose" />
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Overdue</span>
            </div>
            <div className="text-3xl font-bold text-text-primary">{stats.overdue}</div>
            <p className="text-xs text-text-muted mt-1">tasks past deadline</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Award size={14} className="text-accent-purple" />
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Favorites</span>
            </div>
            <div className="text-3xl font-bold text-text-primary">{stats.favorites}</div>
            <p className="text-xs text-text-muted mt-1">starred tasks</p>
          </motion.div>
        </div>

      </div>
    </div>
  )
}