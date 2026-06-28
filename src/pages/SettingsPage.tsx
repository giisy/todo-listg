import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Timer, Palette, Save, Check, Loader2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/cn'

export default function SettingsPage() {
  const { state, dispatch } = useApp()
  const { updateProfile } = useAuth()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(state.settings.name)
  const [pomodoroWork, setPomodoroWork] = useState(state.settings.pomodoroWork)
  const [pomodoroBreak, setPomodoroBreak] = useState(state.settings.pomodoroBreak)
  const [notifications, setNotifications] = useState(state.settings.notifications)

const handleSave = async () => {
  setSaving(true)
  try {
    await updateProfile(name)
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { name, pomodoroWork, pomodoroBreak, notifications },
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  } catch (err) {
    console.error('Failed to save settings:', err)
  } finally {
    setSaving(false)
  }
}
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-text-primary">Settings</h2>
          <p className="text-xs text-text-muted mt-0.5">Customize your experience</p>
        </div>



        {/* Pomodoro */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card p-5 space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Timer size={14} className="text-text-secondary" />
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Pomodoro Timer</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-2xs text-text-muted font-medium mb-1.5">
                Work Duration (minutes)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={pomodoroWork}
                onChange={e => setPomodoroWork(Number(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-2xs text-text-muted font-medium mb-1.5">
                Break Duration (minutes)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={pomodoroBreak}
                onChange={e => setPomodoroBreak(Number(e.target.value))}
                className="input"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-md bg-accent-blue/5 border border-accent-blue/10">
            <Timer size={13} className="text-accent-blue" />
            <p className="text-xs text-text-secondary">
              Work for <span className="text-accent-blue font-medium">{pomodoroWork} min</span>, then break for <span className="text-accent-blue font-medium">{pomodoroBreak} min</span>
            </p>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5 space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Bell size={14} className="text-text-secondary" />
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Notifications</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-text-primary">Enable Notifications</p>
              <p className="text-xs text-text-muted mt-0.5">Get reminded about tasks and deadlines</p>
            </div>
            <button
            onClick={() => {
              navigator.serviceWorker.ready.then(registration => {
                registration.active?.postMessage({
                  type: 'SCHEDULE_NOTIFICATION',
                  title: '🔔 Test TaskFlow',
                  body: 'Notifikasi berhasil! ✅',
                  delay: 3000,
                })
              })
            }}
            className="w-full py-2 rounded-lg border border-accent-blue/30 text-accent-blue text-xs font-medium hover:bg-accent-blue/10 transition-colors"
          >
            🔔 Test Notifikasi (3 detik)
          </button>
            <button
              onClick={() => setNotifications(!notifications)}
              className={cn(
                'relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0',
                notifications ? 'bg-accent-blue' : 'bg-border'
              )}
            >
              <motion.div
                animate={{ x: notifications ? 20 : 2 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-5 space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Palette size={14} className="text-text-secondary" />
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Appearance</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-text-primary">Theme</p>
              <p className="text-xs text-text-muted mt-0.5">Currently using dark mode</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-md bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-medium">
                Dark
              </div>
              <div className="px-3 py-1.5 rounded-md border border-border text-text-muted text-xs font-medium opacity-50 cursor-not-allowed">
                Light
              </div>
            </div>
          </div>
        </motion.div>

        {/* Data */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-5 space-y-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Data</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-text-primary">Storage Used</p>
              <p className="text-xs text-text-muted mt-0.5">{state.tasks.length} tasks · {state.notes.length} notes</p>
            </div>
            <span className="text-xs text-text-secondary">{state.tasks.length}/200</span>
          </div>
          <div className="h-1.5 bg-border/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full transition-all duration-500"
              style={{ width: `${Math.min((state.tasks.length / 200) * 100, 100)}%` }}
            />
          </div>
        </motion.div>

        {/* Save button */}
        <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
             'btn-primary px-6',
              saved && 'bg-accent-emerald hover:bg-accent-emerald',
              saving && 'opacity-70 cursor-not-allowed'
       )}
    >
        {saving ? (
    <>
      <Loader2 size={15} className="animate-spin" />
      Saving...
    </>
  ) : saved ? (
    <>
      <Check size={15} />
      Saved!
    </>
  ) : (
    <>
      <Save size={15} />
      Save Changes
    </>
  )}
</button>
        </div>

      </div>
    </div>
  )
}