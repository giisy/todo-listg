import { useEffect, useCallback } from 'react'
import { useApp } from '@/context/AppContext'

interface Shortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  handler: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const { dispatch } = useApp()

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const modifierKey = isMac ? event.metaKey : event.ctrlKey

    for (const shortcut of shortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatch = shortcut.ctrlKey !== undefined ? event.ctrlKey === shortcut.ctrlKey : true
      const metaMatch = shortcut.metaKey !== undefined ? event.metaKey === shortcut.metaKey : true
      const shiftMatch = shortcut.shiftKey !== undefined ? event.shiftKey === shortcut.shiftKey : true
      const altMatch = shortcut.altKey !== undefined ? event.altKey === shortcut.altKey : true

      if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
        event.preventDefault()
        event.stopPropagation()
        shortcut.handler()
        break
      }
    }
  }, [shortcuts])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export function useGlobalShortcuts() {
  const { dispatch } = useApp()
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

  const shortcuts: Shortcut[] = [
    {
      key: 'k',
      ctrlKey: !isMac,
      metaKey: isMac,
      handler: () => { /* ...sama... */ },
      description: 'Focus search',
    },
    {
      key: 'n',
      ctrlKey: !isMac,
      metaKey: isMac,
      handler: () => { dispatch({ type: 'TOGGLE_QUICK_ADD' }) },
      description: 'Quick add task',
    },
    {
      key: 'f',
      ctrlKey: !isMac,
      shiftKey: true,
      metaKey: isMac,
      handler: () => { dispatch({ type: 'TOGGLE_FOCUS_MODE' }) },
      description: 'Toggle focus mode',
    },
    {
      key: ',',
      ctrlKey: !isMac,
      metaKey: isMac,
      handler: () => { dispatch({ type: 'SET_ACTIVE_PAGE', payload: 'settings' }) },
      description: 'Open settings',
    },

  ]

  useKeyboardShortcuts(shortcuts)

  return shortcuts
}