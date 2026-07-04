import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Moon, Sun, X, Command, ChevronDown,
  Menu, User, LogOut, Settings, Filter,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/services/supabase'
import { cn } from '@/utils/cn'
import { format } from 'date-fns'
import { QuickAddButton } from '@/components/QuickAddModal'
import AdvancedSearchModal from '@/components/AdvancedSearchModal'

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
  calendar: { title: 'Calendar', subtitle: 'View tasks by date' },
  recent: { title: 'Recent Activity', subtitle: 'Your latest actions' },
  profile: { title: 'Profile', subtitle: 'Your account information' },
  settings: { title: 'Settings', subtitle: 'Preferences & configuration' },
  trash: { title: 'Trash', subtitle: 'Deleted tasks' },
}

interface Props {
  onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: Props) {
  const { state, dispatch } = useApp()
  const { user } = useAuth()
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [showProfile, setShowProfile] = useState(false)


  const pageInfo = PAGE_TITLES[state.activePage] || PAGE_TITLES.dashboard
  const isLight = state.settings.theme === 'light'

  return (
    <header className="relative z-30 flex-shrink-0 h-14 flex items-center px-4 lg:px-6 gap-3 border-b border-border/50 bg-bg-primary/80 backdrop-blur-sm">
      {/* Mobile menu */}
      <button onClick={onMenuClick} className="btn-icon lg:hidden flex-shrink-0">
        <Menu size={18} />
      </button>

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
            <h1 className="text-sm font-semibold text-text-primary leading-tight truncate">{pageInfo.title}</h1>
            <p className="text-xs text-text-muted leading-tight hidden sm:block">{pageInfo.subtitle}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop Search + dropdown */}
      <div className="relative hidden md:block">
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
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
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
          <button
            onClick={() => dispatch({ type: 'TOGGLE_ADVANCED_SEARCH' })}
            className={cn('text-text-muted hover:text-text-primary transition-colors', Object.keys(state.searchFilters).length > 0 && 'text-accent-blue')}
            title="Advanced Search"
          >
            <Filter size={13} />
          </button>
        </motion.div>

        {/* Search dropdown */}
        <AnimatePresence>
          {isSearchFocused && state.searchQuery.trim() && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-1 bg-bg-card border border-border rounded-lg shadow-elevated z-50 overflow-hidden"
              style={{ minWidth: 260 }}
            >
              {(() => {
                const q = state.searchQuery.toLowerCase()
                const results = state.tasks
                  .filter(t => t.status !== 'archived' && (
                    t.title.toLowerCase().includes(q) ||
                    t.description?.toLowerCase().includes(q) ||
                    t.tags.some(tag => tag.toLowerCase().includes(q))
                  ))
                  .slice(0, 6)

                return results.length > 0 ? (
                  <>
                    <div className="px-3 py-2 border-b border-border/50">
                      <span className="text-2xs text-text-muted font-medium uppercase tracking-wider">
                        {results.length} result{results.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    {results.map(task => (
                      <button
                        key={task.id}
                        onMouseDown={() => {
                          dispatch({ type: 'SET_ACTIVE_PAGE', payload: 'today' })
                          dispatch({ type: 'SET_SEARCH', payload: task.title })
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: task.status === 'done' ? '#10B981' : '#6B7280' }} />
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm text-text-primary truncate', task.status === 'done' && 'line-through text-text-muted')}>
                            {task.title}
                          </p>
                          {task.description && <p className="text-2xs text-text-muted truncate">{task.description}</p>}
                        </div>
                        <span className="text-2xs text-text-muted flex-shrink-0 capitalize">{task.status.replace('_', ' ')}</span>
                      </button>
                    ))}
                    <button
                      onMouseDown={() => dispatch({ type: 'SET_ACTIVE_PAGE', payload: 'today' })}
                      className="w-full px-3 py-2 text-2xs text-[var(--accent-color)] hover:bg-white/5 transition-colors text-center border-t border-border/50"
                    >
                      See all results in Today →
                    </button>
                  </>
                ) : (
                  <div className="px-3 py-4 text-center">
                    <p className="text-xs text-text-muted">No tasks match "{state.searchQuery}"</p>
                  </div>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions — hapus Bell, Focus Mode, Keyboard */}
      <div className="flex items-center gap-1">
        <button onClick={() => setShowMobileSearch(!showMobileSearch)} className="btn-icon md:hidden">
          <Search size={15} />
        </button>

        {/* Dark/Light toggle */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
          className="btn-icon hidden sm:flex"
          title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {isLight ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Quick Add */}
        <QuickAddButton />

        {/* Profile dropdown */}
        <div className="relative ml-1">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-1.5 pl-2 pr-2 lg:pr-3 py-1.5 rounded-md hover:bg-white/5 transition-all duration-150"
          >
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
              style={{ background: `linear-gradient(to bottom right, var(--accent-color), var(--accent-color-dim))` }}
            >
              {state.settings.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-medium text-text-primary hidden lg:block">{state.settings.name}</span>
            <ChevronDown size={12} className={cn('text-text-muted hidden lg:block transition-transform duration-200', showProfile && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowProfile(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-10 z-20 w-48 bg-bg-card border border-border rounded-lg shadow-elevated overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border/50">
                    <p className="text-xs font-semibold text-text-primary truncate">{state.settings.name}</p>
                    <p className="text-2xs text-text-muted truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { dispatch({ type: 'SET_ACTIVE_PAGE', payload: 'profile' }); setShowProfile(false) }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                    >
                      <User size={13} /> Profile
                    </button>
                    <button
                      onClick={() => { dispatch({ type: 'SET_ACTIVE_PAGE', payload: 'settings' }); setShowProfile(false) }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                    >
                      <Settings size={13} /> Settings
                    </button>
                  </div>
                  <div className="border-t border-border/50 py-1">
                    <button
                      onClick={() => supabase.auth.signOut()}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs text-accent-rose hover:bg-accent-rose/10 transition-colors"
                    >
                      <LogOut size={13} /> Log out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile search bar */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-14 left-0 right-0 p-3 bg-bg-primary border-b border-border z-10 md:hidden"
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-bg-card">
              <Search size={13} className="text-text-muted" />
              <input
                autoFocus
                type="text"
                placeholder="Search tasks..."
                value={state.searchQuery}
                onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
                className="bg-transparent text-sm text-text-primary placeholder:text-text-muted flex-1 focus:outline-none"
              />
              {state.searchQuery && (
                <button onClick={() => dispatch({ type: 'SET_SEARCH', payload: '' })}>
                  <X size={12} className="text-text-muted" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AdvancedSearchModal />
    </header>
  )
}