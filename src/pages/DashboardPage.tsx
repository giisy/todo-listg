import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, isToday, isPast, isFuture, isTomorrow } from 'date-fns'
import {
  CheckCircle2, Circle, Clock, AlertTriangle, TrendingUp,
  Star, Pin, Flame, CalendarDays, Activity, ChevronRight,
  Plus, Target, Zap,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { MOTIVATIONAL_QUOTES, PRIORITY_CONFIG } from '@/constants'
import { cn } from '@/utils/cn'
import type { Task } from '@/types'
import MiniCalendar from '@/components/common/MiniCalendar'

const item = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

export default function DashboardPage() {
  const { state, dispatch } = useApp()
  const { tasks, activity, settings } = state

  const today = new Date()
  const quote = MOTIVATIONAL_QUOTES[today.getDate() % MOTIVATIONAL_QUOTES.length]

  const stats = useMemo(() => {
    const todayTasks = tasks.filter(t => t.dueDate && isToday(new Date(t.dueDate)))
    const completed = tasks.filter(t => t.status === 'done' && t.completedAt && isToday(new Date(t.completedAt)))
    const pending = tasks.filter(t => t.status !== 'done' && t.status !== 'archived')
    const overdue = tasks.filter(t => t.status !== 'done' && t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)))
    const progress = todayTasks.length > 0 ? Math.round((completed.length / todayTasks.length) * 100) : 0
    return { todayTasks, completed, pending, overdue, progress }
  }, [tasks])

  const pinnedTasks = tasks.filter(t => t.isPinned && t.status !== 'done').slice(0, 3)
  const recentTasks = tasks
    .filter(t => t.status !== 'archived')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
  const upcomingDeadlines = tasks
    .filter(t => t.dueDate && t.status !== 'done' && t.status !== 'archived')
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5)

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-[1400px] mx-auto space-y-6">

        {/* Hero */}
        <motion.div variants={item} initial="initial" animate="animate" className="relative overflow-hidden card p-6">
          <div className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-bl from-accent-blue/10 to-transparent pointer-events-none" />
          <div className="relative flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xs font-medium text-accent-blue uppercase tracking-widest">
                  Good {getGreeting()}
                </span>
                <span className="text-text-muted text-2xs">·</span>
                <span className="text-2xs text-text-muted">{format(today, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Hey, {settings.name} 👋
              </h2>
              <p className="text-sm text-text-secondary italic">"{quote}"</p>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => dispatch({ type: 'SET_ACTIVE_PAGE', payload: 'today' })}
                  className="btn-primary text-xs py-2"
                >
                  <CalendarDays size={13} />
                  View Today's Tasks
                </button>
                <button
                  onClick={() => dispatch({ type: 'SET_ACTIVE_PAGE', payload: 'analytics' })}
                  className="btn-ghost text-xs py-2"
                >
                  <TrendingUp size={13} />
                  See Analytics
                </button>
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              <ProgressRing progress={stats.progress} size={88} strokeWidth={5} />
              <span className="text-2xs text-text-muted">Today</span>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Today's Tasks", value: stats.todayTasks.length, icon: <Target size={16} />, iconColor: 'text-accent-blue', iconBg: 'bg-accent-blue/10' },
            { label: 'Completed', value: stats.completed.length, icon: <CheckCircle2 size={16} />, iconColor: 'text-accent-emerald', iconBg: 'bg-accent-emerald/10' },
            { label: 'Pending', value: stats.pending.length, icon: <Clock size={16} />, iconColor: 'text-accent-amber', iconBg: 'bg-accent-amber/10' },
            { label: 'Overdue', value: stats.overdue.length, icon: <AlertTriangle size={16} />, iconColor: 'text-accent-rose', iconBg: 'bg-accent-rose/10' },
          ].map((s) => (
            <motion.div key={s.label} variants={item} initial="initial" animate="animate" className="stat-card">
              <div className={cn('w-9 h-9 rounded-md flex items-center justify-center', s.iconBg, s.iconColor)}>
                {s.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">{s.value}</div>
                <div className="text-xs text-text-secondary mt-0.5">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Pinned */}
            {pinnedTasks.length > 0 && (
              <motion.div variants={item} initial="initial" animate="animate" className="card p-5">
                <SectionHeader icon={<Pin size={14} />} label="Pinned" action="View all" onAction={() => dispatch({ type: 'SET_ACTIVE_PAGE', payload: 'important' })} />
                <div className="mt-3 space-y-1">
                  {pinnedTasks.map(task => <TaskRow key={task.id} task={task} />)}
                </div>
              </motion.div>
            )}

            {/* Recent Tasks */}
            <motion.div variants={item} initial="initial" animate="animate" className="card p-5">
              <SectionHeader
                icon={<Flame size={14} />}
                label="Recent Tasks"
                action="All tasks"
                onAction={() => dispatch({ type: 'SET_ACTIVE_PAGE', payload: 'today' })}
              />
              {recentTasks.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-3">
                  <Zap size={24} className="text-accent-blue/50" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-text-secondary">No tasks yet</p>
                    <p className="text-xs text-text-muted">Add your first task to get started</p>
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'SET_ACTIVE_PAGE', payload: 'today' })}
                    className="btn-primary text-xs py-1.5 mt-1"
                  >
                    <Plus size={12} /> Add Task
                  </button>
                </div>
              ) : (
                <div className="mt-3 space-y-1">
                  {recentTasks.map(task => <TaskRow key={task.id} task={task} />)}
                </div>
              )}
            </motion.div>

            {/* Activity */}
            <motion.div variants={item} initial="initial" animate="animate" className="card p-5">
              <SectionHeader icon={<Activity size={14} />} label="Recent Activity" />
              {activity.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-6">No activity yet</p>
              ) : (
                <div className="mt-3 space-y-1">
                  {activity.slice(0, 6).map(log => (
                    <div key={log.id} className="flex items-start gap-3 py-2">
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                        log.type === 'completed' && 'bg-accent-emerald/15 text-accent-emerald',
                        log.type === 'created' && 'bg-accent-blue/15 text-accent-blue',
                        log.type === 'deleted' && 'bg-accent-rose/15 text-accent-rose',
                        log.type === 'updated' && 'bg-accent-amber/15 text-accent-amber',
                      )}>
                        {log.type === 'completed' && <CheckCircle2 size={12} />}
                        {log.type === 'created' && <Plus size={12} />}
                        {log.type === 'deleted' && <AlertTriangle size={12} />}
                        {log.type === 'updated' && <TrendingUp size={12} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-primary truncate">
                          <span className="capitalize text-text-secondary">{log.type}</span>{' '}
                          <span className="font-medium">"{log.taskTitle}"</span>
                        </p>
                        <p className="text-2xs text-text-muted">{format(new Date(log.timestamp), 'MMM d, h:mm a')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right panel */}
          <div className="space-y-5">
            <motion.div variants={item} initial="initial" animate="animate" className="card p-5">
              <SectionHeader icon={<CalendarDays size={14} />} label="Calendar" />
              <div className="mt-3">
                <MiniCalendar tasks={tasks} />
              </div>
            </motion.div>

            <motion.div variants={item} initial="initial" animate="animate" className="card p-5">
              <SectionHeader
                icon={<Clock size={14} />}
                label="Upcoming Deadlines"
                action="See all"
                onAction={() => dispatch({ type: 'SET_ACTIVE_PAGE', payload: 'upcoming' })}
              />
              {upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-4">No upcoming deadlines</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {upcomingDeadlines.map(task => {
                    const due = new Date(task.dueDate!)
                    const isOverdue = isPast(due) && !isToday(due)
                    const isTodayTask = isToday(due)
                    const isTomorrowTask = isTomorrow(due)
                    let label = format(due, 'MMM d')
                    if (isTodayTask) label = 'Today'
                    else if (isTomorrowTask) label = 'Tomorrow'
                    return (
                      <div key={task.id} className="flex items-center gap-3 py-1.5">
                        <span className="priority-dot" style={{ background: PRIORITY_CONFIG[task.priority].dot }} />
                        <p className="text-xs text-text-primary truncate flex-1">{task.title}</p>
                        <span className={cn(
                          'text-2xs font-medium flex-shrink-0',
                          isOverdue ? 'text-accent-rose' : isTodayTask ? 'text-accent-amber' : 'text-text-muted'
                        )}>
                          {label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProgressRing({ progress, size, strokeWidth }: { progress: number; size: number; strokeWidth: number }) {
  const r = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * r
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(42,47,56,0.8)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="url(#grad)" strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (progress / 100) * circumference }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-text-primary">{progress}%</span>
      </div>
    </div>
  )
}

function SectionHeader({ icon, label, action, onAction }: {
  icon: React.ReactNode
  label: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-text-secondary">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      {action && (
        <button onClick={onAction} className="text-2xs text-text-muted hover:text-accent-blue transition-colors flex items-center gap-1">
          {action} <ChevronRight size={11} />
        </button>
      )}
    </div>
  )
}

function TaskRow({ task }: { task: Task }) {
  const { dispatch } = useApp()
  const isDone = task.status === 'done'
  return (
    <motion.div
      whileHover={{ x: 2 }}
      className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-white/3 transition-all duration-150 group"
    >
      <button
        onClick={() => dispatch({ type: 'TOGGLE_TASK', payload: task.id })}
        className="flex-shrink-0 hover:scale-110 transition-transform"
      >
        {isDone
          ? <CheckCircle2 size={15} className="text-accent-emerald" />
          : <Circle size={15} className="text-text-muted group-hover:text-text-secondary transition-colors" />
        }
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium truncate', isDone ? 'line-through text-text-muted' : 'text-text-primary')}>
          {task.title}
        </p>
        {task.dueDate && (
          <p className="text-2xs text-text-muted">{format(new Date(task.dueDate), 'MMM d')}</p>
        )}
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="priority-dot" style={{ background: PRIORITY_CONFIG[task.priority].dot }} />
        {task.isFavorite && <Star size={11} className="text-accent-amber fill-current" />}
      </div>
    </motion.div>
  )
}