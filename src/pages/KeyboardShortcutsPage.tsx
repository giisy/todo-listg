import { motion } from 'framer-motion'
import { Search, Plus, Settings, X, HelpCircle, Keyboard, Maximize2 } from 'lucide-react'

interface ShortcutItem {
  icon: React.ReactNode
  label: string
  keys: string[]
}

interface ShortcutGroup {
  title: string
  items: ShortcutItem[]
}

const groups: ShortcutGroup[] = [
  {
    title: 'Navigation',
    items: [
      { icon: <Search size={14} />, label: 'Search tasks', keys: ['Alt', 'K'] },
      { icon: <HelpCircle size={14} />, label: 'Show keyboard shortcuts', keys: ['?'] },
    ],
  },
  {
    title: 'Actions',
    items: [
      { icon: <Plus size={14} />, label: 'Create new task', keys: ['Alt', 'N'] },
      { icon: <Settings size={14} />, label: 'Open settings', keys: ['Alt', ','] },
      { icon: <Maximize2 size={14} />, label: 'Toggle focus mode', keys: ['Alt', 'F'] },
    ],
  },
  {
    title: 'General',
    items: [
      { icon: <X size={14} />, label: 'Close modals/dialogs', keys: ['Escape'] },
    ],
  },
]

function KeyBadge({ label }: { label: string }) {
  return (
    <kbd className="inline-flex items-center justify-center px-2 py-1 min-w-[28px] h-7 rounded-md border border-border bg-bg-primary text-text-secondary text-2xs font-semibold font-mono shadow-sm">
      {label}
    </kbd>
  )
}

export default function KeyboardShortcutsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-xl font-bold text-text-primary">Keyboard Shortcuts</h2>
          <p className="text-xs text-text-muted mt-0.5">Speed up your workflow with keyboard shortcuts</p>
        </motion.div>

        {/* Pro tip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card p-4 flex items-start gap-3"
        >
          <div className="w-9 h-9 rounded-md bg-[var(--accent-color)]/10 flex items-center justify-center flex-shrink-0">
            <Keyboard size={16} className="text-[var(--accent-color)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary mb-1">Pro tip</p>
            <p className="text-xs text-text-muted leading-relaxed">
              Press{' '}
              <KeyBadge label="Alt" /> + <KeyBadge label="K" />{' '}
              to quickly search for tasks. Use{' '}
              <KeyBadge label="?" />{' '}
              to bring up this help page anytime.
            </p>
          </div>
        </motion.div>

        {/* Shortcut groups */}
        {groups.map((group, gi) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + gi * 0.05 }}
            className="card overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border/40">
              <span className="text-2xs font-semibold text-text-muted uppercase tracking-wider">
                {group.title}
              </span>
            </div>
            <div className="divide-y divide-border/30">
              {group.items.map((item, ii) => (
                <div
                  key={ii}
                  className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-md bg-bg-elevated flex items-center justify-center text-text-muted">
                      {item.icon}
                    </div>
                    <span className="text-sm text-text-primary">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.keys.map((key, ki) => (
                      <span key={ki} className="flex items-center gap-1">
                        <KeyBadge label={key} />
                        {ki < item.keys.length - 1 && (
                          <span className="text-2xs text-text-muted">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        <p className="text-center text-2xs text-text-muted pb-4">
          Shortcuts menggunakan tombol <strong>Alt</strong> (Windows) agar tidak konflik dengan browser.
        </p>
      </div>
    </div>
  )
}