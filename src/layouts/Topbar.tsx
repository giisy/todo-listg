import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, Moon, X, Command, ChevronDown } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { cn } from '@/utils/cn'
import { format } from 'date-fns'

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview & insights' },
  today: { title: "Today's Tasks", subtitle: format(new Date(), 'EEEE, MMMM d') },
  upcoming: { title: 'Upcoming', subtitle: 'Future tasks & deadlines' },
  projects: { title: 'Projects', subtitle: 'Manage your projects' },
  important: { title: 'Important', subtitle: 'Starred & pinned tasks' },
  categories: { title: 'Categories', subtitle: 'Organize by category' },
  notes: { title: 'Notes', subtitle: 'Quick notes & ideas' },
  pomodoro: { title: 'Pomodoro', subtitle: 'Focus timer' },
  analytics: { title: 'Analytics', subtitle: 'Track your productivity' },
  settings: { title: 'Settings', subtitle: 'Preferences & configuration' },
  trash: { title: 'Trash', subtitle: 'Deleted tasks' },
}

export default function Topbar() {
  const { state, dispatch } = useApp()
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const pageInfo = PAGE_TITLES[state.activePage] || PAGE_TITLES.dashboard

  return (
    <header className="flex-shrink-0 h-14 flex items-center px-6 gap-4 border-b border-border/50 bg-bg-primary/80 backdrop-blur-sm">
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.activePage}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            <h1 className="text-sm font-semibold text-text-primary leading-tight">{pageInfo.title}</h1>
            <p className="text-xs text-text-muted leading-tight">{pageInfo.subtitle}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Search */}
      <motion.div
        animate={{ width: isSearchFocused ? 260 : 200 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-md border bg-bg-card transition-colors duration-200',
          isSearchFocused ? 'border-accent-blue/60' : 'border-border'
        )}
      >
        <Search size={13} className="text-text-muted flex-shrink-0" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={state.searchQuery}
          onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="bg-transparent text-sm text-text-primary placeholder:text-text-muted flex-1 min-w-0 focus:outline-none"
        />
        {state.searchQuery ? (
          <button onClick={() => dispatch({ type: 'SET_SEARCH', payload: '' })} className="text-text-muted hover:text-text-primary">
            <X size={12} />
          </button>
        ) : (
          <div className="flex items-center gap-0.5 text-text-muted opacity-60">
            <Command size={10} />
            <span className="text-2xs">K</span>
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button className="btn-icon relative">
          <Bell size={15} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-accent-blue rounded-full" />
        </button>

        <button className="btn-icon">
          <Moon size={15} />
        </button>

        <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-md hover:bg-white/5 transition-all duration-150 ml-1">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white text-xs font-semibold">
            G
          </div>
          <span className="text-xs font-medium text-text-primary">{state.settings.name}</span>
          <ChevronDown size={12} className="text-text-muted" />
        </button>
      </div>
    </header>
  )
}