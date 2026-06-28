import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { CheckCircle2, Plus, AlertTriangle, TrendingUp, Activity } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { cn } from '@/utils/cn'

export default function RecentPage() {
  const { state } = useApp()
  const { activity } = state

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-text-primary">Recent Activity</h2>
          <p className="text-xs text-text-muted mt-0.5">{activity.length} activities recorded</p>
        </div>

        {/* Activity list */}
        {activity.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <Activity size={32} className="text-text-muted/30" />
            <p className="text-sm text-text-muted">No activity yet</p>
          </div>
        ) : (
          <div className="card divide-y divide-border/50">
            {activity.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-start gap-3 p-4"
              >
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                  log.type === 'completed' && 'bg-accent-emerald/15 text-accent-emerald',
                  log.type === 'created' && 'bg-accent-blue/15 text-accent-blue',
                  log.type === 'deleted' && 'bg-accent-rose/15 text-accent-rose',
                  log.type === 'updated' && 'bg-accent-amber/15 text-accent-amber',
                  log.type === 'archived' && 'bg-text-muted/15 text-text-muted',
                )}>
                  {log.type === 'completed' && <CheckCircle2 size={13} />}
                  {log.type === 'created' && <Plus size={13} />}
                  {log.type === 'deleted' && <AlertTriangle size={13} />}
                  {log.type === 'updated' && <TrendingUp size={13} />}
                  {log.type === 'archived' && <Activity size={13} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">
                    <span className="capitalize text-text-secondary">{log.type}</span>{' '}
                    <span className="font-medium">"{log.taskTitle}"</span>
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {format(new Date(log.timestamp), 'EEEE, MMM d · h:mm a')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}