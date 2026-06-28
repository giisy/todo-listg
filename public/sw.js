import { precacheAndRoute } from 'workbox-precaching'

precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('message', event => {
  if (event.data?.type === 'SCHEDULE_NOTIFICATION') {
    const { title, body, delay } = event.data
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: '/todo-listg/icon-192.png',
        badge: '/todo-listg/icon-192.png',
        vibrate: [200, 100, 200],
      })
    }, delay)
  }
})