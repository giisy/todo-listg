import { useEffect, useState } from 'react'

interface LoadingState {
  isLoading: boolean
  message: string
}

export function useLoadingState() {
  const [loadingStates, setLoadingStates] = useState<Record<string, LoadingState>>({})
  const [globalLoading, setGlobalLoading] = useState<LoadingState>({ isLoading: false, message: '' })

  const startLoading = (key: string, message: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: { isLoading: true, message }
    }))
  }

  const stopLoading = (key: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: { isLoading: false, message: '' }
    }))
  }

  const setGlobalLoadingState = (state: LoadingState) => {
    setGlobalLoading(state)
  }

  const isLoading = Object.keys(loadingStates).length > 0 || globalLoading.isLoading

  return {
    loadingStates,
    startLoading,
    stopLoading,
    setGlobalLoadingState,
    isLoading,
    globalLoading
  }
}