import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, Moon, X, Command, ChevronDown, Menu, User, LogOut, Settings } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/services/supabase'
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

  return (
    <header className="flex-shrink-0 h-14 flex items-center px-4 lg:px-6 gap-3 border-b border-border/50 bg-bg-primary/80 backdrop-blur-sm">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="btn-icon lg:hidden flex-shrink-0"
      >
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

      {/* Desktop Search */}
      <motion.div
        animate={{ width: isSearchFocused ? 260 : 200 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border bg-bg-card transition-colors duration-200',
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
        {/* Mobile search toggle */}
        <button
          onClick={() => setShowMobileSearch(!showMobileSearch)}
          className="btn-icon md:hidden"
        >
          <Search size={15} />
        </button>

        <button className="btn-icon relative hidden sm:flex">
          <Bell size={15} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-accent-blue rounded-full" />
        </button>

        <button className="btn-icon hidden sm:flex">
          <Moon size={15} />
        </button>

        <div className="relative ml-1">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-1.5 pl-2 pr-2 lg:pr-3 py-1.5 rounded-md hover:bg-white/5 transition-all duration-150"
          >
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
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
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-border/50">
                    <p className="text-xs font-semibold text-text-primary truncate">{state.settings.name}</p>
                    <p className="text-2xs text-text-muted truncate">{user?.email}</p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        dispatch({ type: 'SET_ACTIVE_PAGE', payload: 'profile' })
                        setShowProfile(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                    >
                      <User size={13} />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        dispatch({ type: 'SET_ACTIVE_PAGE', payload: 'settings' })
                        setShowProfile(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                    >
                      <Settings size={13} />
                      Settings
                    </button>
                  </div>

                  <div className="border-t border-border/50 py-1">
                    <button
                      onClick={() => supabase.auth.signOut()}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs text-accent-rose hover:bg-accent-rose/10 transition-colors"
                    >
                      <LogOut size={13} />
                      Log out
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
    </header>
  )
}