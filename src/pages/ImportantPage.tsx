import { motion } from 'framer-motion'
import { Star, Pin } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/utils/cn'
import type { Task } from '@/types'
import SortableTaskList from '@/components/SortableTaskList'

export default function ImportantPage() {
  const { state, dispatch } = useApp()
  const toast = useToast()

  const favorites = state.tasks
    .filter(t => t.isFavorite && t.status !== 'archived')
    .sort((a, b) => a.order - b.order)
  const pinned = state.tasks
    .filter(t => t.isPinned && !t.isFavorite && t.status !== 'archived')
    .sort((a, b) => a.order - b.order)

  const handleDeleteTask = (taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId })
    toast('Task deleted', 'info')
  }

  const Section = ({ title, icon, tasks }: { title: string; icon: React.ReactNode; tasks: Task[] }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-text-secondary">{icon}</span>
        <span className="text-sm font-semibold text-text-primary">{title}</span>
        <span className="text-2xs text-text-muted bg-white/5 px-2 py-0.5 rounded-full">{tasks.length}</span>
      </div>
      <SortableTaskList tasks={tasks} onTaskDelete={handleDeleteTask} />
    </div>
  )

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Important</h2>
          <p className="text-xs text-text-muted mt-0.5">Your starred and pinned tasks</p>
        </div>
        <Section
          title="Starred"
          icon={<Star size={15} className="text-accent-amber fill-current" />}
          tasks={favorites}
        />
        <Section
          title="Pinned"
          icon={<Pin size={15} className="text-accent-blue" />}
          tasks={pinned}
        />
      </div>
    </div>
  )
}