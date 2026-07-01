import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, AlertCircle, Info, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

export type ToastType = 'success' | 'error' | 'info' | 'loading'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = (message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Date.now().toString()
    const newToast: Toast = { id, type, message, duration }
    setToasts(prev => [...prev, newToast])

    if (duration && type !== 'loading') {
      setTimeout(() => {
        dismiss(id)
      }, duration)
    }
  }

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const dismissAll = () => {
    setToasts([])
  }

  return (
    <ToastContext.Provider value={{ toast, dismiss, dismissAll }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  dismiss: (id: string) => void
}

function ToastContainer({ toasts, dismiss }: ToastContainerProps) {
  const icons = {
    success: <Check size={16} />,
    error: <X size={16} />,
    info: <Info size={16} />,
    loading: <Loader2 size={16} className="animate-spin" />,
  }

  const colors = {
    success: 'bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald',
    error: 'bg-accent-rose/10 border-accent-rose/30 text-accent-rose',
    info: 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue',
    loading: 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue',
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-elevated',
              colors[toast.type]
            )}
          >
            <div className="flex-shrink-0">{icons[toast.type]}</div>
            <span className="text-sm font-medium text-text-primary flex-1">{toast.message}</span>
            {toast.type !== 'loading' && (
              <button
                onClick={() => dismiss(toast.id)}
                className="ml-auto text-text-muted hover:text-text-primary transition-colors"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}