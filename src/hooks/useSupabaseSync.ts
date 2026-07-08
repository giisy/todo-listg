import { useEffect, useRef } from 'react'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import {
  fetchTasks, insertTask, updateTask, deleteTask,
  fetchNotes, insertNote, updateNote, deleteNote,
  fetchActivity, insertActivity,
  fetchProfile, upsertProfile,
} from '@/services/taskService'
import type { Task, Note, ActivityLog } from '@/types'

export function useSupabaseSync() {
  const { state, dispatch } = useApp()
  const { user } = useAuth()
  const prevTasks = useRef<Task[]>([])
  const prevNotes = useRef<Note[]>([])
  const prevActivity = useRef<ActivityLog[]>([])
  const initialized = useRef(false)

  // Reset saat logout
  useEffect(() => {
    if (!user) {
      initialized.current = false
      prevTasks.current = []
      prevNotes.current = []
      prevActivity.current = []
    }
  }, [user])

  // Load data from Supabase on login
  useEffect(() => {
    if (!user || initialized.current) return
    initialized.current = true

    const loadData = async () => {
      try {
        const [tasks, notes, activity, profile] = await Promise.all([
          fetchTasks(user.id),
          fetchNotes(user.id),
          fetchActivity(user.id),
          fetchProfile(user.id),
        ])

        prevTasks.current = tasks
        prevNotes.current = notes
        prevActivity.current = activity

        // Load semua data profile termasuk XP, level, theme, accent, dan settings lainnya
        if (profile) {
          const settingsPayload: Record<string, unknown> = {}
          if (profile.name)                       settingsPayload.name = profile.name
          if (profile.theme)                      settingsPayload.theme = profile.theme
          if (profile.accentColor)                settingsPayload.accentColor = profile.accentColor
          if (profile.notifications !== undefined) settingsPayload.notifications = profile.notifications
          if (profile.firstDayOfWeek)              settingsPayload.firstDayOfWeek = profile.firstDayOfWeek
          if (profile.pomodoroWork !== undefined)  settingsPayload.pomodoroWork = profile.pomodoroWork
          if (profile.pomodoroBreak !== undefined) settingsPayload.pomodoroBreak = profile.pomodoroBreak

          if (Object.keys(settingsPayload).length > 0) {
            dispatch({ type: 'UPDATE_SETTINGS', payload: settingsPayload })
          }

          // Load XP dan level ke state
          dispatch({
            type: 'LOAD_STATE',
            payload: {
              tasks,
              notes,
              activity,
              xp: profile.xp ?? 0,
              level: profile.level ?? 1,
            },
          })
        } else {
          dispatch({ type: 'LOAD_STATE', payload: { tasks, notes, activity } })
        }
      } catch (err) {
        console.error('Failed to load data:', err)
      }
    }

    loadData()
  }, [user])

  // Sync tasks changes
  useEffect(() => {
    if (!user || !initialized.current) return
    const prev = prevTasks.current
    const curr = state.tasks

    curr.forEach(task => {
      if (!prev.find(t => t.id === task.id)) {
        insertTask(user.id, task).catch(console.error)
      }
    })
    curr.forEach(task => {
      const old = prev.find(t => t.id === task.id)
      if (old && JSON.stringify(old) !== JSON.stringify(task)) {
        updateTask(user.id, task).catch(console.error)
      }
    })
    prev.forEach(task => {
      if (!curr.find(t => t.id === task.id)) {
        deleteTask(user.id, task.id).catch(console.error)
      }
    })
    prevTasks.current = curr
  }, [state.tasks, user])

  // Sync notes changes
  useEffect(() => {
    if (!user || !initialized.current) return
    const prev = prevNotes.current
    const curr = state.notes

    curr.forEach(note => {
      if (!prev.find(n => n.id === note.id)) {
        insertNote(user.id, note).catch(console.error)
      }
    })
    curr.forEach(note => {
      const old = prev.find(n => n.id === note.id)
      if (old && JSON.stringify(old) !== JSON.stringify(note)) {
        updateNote(user.id, note).catch(console.error)
      }
    })
    prev.forEach(note => {
      if (!curr.find(n => n.id === note.id)) {
        deleteNote(user.id, note.id).catch(console.error)
      }
    })
    prevNotes.current = curr
  }, [state.notes, user])

  // Sync activity
  useEffect(() => {
    if (!user || !initialized.current) return
    const prev = prevActivity.current
    const curr = state.activity

    curr.forEach(log => {
      if (!prev.find(l => l.id === log.id)) {
        insertActivity(user.id, log).catch(console.error)
      }
    })
    prevActivity.current = curr
  }, [state.activity, user])

  // Sync XP, level, dan seluruh settings (theme, accent, name, notifications, firstDayOfWeek, pomodoro) ke Supabase
  // Debounce 1.5 detik supaya tidak spam saat user klik cepat / ganti-ganti settings
  const syncProfileTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!user || !initialized.current) return

    if (syncProfileTimeout.current) clearTimeout(syncProfileTimeout.current)
    syncProfileTimeout.current = setTimeout(() => {
      upsertProfile(user.id, {
        xp: state.xp,
        level: state.level,
        name: state.settings.name,
        theme: state.settings.theme,
        accentColor: state.settings.accentColor,
        notifications: state.settings.notifications,
        firstDayOfWeek: state.settings.firstDayOfWeek,
        pomodoroWork: state.settings.pomodoroWork,
        pomodoroBreak: state.settings.pomodoroBreak,
      }).catch(console.error)
    }, 1500)

    return () => {
      if (syncProfileTimeout.current) clearTimeout(syncProfileTimeout.current)
    }
  }, [
    state.xp,
    state.level,
    state.settings.name,
    state.settings.theme,
    state.settings.accentColor,
    state.settings.notifications,
    state.settings.firstDayOfWeek,
    state.settings.pomodoroWork,
    state.settings.pomodoroBreak,
    user,
  ])
}