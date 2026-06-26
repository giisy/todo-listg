import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isToday, isSameMonth,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Task } from '@/types'
import { cn } from '@/utils/cn'

export default function MiniCalendar({ tasks }: { tasks: Task[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  })

  const taskDates = tasks
    .filter(t => t.dueDate && t.status !== 'done')
    .map(t => new Date(t.dueDate!).toDateString())

  const doneDates = tasks
    .filter(t => t.status === 'done' && t.completedAt)
    .map(t => new Date(t.completedAt!).toDateString())

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-text-primary">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            className="btn-icon w-6 h-6"
          >
            <ChevronLeft size={12} />
          </button>
          <button
            onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            className="btn-icon w-6 h-6"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
          <div key={d} className="text-center text-2xs text-text-muted font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day, idx) => {
          const dateStr = day.toDateString()
          const hasTasks = taskDates.includes(dateStr)
          const hasDone = doneDates.includes(dateStr)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isCurrentDay = isToday(day)

          return (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.1 }}
              className={cn(
                'relative flex flex-col items-center justify-center w-7 h-7 mx-auto rounded-md text-2xs font-medium transition-all duration-100',
                !isCurrentMonth && 'text-text-muted/30',
                isCurrentMonth && !isCurrentDay && 'text-text-secondary hover:bg-white/5',
                isCurrentDay && 'bg-accent-blue text-white shadow-glow-sm',
              )}
            >
              {day.getDate()}
              {(hasTasks || hasDone) && !isCurrentDay && (
                <div className="absolute bottom-0.5 flex gap-0.5">
                  {hasTasks && <span className="w-1 h-1 rounded-full bg-accent-amber" />}
                  {hasDone && <span className="w-1 h-1 rounded-full bg-accent-emerald" />}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-1 border-t border-border/30">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-amber" />
          <span className="text-2xs text-text-muted">Pending</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald" />
          <span className="text-2xs text-text-muted">Completed</span>
        </div>
      </div>
    </div>
  )
}