import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Save, Check, Loader2, Camera } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/cn'

export default function ProfilePage() {
  const { state, dispatch } = useApp()
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState(state.settings.name)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile(name)
      dispatch({ type: 'UPDATE_SETTINGS', payload: { name } })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save profile:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-text-primary">Profile</h2>
          <p className="text-xs text-text-muted mt-0.5">Manage your account information</p>
        </div>

        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white text-3xl font-bold shadow-glow-sm">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-bg-card border border-border rounded-full flex items-center justify-center text-text-muted hover:text-text-primary cursor-pointer transition-colors">
              <Camera size={13} />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-text-primary">{state.settings.name}</p>
            <p className="text-xs text-text-muted">{user?.email}</p>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card p-5 space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <User size={14} className="text-text-secondary" />
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Account Info</span>
          </div>

          {/* Name */}
          <div>
            <label className="block text-2xs text-text-muted font-medium mb-1.5">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input"
              placeholder="Your name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-2xs text-text-muted font-medium mb-1.5">Email</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-bg-card/50 text-text-muted text-sm">
              <Mail size={13} />
              <span className="truncate">{user?.email}</span>
            </div>
            <p className="text-2xs text-text-muted mt-1">Email cannot be changed</p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Stats</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Tasks', value: state.tasks.length },
              { label: 'Completed', value: state.tasks.filter(t => t.status === 'done').length },
              { label: 'Notes', value: state.notes.length },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-text-primary">{s.value}</p>
                <p className="text-2xs text-text-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Save */}
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
              <><Loader2 size={15} className="animate-spin" />Saving...</>
            ) : saved ? (
              <><Check size={15} />Saved!</>
            ) : (
              <><Save size={15} />Save Changes</>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}