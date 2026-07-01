import { motion, AnimatePresence } from 'framer-motion'
import { X, Maximize2, Play } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { cn } from '@/utils/cn'

export default function FocusMode({ children, onExit }: { children: React.ReactNode; onExit: () => void }) {
  const { state } = useApp()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-bg-primary z-50 flex flex-col"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="h-16 border-b border-border/30 flex items-center justify-between px-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-emerald/10 flex items-center justify-center">
            <Maximize2 size={18} className="text-accent-emerald" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary">Focus Mode</h1>
            <div className="flex items-center gap-1.5 text-xs text-accent-emerald">
              <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
              <span>Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-text-muted px-3 py-1.5 rounded-md bg-bg-card border border-border">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-bg-primary border border-border rounded text-text-primary font-medium">Esc</kbd>
            <span>to exit</span>
          </div>
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:border-border/80 text-text-muted hover:text-text-primary transition-all duration-200"
          >
            <X size={14} />
            <span className="text-sm">Exit Focus</span>
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="flex-1 overflow-hidden"
      >
        {children}
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="h-12 border-t border-border/30 flex items-center justify-between px-6"
      >
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
            <span>Focus Mode</span>
          </div>
          <span>•</span>
          <span>{state.activePage.charAt(0).toUpperCase() + state.activePage.slice(1)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>No distractions</span>
          <span>•</span>
          <span>Productivity mode</span>
        </div>
      </motion.div>
    </motion.div>
  )
}