import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useApp } from '@/context/AppContext'
import {
  LayoutDashboard, CalendarDays, Calendar,
  Plus, BarChart3, Settings,
} from 'lucide-react'
import type { NavPage } from '@/types'
import { cn } from '@/utils/cn'
import { useNotifications } from '@/hooks/useNotifications'

const bottomNav = [
  { id: 'dashboard' as NavPage, icon: LayoutDashboard, label: 'Home' },
  { id: 'today' as NavPage, icon: CalendarDays, label: 'Today' },
  { id: 'upcoming' as NavPage, icon: Calendar, label: 'Upcoming' },
  { id: 'analytics' as NavPage, icon: BarChart3, label: 'Analytics' },
  { id: 'settings' as NavPage, icon: Settings, label: 'Settings' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  useNotifications()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-primary">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar — hidden on mobile unless open */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-30 lg:relative lg:flex lg:flex-shrink-0 transition-transform duration-300 ease-in-out',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <Sidebar onClose={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Page content — add pb-20 on mobile for bottom nav */}
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.activePage}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="h-full overflow-y-auto pb-20 lg:pb-0"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom Navigation — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-20 lg:hidden">
        <div className="bg-bg-secondary/90 backdrop-blur-md border-t border-border/50 px-2 pb-safe">
          <div className="flex items-center justify-around py-1">
            {bottomNav.map(item => {
              const Icon = item.icon
              const isActive = state.activePage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => dispatch({ type: 'SET_ACTIVE_PAGE', payload: item.id })}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-150 min-w-[56px]',
                    isActive ? 'text-accent-blue' : 'text-text-muted'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150',
                    isActive ? 'bg-accent-blue/15' : 'bg-transparent'
                  )}>
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="text-2xs font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}