import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, X } from 'lucide-react'

export default function UpdatePrompt() {
  const [hasUpdate, setHasUpdate] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // Deteksi SW baru yang menunggu
    const handleUpdate = (registration: ServiceWorkerRegistration) => {
      const installingWorker = registration.installing
      if (!installingWorker) return

      installingWorker.addEventListener('statechange', () => {
        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
          setHasUpdate(true)
        }
      })
    }

    navigator.serviceWorker.ready.then(registration => {
      // Cek update sekarang
      registration.update().catch(() => {})

      // Listen untuk SW baru
      registration.addEventListener('updatefound', () => handleUpdate(registration))

      // Cek setiap 30 menit
      const interval = setInterval(() => registration.update().catch(() => {}), 30 * 60 * 1000)
      return () => clearInterval(interval)
    }).catch(() => {})
  }, [])

  const handleUpdate = () => {
    navigator.serviceWorker.ready.then(registration => {
      // Kirim pesan ke SW untuk skip waiting
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
    }).catch(() => {})

    // Reload setelah sedikit delay
    setTimeout(() => window.location.reload(), 300)
  }

  return (
    <AnimatePresence>
      {hasUpdate && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-[100] bg-bg-card border border-border rounded-xl shadow-modal p-4 flex items-start gap-3"
          style={{ maxWidth: 300 }}
        >
          <div className="w-9 h-9 rounded-lg bg-[var(--accent-color)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <RefreshCw size={17} className="text-[var(--accent-color)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">Versi baru tersedia!</p>
            <p className="text-2xs text-text-muted mt-0.5 leading-relaxed">
              Klik update untuk mendapatkan fitur terbaru.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleUpdate}
                className="btn-primary text-xs py-1.5 px-3 flex-1 justify-center"
              >
                <RefreshCw size={12} />
                Update Sekarang
              </button>
            </div>
          </div>
          <button
            onClick={() => setHasUpdate(false)}
            className="btn-icon w-6 h-6 flex-shrink-0 -mt-0.5 -mr-0.5"
          >
            <X size={13} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}