import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Task } from '@/types'

interface MobileSwipeActionsProps {
  task: Task
  onToggle?: () => void
  onToggleFavorite?: () => void
  onTogglePin?: () => void
  onDelete?: () => void
}

export function MobileSwipeActions({ task, onToggle, onToggleFavorite, onTogglePin, onDelete }: MobileSwipeActionsProps) {
  const [swipeX, setSwipeX] = useState(0)
  const [swipedAction, setSwipedAction] = useState<'delete' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (containerRef.current) {
      containerRef.current.setPointerCapture(touch.identifier)
      const startX = touch.clientX
      const handleTouchMove = (e: React.TouchEvent) => {
        const touch = e.touches[0]
        const diff = touch.clientX - startX
        setSwipeX(diff)

        if (diff < -100) {
          setSwipedAction('delete')
        } else {
          setSwipedAction(null)
        }
      }

      const handleTouchEnd = () => {
        if (Math.abs(swipeX) > 100) {
          if (swipedAction === 'delete' && onDelete) {
            onDelete()
          }
        }
        setSwipeX(0)
        setSwipedAction(null)
        containerRef.current.releasePointerCapture(touch.identifier)
      }

      containerRef.current.addEventListener('touchmove', handleTouchMove)
      containerRef.current.addEventListener('touchend', handleTouchEnd)
      e.preventDefault()
    }
  }

  return (
    <div ref={containerRef} onTouchStart={handleTouchStart}>
      {swipeX < -100 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-10 flex items-center justify-end bg-accent-rose rounded-r-lg"
        >
          <div className="flex items-center gap-2 px-4">
            <Trash2 size={16} />
            <span className="text-sm font-medium">Delete</span>
          </div>
        </motion.div>
      ) : (
        <motion.div
          style={{ translateX: `${swipeX}px` }}
          className="relative"
        >
          {/* Task content di sini */}
        </motion.div>
      )}
    </div>
  )
}