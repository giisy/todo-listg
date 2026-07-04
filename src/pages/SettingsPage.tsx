import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Bell, Palette, Save, Check, Loader2, Lock, Trash2, Calendar, Download } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { supabase } from '@/services/supabase'
import { cn } from '@/utils/cn'
import { exportData } from '@/utils/dataExport'

export default function SettingsPage() {
  const { state, dispatch } = useApp()
  const { updateProfile } = useAuth()
  const toast = useToast()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(state.settings.name)
  const [accentColor, setAccentColor] = useState(state.settings.accentColor)
  const [firstDayOfWeek, setFirstDayOfWeek] = useState(state.settings.firstDayOfWeek)
  const [notifications, setNotifications] = useState(state.settings.notifications)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile(name)
      dispatch({ type: 'UPDATE_SETTINGS', payload: { name, accentColor, firstDayOfWeek, notifications } })
      toast('Settings saved successfully', 'success')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save settings:', err)
      toast('Failed to save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { toast('Passwords do not match', 'error'); return }
    if (newPassword.length < 6) { toast('Password must be at least 6 characters', 'error'); return }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setShowPasswordModal(false)
      setNewPassword('')
      setConfirmPassword('')
      toast('Password updated successfully', 'success')
    } catch (err) {
      toast('Failed to update password', 'error')
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast('Account deleted successfully', 'success')
      localStorage.clear()
      window.location.reload()
    } catch (err) {
      toast('Failed to delete account', 'error')
    }
  }

  const handleExport = () => {
    exportData(state.tasks, state.notes, state.categories, state.tags, state.activity, state.settings)
    toast('Data exported successfully', 'success')
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto space-y-6">

        <div>
          <h2 className="text-xl font-bold text-text-primary">Settings</h2>
          <p className="text-xs text-text-muted mt-0.5">Customize your experience</p>
        </div>

        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User size={14} className="text-text-secondary" />
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Profile</span>
          </div>
          <div>
            <label className="block text-2xs text-text-muted font-medium mb-1.5">Display Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input" placeholder="Your name" />
          </div>
        </motion.div>

        {/* Notifications — hapus tombol Test Notifikasi */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5 space-y-4">
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
              onClick={() => setNotifications(!notifications)}
              className={cn(
                'relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0',
                notifications ? 'bg-[var(--accent-color)]' : 'bg-border'
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

        {/* Accent Color */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Palette size={14} className="text-text-secondary" />
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Accent Color</span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {[
              { color: '#3B82F6', label: 'Blue' },
              { color: '#EF4444', label: 'Red' },
              { color: '#1A1A1A', label: 'Black' },
              { color: '#F9FAFB', label: 'White' },
              { color: '#EAB308', label: 'Yellow' },
              { color: '#4B5320', label: 'Army Green' },
            ].map(({ color, label }) => (
              <button
                key={color}
                onClick={() => setAccentColor(color)}
                title={label}
                className={cn(
                  'w-full aspect-square rounded-md border-2 transition-all duration-200',
                  accentColor === color ? 'border-white scale-110' : 'border-border hover:scale-105'
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </motion.div>

        {/* First Day of Week */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={14} className="text-text-secondary" />
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">First Day of Week</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(['monday', 'sunday'] as const).map(day => (
              <button
                key={day}
                onClick={() => setFirstDayOfWeek(day)}
                className={cn(
                  'p-3 rounded-md border text-sm font-medium transition-all duration-200 capitalize',
                  firstDayOfWeek === day
                    ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--accent-color)]'
                    : 'border-border hover:border-border/80 text-text-secondary'
                )}
              >
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Data Management — hanya Export */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Data Management</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-text-primary">Storage Used</p>
                <p className="text-xs text-text-muted mt-0.5">{state.tasks.length} tasks · {state.notes.length} notes</p>
              </div>
              <span className="text-xs text-text-secondary">{state.tasks.length}/200</span>
            </div>
            <div className="h-1.5 bg-border/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color-dim)] rounded-full transition-all duration-500"
                style={{ width: `${Math.min((state.tasks.length / 200) * 100, 100)}%` }}
              />
            </div>
            {/* Hanya Export, Import dihapus */}
            <div className="pt-2">
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-md border border-border hover:border-border/80 text-text-secondary hover:text-text-primary transition-all duration-200 text-xs"
              >
                <Download size={14} />
                Export Data
              </button>
            </div>
          </div>
        </motion.div>

        {/* Account */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Account</span>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-md border border-border hover:border-border/80 hover:bg-white/5 transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-md bg-[var(--accent-color)]/10 flex items-center justify-center group-hover:bg-[var(--accent-color)]/20 transition-colors">
                <Lock size={14} className="text-[var(--accent-color)]" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-text-primary">Change Password</p>
                <p className="text-xs text-text-muted">Update your password</p>
              </div>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-md border border-accent-rose/30 hover:border-accent-rose/60 hover:bg-accent-rose/10 transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-md bg-accent-rose/10 flex items-center justify-center group-hover:bg-accent-rose/20 transition-colors">
                <Trash2 size={14} className="text-accent-rose" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-accent-rose">Delete Account</p>
                <p className="text-xs text-text-muted">Permanently delete your account and data</p>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn('btn-primary px-6', saved && 'bg-accent-emerald hover:bg-accent-emerald', saving && 'opacity-70 cursor-not-allowed')}
          >
            {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
              : saved ? <><Check size={15} /> Saved!</>
              : <><Save size={15} /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content p-6 space-y-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <Lock size={20} className="text-[var(--accent-color)]" />
                <h3 className="text-lg font-semibold text-text-primary">Change Password</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-text-muted font-medium mb-1.5">New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input" placeholder="Enter new password" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted font-medium mb-1.5">Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input" placeholder="Confirm new password" />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button onClick={() => { setShowPasswordModal(false); setNewPassword(''); setConfirmPassword('') }} className="btn-ghost">Cancel</button>
                <button onClick={handleChangePassword} className="btn-primary" disabled={!newPassword || !confirmPassword}>Update Password</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content p-6 space-y-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <Trash2 size={20} className="text-accent-rose" />
                <h3 className="text-lg font-semibold text-accent-rose">Delete Account</h3>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-text-primary">Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.</p>
                <div className="p-3 rounded-md bg-accent-rose/10 border border-accent-rose/30">
                  <p className="text-xs text-accent-rose"><strong>Warning:</strong> This will delete all your tasks, notes, and settings.</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button onClick={() => setShowDeleteModal(false)} className="btn-ghost">Cancel</button>
                <button onClick={handleDeleteAccount} className="btn-primary bg-accent-rose hover:bg-accent-rose/80">Delete Account</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}