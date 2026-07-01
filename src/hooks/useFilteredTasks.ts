import { useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import type { Task } from '@/types'

export function useFilteredTasks() {
  const { state } = useApp()
  const { tasks, searchQuery, searchFilters } = state

  return useMemo(() => {
    return tasks.filter(task => {
      if (task.status === 'archived') return false

      // Apply search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = task.title.toLowerCase().includes(query)
        const matchesDescription = task.description?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesDescription) return false
      }

      // Apply filters
      if (searchFilters.priority && searchFilters.priority !== 'all' && task.priority !== searchFilters.priority) {
        return false
      }

      if (searchFilters.status && searchFilters.status !== 'all' && task.status !== searchFilters.status) {
        return false
      }

      if (searchFilters.categoryId && searchFilters.categoryId !== 'all' && task.categoryId !== searchFilters.categoryId) {
        return false
      }

      if (searchFilters.dateFrom && task.dueDate) {
        const taskDate = new Date(task.dueDate)
        const fromDate = new Date(searchFilters.dateFrom)
        if (taskDate < fromDate) return false
      }

      if (searchFilters.dateTo && task.dueDate) {
        const taskDate = new Date(task.dueDate)
        const toDate = new Date(searchFilters.dateTo)
        if (taskDate > toDate) return false
      }

      if (searchFilters.tags && searchFilters.tags.length > 0) {
        const hasAllTags = searchFilters.tags.every(tag => task.tags.includes(tag))
        if (!hasAllTags) return false
      }

      return true
    })
  }, [tasks, searchQuery, searchFilters])
}