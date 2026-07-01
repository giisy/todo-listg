import type { Category, Tag } from '@/types'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Work', color: '#3B82F6', icon: '💼' },
  { id: 'personal', name: 'Personal', color: '#8B5CF6', icon: '🏠' },
  { id: 'health', name: 'Health', color: '#10B981', icon: '💪' },
  { id: 'learning', name: 'Learning', color: '#F59E0B', icon: '📚' },
  { id: 'finance', name: 'Finance', color: '#F43F5E', icon: '💰' },
]

export const DEFAULT_TAGS: Tag[] = [
  { id: 'urgent', name: 'Urgent', color: '#F43F5E' },
  { id: 'focus', name: 'Focus', color: '#3B82F6' },
  { id: 'review', name: 'Review', color: '#F59E0B' },
  { id: 'idea', name: 'Idea', color: '#8B5CF6' },
  { id: 'waiting', name: 'Waiting', color: '#9CA3AF' },
]

export const PRIORITY_CONFIG = {
  low: { label: 'Low', color: '#10B981', bg: 'rgba(16,185,129,0.12)', dot: '#10B981' },
  medium: { label: 'Medium', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', dot: '#F59E0B' },
  high: { label: 'High', color: '#F97316', bg: 'rgba(249,115,22,0.12)', dot: '#F97316' },
  urgent: { label: 'Urgent', color: '#F43F5E', bg: 'rgba(244,63,94,0.12)', dot: '#F43F5E' },
} as const

export const MOTIVATIONAL_QUOTES = [
  "Focus on progress, not perfection.",
  "Small steps every day lead to big results.",
  "Your future self will thank you for today.",
  "Done is better than perfect.",
  "The secret of getting ahead is getting started.",
  "One task at a time, one day at a time.",
]

export const STORAGE_KEYS = {
  TASKS: 'taskflow_tasks',
  NOTES: 'taskflow_notes',
  CATEGORIES: 'taskflow_categories',
  TAGS: 'taskflow_tags',
  ACTIVITY: 'taskflow_activity',
  SETTINGS: 'taskflow_settings',
  TRASH: 'taskflow_trash',
} as const

export const APP_VERSION = '1.0.0'