// TaskFlow Service Worker
// Tidak menggunakan workbox-precaching supaya tidak bergantung pada
// VitePWA inject manifest (ada isu kompatibilitas dengan rolldown/Vite 8)

const CACHE_NAME = 'taskflow-v1'

// Install: skip waiting supaya SW langsung aktif
self.addEventListener('install', () => self.skipWaiting())

// Activate: claim semua client
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

// Fetch: network-first, fallback ke cache untuk asset statis
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

// Notifikasi: dipanggil dari useNotifications via postMessage
self.addEventListener('message', event => {
  if (event.data?.type === 'SCHEDULE_NOTIFICATION') {
    const { title, body, delay = 0 } = event.data
    const fire = () => {
      self.registration.showNotification(title, {
        body,
        icon: '/todo-listg/icon-192.png',
        badge: '/todo-listg/icon-192.png',
        vibrate: [200, 100, 200],
        tag: title, // cegah duplikat notif dengan judul sama
      })
    }
    if (delay <= 0) {
      fire()
    } else {
      setTimeout(fire, delay)
    }
  }
})

// Klik notifikasi: buka/focus tab app
self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const appClient = clients.find(c => c.url.includes('/todo-listg/'))
      if (appClient) return appClient.focus()
      return self.clients.openWindow('/todo-listg/')
    })
  )
})