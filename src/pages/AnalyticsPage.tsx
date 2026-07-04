import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, subDays, isToday, isSameDay } from 'date-fns'
import {
  CheckCircle2, Clock, AlertTriangle, TrendingUp,
  Target, Flame, Award, BarChart3,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { PRIORITY_CONFIG } from '@/constants'
import { cn } from '@/utils/cn'

export default function AnalyticsPage() {
  const { state } = useApp()
  const { tasks } = state

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

    // Fix bug duplikasi: hitung dari state.tasks langsung, bukan activity logs
    // completedAt di-set saat toggle done, dihapus saat toggle balik — data selalu akurat
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i)
      const created = tasks.filter(t =>
        isSameDay(new Date(t.createdAt), date)
      ).length
      const done = tasks.filter(t =>
        t.completedAt && isSameDay(new Date(t.completedAt), date)
      ).length
      return { date, created, done }
    })

    const byPriority = {
      urgent: tasks.filter(t => t.priority === 'urgent').length,
      high:   tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low:    tasks.filter(t => t.priority === 'low').length,
    }

    // Streak: hari berturut-turut dengan minimal 1 task selesai
    let streak = 0
    for (let i = 0; i < 30; i++) {
      const date = subDays(new Date(), i)
      const hasCompleted = tasks.some(t =>
        t.completedAt && isSameDay(new Date(t.completedAt), date)
      )
      if (hasCompleted) streak++
      else break
    }

    return { total, completed, pending, overdue, completionRate, favorites, last7Days, byPriority, streak }
  }, [tasks])

  // Fix: pakai nilai max yang realistis supaya bar tidak flat
  const maxBar = Math.max(...stats.last7Days.map(d => Math.max(d.created, d.done)), 1)

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
            { label: 'Total Tasks',      value: stats.total,           icon: <Target size={16} />,      color: 'text-[var(--accent-color)]',  bg: 'bg-[var(--accent-color)]/10' },
            { label: 'Completed',        value: stats.completed,       icon: <CheckCircle2 size={16} />, color: 'text-accent-emerald',         bg: 'bg-accent-emerald/10' },
            { label: 'Completion Rate',  value: `${stats.completionRate}%`, icon: <TrendingUp size={16} />,  color: 'text-accent-purple',          bg: 'bg-accent-purple/10' },
            { label: 'Current Streak',   value: `${stats.streak}d`,   icon: <Flame size={16} />,        color: 'text-accent-amber',           bg: 'bg-accent-amber/10' },
          ].map(s => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
              <div className={cn('w-9 h-9 rounded-md flex items-center justify-center', s.bg, s.color)}>
                {s.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">{s.value}</div>
                <div className="text-xs text-text-secondary mt-0.5">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Activity chart */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-2 card p-5"
          >
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 size={14} className="text-text-secondary" />
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Last 7 Days</span>
            </div>

            {/* Fix: h-52 supaya bar tinggi dan proporsional, bukan flat */}
            <div className="flex items-end justify-between gap-2 h-52">
              {stats.last7Days.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex items-end justify-center gap-0.5 h-44">
                    {/* Created bar — accent color */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.created / maxBar) * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                      className="flex-1 rounded-t-sm min-h-[2px]"
                      style={{ background: 'var(--accent-color)', opacity: 0.45 }}
                      title={`${day.created} created`}
                    />
                    {/* Done bar — emerald */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.done / maxBar) * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 + 0.1, ease: 'easeOut' }}
                      className="flex-1 bg-accent-emerald rounded-t-sm min-h-[2px]"
                      style={{ opacity: 0.7 }}
                      title={`${day.done} completed`}
                    />
                  </div>
                  <span className="text-2xs text-text-muted">{format(day.date, 'EEE')}</span>
                </div>
              ))}
            </div>

            {/* Fix: axis line pakai border-white/10 supaya tidak terlalu kontras di dark mode */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ background: 'var(--accent-color)', opacity: 0.5 }} />
                <span className="text-2xs text-text-muted">Created</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm inline-block bg-accent-emerald/70" />
                <span className="text-2xs text-text-muted">Completed</span>
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