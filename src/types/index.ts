export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'archived'
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly'
export type NavPage = 'dashboard' | 'today' | 'upcoming' | 'projects' | 'important' | 'categories' | 'notes' | 'pomodoro' | 'analytics' | 'trash' | 'recent' | 'profile' | 'settings' | 'calendar'

export interface Tag {
  id: string
  name: string
  color: string
}

export interface Category {
  id: string
  name: string
  color: string
  icon: string
}

export interface Subtask {
  id: string
  title: string
  done: boolean
}

export interface Task {
  id: string
  title: string
  description?: string
  priority: Priority
  status: TaskStatus
  categoryId?: string
  dueDate?: string
  reminder?: string
  repeat: RepeatType
  tags: string[]
  color?: string
  isFavorite: boolean
  isPinned: boolean
  progress: number
  order: number
  createdAt: string
  updatedAt: string
  completedAt?: string
  subtasks?: Subtask[]
}

export interface Note {
  id: string
  title: string
  content: string
  color?: string
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export interface UserSettings {
  name: string
  pomodoroWork: number
  pomodoroBreak: number
  notifications: boolean
  accentColor: string
  firstDayOfWeek: 'monday' | 'sunday'
  theme: 'dark' | 'light'
}

export interface ActivityLog {
  id: string
  type: 'created' | 'completed' | 'deleted' | 'updated' | 'archived'
  taskId: string
  taskTitle: string
  timestamp: string
}

export interface SearchFilters {
  priority?: Priority | 'all'
  status?: TaskStatus | 'all'
  categoryId?: string | 'all'
  dateFrom?: string
  dateTo?: string
  tags?: string[]
}