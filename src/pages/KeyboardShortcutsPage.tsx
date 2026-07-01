import { motion } from 'framer-motion'
import { Command, Keyboard, Search, Plus, Settings, X, HelpCircle } from 'lucide-react'

const SHORTCUTS = [
  {
    category: 'Navigation',
    shortcuts: [
      { key: '⌘ K', label: 'Search tasks', icon: Search },
      { key: '?', label: 'Show keyboard shortcuts', icon: HelpCircle },
    ],
  },
  {
    category: 'Actions',
    shortcuts: [
      { key: '⌘ N', label: 'Create new task', icon: Plus },
      { key: '⌘ ,', label: 'Open settings', icon: Settings },
    ],
  },
  {
    category: 'General',
    shortcuts: [
      { key: 'Escape', label: 'Close modals/dialogs', icon: X },
    ],
  },
]

export default function KeyboardShortcutsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-text-primary">Keyboard Shortcuts</h2>
          <p className="text-xs text-text-muted mt-0.5">Speed up your workflow with keyboard shortcuts</p>
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 flex items-start gap-3"
        >
          <div className="w-8 h-8 rounded-md bg-[var(--accent-color-glow)] flex items-center justify-center flex-shrink-0">
            <Keyboard size={16} className="text-[var(--accent-color)]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary">Pro tip</p>
            <p className="text-xs text-text-muted mt-1">
              Press <kbd className="px-1.5 py-0.5 rounded bg-bg-secondary border border-border text-2xs font-mono">⌘ K</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-bg-secondary border border-border text-2xs font-mono">Ctrl K</kbd> to quickly search for tasks. Use <kbd className="px-1.5 py-0.5 rounded bg-bg-secondary border border-border text-2xs font-mono">?</kbd> to bring up this help page anytime.
            </p>
          </div>
        </motion.div>

        {/* Shortcuts List */}
        {SHORTCUTS.map((group, groupIndex) => (
          <motion.div
            key={group.category}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 + 0.1 }}
            className="card p-5 space-y-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{group.category}</span>
            </div>

            <div className="space-y-2">
              {group.shortcuts.map((shortcut, shortcutIndex) => {
                const Icon = shortcut.icon
                return (
                  <div
                    key={shortcutIndex}
                    className="flex items-center justify-between py-2.5 px-3 rounded-md bg-bg-secondary/50 border border-border/50 hover:border-border transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-[var(--accent-color-glow)] flex items-center justify-center flex-shrink-0">
                        <Icon size={14} className="text-[var(--accent-color)]" />
                      </div>
                      <span className="text-sm font-medium text-text-primary">{shortcut.label}</span>
                    </div>
                    <kbd className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-bg-secondary border border-border text-xs font-mono text-text-secondary">
                      <Command size={10} />
                      <span>{shortcut.key.replace('⌘ ', '')}</span>
                    </kbd>
                  </div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}