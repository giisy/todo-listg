import { useEffect, useRef } from 'react'
import { useApp } from '@/context/AppContext'
import { Task } from '@/types'

// Map dari taskId+type ke timeout id-nya, buat cleanup
type ScheduledEntry = {
  timeoutId: ReturnType<typeof setTimeout>
  fireAt: number
}
const scheduled = new Map<string, ScheduledEntry>()

function cancelAll() {
  scheduled.forEach(({ timeoutId }) => clearTimeout(timeoutId))
  scheduled.clear()
}

function scheduleNotif(key: string, title: string, body: string, fireAt: Date) {
  const delay = fireAt.getTime() - Date.now()
  if (delay <= 0) return // sudah lewat, skip

  // Kalau sudah ada jadwal untuk key ini dengan waktu sama, skip
  const existing = scheduled.get(key)
  if (existing && existing.fireAt === fireAt.getTime()) return
  if (existing) clearTimeout(existing.timeoutId)

  const timeoutId = setTimeout(() => {
    // Coba SW dulu (biar bisa muncul walau tab di-background)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        title,
        body,
        delay: 0, // langsung, karena kita udah tunggu di sini
      })
    } else {
      // Fallback: Notification API langsung
      new Notification(title, {
        body,
        icon: '/todo-listg/icon-192.png',
        badge: '/todo-listg/icon-192.png',
      } as NotificationOptions)
    }
    scheduled.delete(key)
  }, delay)

  scheduled.set(key, { timeoutId, fireAt: fireAt.getTime() })
}

function scheduleForTask(task: Task) {
  // 1. Reminder eksplisit yang di-set user (field `reminder`)
  if (task.reminder) {
    const reminderDate = new Date(task.reminder)
    if (!isNaN(reminderDate.getTime())) {
      scheduleNotif(
        `${task.id}:reminder`,
        `🔔 Reminder: ${task.title}`,
        task.dueDate
          ? `Due: ${new Date(task.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
          : 'Jangan lupa task ini!',
        reminderDate
      )
    }
  }

  // 2. Notif saat deadline (dueDate, jam 09:00 kalau cuma tanggal tanpa jam)
  if (task.dueDate) {
    const dueDate = new Date(task.dueDate)
    // dueDate di DB formatnya 'YYYY-MM-DD' (date only) → set ke jam 09:00
    const fireAt = dueDate.toISOString().includes('T')
      ? dueDate
      : new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), 9, 0, 0)

    scheduleNotif(
      `${task.id}:due`,
      `⏰ Deadline: ${task.title}`,
      'Task ini sudah jatuh tempo!',
      fireAt
    )

    // 3. Notif 30 menit sebelum deadline (hanya kalau deadline punya jam spesifik)
    if (dueDate.toISOString().includes('T')) {
      const before30 = new Date(dueDate.getTime() - 30 * 60 * 1000)
      scheduleNotif(
        `${task.id}:due-30min`,
        `⏳ Sebentar lagi: ${task.title}`,
        'Deadline dalam 30 menit!',
        before30
      )
    }
  }
}

export function useNotifications() {
  const { state } = useApp()
  const permissionRequested = useRef(false)

  // Minta permission sekali saja saat notifications diaktifkan
  useEffect(() => {
    if (!state.settings.notifications) return
    if (permissionRequested.current) return
    if (Notification.permission === 'default') {
      permissionRequested.current = true
      Notification.requestPermission()
    }
  }, [state.settings.notifications])

  // Reschedule semua notif saat tasks berubah
  useEffect(() => {
    if (!state.settings.notifications) {
      cancelAll()
      return
    }
    if (Notification.permission !== 'granted') return

    const pendingTasks = state.tasks.filter(
      t => t.status !== 'done' && t.status !== 'archived' && (t.dueDate || t.reminder)
    )

    // Hapus jadwal untuk task yang sudah done/archived/dihapus
    const pendingIds = new Set(pendingTasks.map(t => t.id))
    scheduled.forEach((_, key) => {
      const taskId = key.split(':')[0]
      if (!pendingIds.has(taskId)) {
        const entry = scheduled.get(key)
        if (entry) clearTimeout(entry.timeoutId)
        scheduled.delete(key)
      }
    })

    // Schedule untuk task yang masih pending
    pendingTasks.forEach(scheduleForTask)
  }, [state.tasks, state.settings.notifications])
}