import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CalendarDays, Calendar, FolderOpen,
  Star, Tag, BookOpen, Timer, BarChart3, Settings,
  LogOut, ChevronLeft, ChevronRight, HardDrive, Trash2,
  Plus, Zap,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { supabase } from '@/services/supabase'
import type { NavPage } from '@/types'
import { cn } from '@/utils/cn'

interface NavItem {
  id: NavPage
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'today', label: 'Today', icon: CalendarDays },
  { id: 'upcoming', label: 'Upcoming', icon: Calendar },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'important', label: 'Important', icon: Star },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'notes', label: 'Notes', icon: BookOpen },
  { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
]

const bottomItems: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'trash', label: 'Trash', icon: Trash2 },
]

export default function Sidebar() {
  const { state, dispatch } = useApp()
  const { isSidebarCollapsed, activePage, tasks, settings } = state

  const todayCount = tasks.filter(t => {
    if (t.status === 'done' || t.status === 'archived') return false
    if (!t.dueDate) return false
    return new Date(t.dueDate).toDateString() === new Date().toDateString()
  }).length

  const importantCount = tasks.filter(t => t.isFavorite && t.status !== 'done').length

  const completedToday = tasks.filter(t => {
    if (t.status !== 'done' || !t.completedAt) return false
    return new Date(t.completedAt).toDateString() === new Date().toDateString()
  }).length

  const totalToday = tasks.filter(t => {
    if (!t.dueDate) return false
    return new Date(t.dueDate).toDateString() === new Date().toDateString()
  }).length

  return (
    <motion.aside
      animate={{ width: isSidebarCollapsed ? 60 : 256 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-full bg-bg-secondary border-r border-border/50 overflow-hidden flex-shrink-0"
    >
      {/* Collapse toggle */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
        className="absolute -right-3 top-6 z-10 w-6 h-6 bg-bg-card border border-border rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary transition-all duration-150 shadow-elevated"
      >
        {isSidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* User */}
      <div className={cn('flex-shrink-0 border-b border-border/50', isSidebarCollapsed ? 'p-3' : 'p-4')}>
        <div className={cn('flex items-center', isSidebarCollapsed ? 'justify-center' : 'gap-3')}>
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white font-semibold text-sm shadow-glow-sm">
              {settings.name.charAt(0).toUpperCase()}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent-emerald rounded-full border-2 border-bg-secondary" />
          </div>
          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="min-w-0 flex-1"
              >
                <p className="text-sm font-semibold text-text-primary truncate">{settings.name}</p>
                <p className="text-xs text-text-secondary">Hi, {settings.name.split(' ')[0]} 👋</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {!isSidebarCollapsed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dispatch({ type: 'SET_ACTIVE_PAGE', payload: 'today' })}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-accent-blue/10 hover:bg-accent-blue/20 border border-accent-blue/20 hover:border-accent-blue/40 text-accent-blue text-xs font-medium transition-all duration-150"
            >
              <Plus size={13} strokeWidth={2.5} />
              New Task
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        <AnimatePresence>
          {!isSidebarCollapsed && totalToday > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-1 mb-2"
            >
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-2xs text-text-muted font-medium uppercase tracking-wider">Today</span>
                <span className="text-2xs text-text-secondary">{completedToday}/{totalToday}</span>
              </div>
              <div className="h-1 bg-border/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalToday > 0 ? (completedToday / totalToday) * 100 : 0}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.id
          const badge = item.id === 'today' ? todayCount : item.id === 'important' ? importantCount : undefined

          return (
            <motion.button
              key={item.id}
              whileHover={{ x: isSidebarCollapsed ? 0 : 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => dispatch({ type: 'SET_ACTIVE_PAGE', payload: item.id })}
              className={cn('nav-item', isSidebarCollapsed && 'justify-center px-0', isActive && 'active')}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className="flex-shrink-0" />
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 truncate">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!isSidebarCollapsed && badge && badge > 0 && (
                <span className="ml-auto min-w-[18px] h-[18px] bg-accent-blue/15 text-accent-blue text-2xs font-semibold rounded-full flex items-center justify-center px-1.5">
                  {badge}
                </span>
              )}
            </motion.button>
          )
        })}

        <div className="divider" />

        {bottomItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.id
          return (
            <motion.button
              key={item.id}
              whileHover={{ x: isSidebarCollapsed ? 0 : 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => dispatch({ type: 'SET_ACTIVE_PAGE', payload: item.id })}
              className={cn('nav-item', isSidebarCollapsed && 'justify-center px-0', isActive && 'active')}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <Icon size={16} strokeWidth={2} className="flex-shrink-0" />
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </nav>

      {/* Footer */}
      <AnimatePresence>
        {!isSidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-shrink-0 p-4 border-t border-border/50 space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-text-muted">
                  <HardDrive size={11} />
                  <span className="text-2xs font-medium">Storage</span>
                </div>
                <span className="text-2xs text-text-muted">{tasks.length} / 200</span>
              </div>
              <div className="h-1 bg-border/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((tasks.length / 200) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-text-muted">
                <Zap size={10} />
                <span className="text-2xs">v1.0.0</span>
              </div>
              <button
                onClick={() => supabase.auth.signOut()}
                className="flex items-center gap-1.5 text-text-muted hover:text-accent-rose text-2xs transition-colors duration-150"
              >
                <LogOut size={11} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  )
}