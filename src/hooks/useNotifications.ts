import { useEffect } from 'react'
import { useApp } from '@/context/AppContext'

const REMINDER_BEFORE_MINUTES = 30

function scheduleViaServiceWorker(title: string, body: string, fireAt: Date) {
  const delay = fireAt.getTime() - Date.now()
  if (delay <= 0) return

  navigator.serviceWorker.ready.then(registration => {
    registration.active?.postMessage({
      type: 'SCHEDULE_NOTIFICATION',
      title,
      body,
      delay,
    })
  })
}

export function useNotifications() {
  const { state } = useApp()

  // Request permission saat pertama kali
  useEffect(() => {
    if (!state.settings.notifications) return
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [state.settings.notifications])

  // Schedule notif untuk tiap task yang punya deadline
  useEffect(() => {
    if (!state.settings.notifications) return
    if (Notification.permission !== 'granted') return
    if (!('serviceWorker' in navigator)) return

    const pendingTasks = state.tasks.filter(
      t => t.status !== 'done' && t.status !== 'archived' && t.dueDate
    )

    pendingTasks.forEach(task => {
      const deadline = new Date(task.dueDate!)

      // Notif tepat saat deadline
      scheduleViaServiceWorker(
        `⏰ Deadline: ${task.title}`,
        'Task ini sudah jatuh tempo!',
        deadline
      )

      // Notif 30 menit sebelum deadline
      const before = new Date(deadline.getTime() - REMINDER_BEFORE_MINUTES * 60 * 1000)
      scheduleViaServiceWorker(
        `🔔 Reminder: ${task.title}`,
        `Deadline dalam ${REMINDER_BEFORE_MINUTES} menit!`,
        before
      )
    })
  }, [state.tasks, state.settings.notifications])
}