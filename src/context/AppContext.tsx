import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from 'react'
import type { Task, Note, Category, Tag, ActivityLog, UserSettings, NavPage, SearchFilters } from '@/types'
import { DEFAULT_CATEGORIES, DEFAULT_TAGS, STORAGE_KEYS } from '@/constants'
import { generateId } from '@/utils/generateId'

export interface AppState {
  tasks: Task[]
  notes: Note[]
  categories: Category[]
  tags: Tag[]
  trash: Task[]
  activity: ActivityLog[]
  settings: UserSettings
  activePage: NavPage
  searchQuery: string
  searchFilters: SearchFilters
  isSidebarCollapsed: boolean
  showAdvancedSearch: boolean
  showQuickAdd: boolean
  focusMode: boolean
  xp: number
  level: number
}

type AppAction =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'RESTORE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'TOGGLE_PIN'; payload: string }
  | { type: 'REORDER_TASKS'; payload: { sourceIndex: number; destinationIndex: number } }
  | { type: 'RESET_RECURRING_TASKS'; payload: Task[] }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'SET_ACTIVE_PAGE'; payload: NavPage }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_SEARCH_FILTERS'; payload: SearchFilters }
  | { type: 'CLEAR_SEARCH_FILTERS' }
  | { type: 'TOGGLE_ADVANCED_SEARCH' }
  | { type: 'CLOSE_ADVANCED_SEARCH' }
  | { type: 'TOGGLE_QUICK_ADD' }
  | { type: 'CLOSE_QUICK_ADD' }
  | { type: 'TOGGLE_FOCUS_MODE' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_THEME' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }

function addActivity(state: AppState, log: Omit<ActivityLog, 'id' | 'timestamp'>): ActivityLog[] {
  const entry: ActivityLog = {
    ...log,
    id: generateId(),
    timestamp: new Date().toISOString(),
  }
  return [entry, ...state.activity].slice(0, 50)
}

// Hapus 1 activity log 'completed' paling baru untuk task ini (dipanggil saat task di-uncheck)
function removeLastCompletedActivity(activity: ActivityLog[], taskId: string): ActivityLog[] {
  const index = activity.findIndex(a => a.type === 'completed' && a.taskId === taskId)
  if (index === -1) return activity
  return [...activity.slice(0, index), ...activity.slice(index + 1)]
}

// ─── Baca localStorage SAAT initialState dibentuk ─────────────────────────────
// Ini fix root cause: useEffect async = selalu flash ke default dulu
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

const defaultSettings: UserSettings = {
  name: 'name',
  pomodoroWork: 25,
  pomodoroBreak: 5,
  notifications: true,
  accentColor: '#3B82F6',
  firstDayOfWeek: 'monday',
  theme: 'dark',
}

// Baca settings dari localStorage langsung, bukan di useEffect
const savedSettings = loadFromStorage<UserSettings>(STORAGE_KEYS.SETTINGS, defaultSettings)
const savedXpData   = loadFromStorage<{ xp: number; level: number }>('taskflow_xp', { xp: 0, level: 1 })

const initialState: AppState = {
  tasks:      [],
  notes:      [],
  categories: DEFAULT_CATEGORIES,
  tags:       DEFAULT_TAGS,
  trash:      [],
  activity:   [],
  settings:   { ...defaultSettings, ...savedSettings },  // merge supaya field baru tidak hilang
  activePage: 'dashboard',
  searchQuery: '',
  searchFilters: {},
  isSidebarCollapsed: false,
  showAdvancedSearch: false,
  showQuickAdd: false,
  focusMode: false,
  xp:    savedXpData.xp,
  level: savedXpData.level,
}

// ─── Apply theme & accent ke DOM segera (sebelum React mount) ─────────────────
// Ini cegah FOUC (flash of unstyled content) pada tema
;(function applyThemeEarly() {
  const s = savedSettings
  if (s.theme === 'light') {
    document.documentElement.classList.add('light')
  } else {
    document.documentElement.classList.remove('light')
  }
  if (s.accentColor) {
    document.body.style.setProperty('--accent-color', s.accentColor)
  }
})()

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload }

    case 'ADD_TASK':
      return {
        ...state,
        tasks: [
          { ...action.payload, order: Math.max(...state.tasks.map(t => t.order), 0) + 1 },
          ...state.tasks,
        ],
        activity: addActivity(state, {
          type: 'created',
          taskId: action.payload.id,
          taskTitle: action.payload.title,
        }),
      }

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t),
        activity: addActivity(state, {
          type: 'updated',
          taskId: action.payload.id,
          taskTitle: action.payload.title,
        }),
      }

    case 'TOGGLE_TASK': {
  const task = state.tasks.find(t => t.id === action.payload)
  if (!task) return state
  const completing = task.status !== 'done'

  const updated = {
    ...task,
    status: completing ? 'done' as const : 'todo' as const,
    progress: completing ? 100 : 0,
    completedAt: completing ? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString(),
  }

  // +10 XP saat complete, -10 saat uncheck (min 0)
  const XP_PER_TASK = 10
  const newXp = completing
    ? state.xp + XP_PER_TASK
    : Math.max(0, state.xp - XP_PER_TASK)
  const newLevel = Math.floor(newXp / 100) + 1

  return {
    ...state,
    tasks: state.tasks.map(t => t.id === action.payload ? updated : t),
    activity: completing
      ? addActivity(state, { type: 'completed', taskId: task.id, taskTitle: task.title })
      : removeLastCompletedActivity(state.activity, task.id),
    xp: newXp,
    level: newLevel,
  }
}

    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload ? { ...t, isFavorite: !t.isFavorite } : t
        ),
      }

    case 'TOGGLE_PIN':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload ? { ...t, isPinned: !t.isPinned } : t
        ),
      }

    case 'DELETE_TASK': {
      const task = state.tasks.find(t => t.id === action.payload)
      if (!task) return state
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload),
        trash: [{ ...task, status: 'archived' }, ...state.trash],
        activity: addActivity(state, {
          type: 'deleted',
          taskId: task.id,
          taskTitle: task.title,
        }),
      }
    }

    case 'RESTORE_TASK': {
      const task = state.trash.find(t => t.id === action.payload)
      if (!task) return state
      return {
        ...state,
        tasks: [{ ...task, status: 'todo' }, ...state.tasks],
        trash: state.trash.filter(t => t.id !== action.payload),
      }
    }

    case 'ADD_NOTE':
      return { ...state, notes: [action.payload, ...state.notes] }
    case 'UPDATE_NOTE':
      return { ...state, notes: state.notes.map(n => n.id === action.payload.id ? action.payload : n) }
    case 'DELETE_NOTE':
      return { ...state, notes: state.notes.filter(n => n.id !== action.payload) }

    case 'REORDER_TASKS': {
      const { sourceIndex, destinationIndex } = action.payload
      if (sourceIndex === destinationIndex) return state
      const tasks = [...state.tasks]
      const [removed] = tasks.splice(sourceIndex, 1)
      tasks.splice(destinationIndex, 0, removed)
      return { ...state, tasks }
    }

    case 'RESET_RECURRING_TASKS':
      return {
        ...state,
        tasks: state.tasks.map(t => {
          const reset = action.payload.find(r => r.id === t.id)
          return reset || t
        }),
      }

    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] }

    case 'SET_ACTIVE_PAGE':      return { ...state, activePage: action.payload }
    case 'SET_SEARCH':           return { ...state, searchQuery: action.payload }
    case 'SET_SEARCH_FILTERS':   return { ...state, searchFilters: action.payload }
    case 'CLEAR_SEARCH_FILTERS': return { ...state, searchFilters: {} }
    case 'TOGGLE_ADVANCED_SEARCH': return { ...state, showAdvancedSearch: !state.showAdvancedSearch }
    case 'CLOSE_ADVANCED_SEARCH':  return { ...state, showAdvancedSearch: false }
    case 'TOGGLE_QUICK_ADD':     return { ...state, showQuickAdd: !state.showQuickAdd }
    case 'CLOSE_QUICK_ADD':      return { ...state, showQuickAdd: false }
    case 'TOGGLE_SIDEBAR':       return { ...state, isSidebarCollapsed: !state.isSidebarCollapsed }

    case 'TOGGLE_THEME':
      return {
        ...state,
        settings: {
          ...state.settings,
          theme: state.settings.theme === 'dark' ? 'light' : 'dark',
        },
      }

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }

    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
  generateId: typeof generateId
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const lastResetCheck = useRef<string | null>(null)

  // Reset recurring tasks saat hari berganti
  useEffect(() => {
    const todayStr = new Date().toDateString()
    if (lastResetCheck.current === todayStr) return
    if (state.tasks.length === 0) return

    const now = new Date()
    const toReset: Task[] = []

    state.tasks.forEach(task => {
      if (task.repeat === 'none' || task.status !== 'done' || !task.completedAt) return
      const completed = new Date(task.completedAt)
      let shouldReset = false

      if (task.repeat === 'daily') {
        shouldReset = completed.toDateString() !== todayStr
      } else if (task.repeat === 'weekly') {
        const diffDays = Math.floor((now.getTime() - completed.getTime()) / (1000 * 60 * 60 * 24))
        shouldReset = diffDays >= 7
      } else if (task.repeat === 'monthly') {
        shouldReset = completed.getMonth() !== now.getMonth() || completed.getFullYear() !== now.getFullYear()
      }

      if (shouldReset) {
        toReset.push({
          ...task, status: 'todo', progress: 0,
          completedAt: undefined, updatedAt: new Date().toISOString(),
        })
      }
    })

    if (toReset.length > 0) dispatch({ type: 'RESET_RECURRING_TASKS', payload: toReset })
    lastResetCheck.current = todayStr
  }, [state.tasks])

  // Sync semua ke localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS,      JSON.stringify(state.tasks))
    localStorage.setItem(STORAGE_KEYS.NOTES,      JSON.stringify(state.notes))
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(state.categories))
    localStorage.setItem(STORAGE_KEYS.ACTIVITY,   JSON.stringify(state.activity))
    localStorage.setItem(STORAGE_KEYS.SETTINGS,   JSON.stringify(state.settings))
    localStorage.setItem(STORAGE_KEYS.TRASH,      JSON.stringify(state.trash))
    // XP tersendiri supaya tidak ikut override saat LOAD_STATE dari Supabase
    localStorage.setItem('taskflow_xp', JSON.stringify({ xp: state.xp, level: state.level }))
  }, [state.tasks, state.notes, state.categories, state.activity, state.settings, state.trash, state.xp, state.level])

  // Apply accent color ke CSS variables
  useEffect(() => {
    document.body.style.setProperty('--accent-color', state.settings.accentColor)
    document.body.style.setProperty('--accent-color-dim', adjustBrightness(state.settings.accentColor, -0.15))
    document.body.style.setProperty('--accent-color-glow', hexToRgba(state.settings.accentColor, 0.15))
  }, [state.settings.accentColor])

  // Apply theme ke <html>
  useEffect(() => {
    document.documentElement.classList.toggle('light', state.settings.theme === 'light')
    document.documentElement.classList.toggle('dark',  state.settings.theme === 'dark')
  }, [state.settings.theme])

  function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }

  function adjustBrightness(hex: string, percent: number): string {
    const r = Math.max(0, Math.min(255, parseInt(hex.slice(1, 3), 16) * (1 + percent)))
    const g = Math.max(0, Math.min(255, parseInt(hex.slice(3, 5), 16) * (1 + percent)))
    const b = Math.max(0, Math.min(255, parseInt(hex.slice(5, 7), 16) * (1 + percent)))
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`
  }

  return (
    <AppContext.Provider value={{ state, dispatch, generateId }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}