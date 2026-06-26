import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { Task, Note, Category, Tag, ActivityLog, UserSettings, NavPage } from '@/types'
import { DEFAULT_CATEGORIES, DEFAULT_TAGS, STORAGE_KEYS } from '@/constants'

interface AppState {
  tasks: Task[]
  notes: Note[]
  categories: Category[]
  tags: Tag[]
  trash: Task[]
  activity: ActivityLog[]
  settings: UserSettings
  activePage: NavPage
  searchQuery: string
  isSidebarCollapsed: boolean
}

type AppAction =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'RESTORE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'TOGGLE_PIN'; payload: string }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'SET_ACTIVE_PAGE'; payload: NavPage }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function addActivity(state: AppState, log: Omit<ActivityLog, 'id' | 'timestamp'>): ActivityLog[] {
  const entry: ActivityLog = {
    ...log,
    id: generateId(),
    timestamp: new Date().toISOString(),
  }
  return [entry, ...state.activity].slice(0, 50)
}

const defaultSettings: UserSettings = {
  name: 'Gisa',
  pomodoroWork: 25,
  pomodoroBreak: 5,
  notifications: true,
}

const initialState: AppState = {
  tasks: [],
  notes: [],
  categories: DEFAULT_CATEGORIES,
  tags: DEFAULT_TAGS,
  trash: [],
  activity: [],
  settings: defaultSettings,
  activePage: 'dashboard',
  searchQuery: '',
  isSidebarCollapsed: false,
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload }

    case 'ADD_TASK':
      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
        activity: addActivity(state, { type: 'created', taskId: action.payload.id, taskTitle: action.payload.title }),
      }

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t),
        activity: addActivity(state, { type: 'updated', taskId: action.payload.id, taskTitle: action.payload.title }),
      }

    case 'TOGGLE_TASK': {
      const task = state.tasks.find(t => t.id === action.payload)
      if (!task) return state
      const done = task.status !== 'done'
      const updated = {
        ...task,
        status: done ? 'done' as const : 'todo' as const,
        progress: done ? 100 : 0,
        completedAt: done ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      }
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload ? updated : t),
        activity: done
          ? addActivity(state, { type: 'completed', taskId: task.id, taskTitle: task.title })
          : state.activity,
      }
    }

    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload ? { ...t, isFavorite: !t.isFavorite } : t),
      }

    case 'TOGGLE_PIN':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload ? { ...t, isPinned: !t.isPinned } : t),
      }

    case 'DELETE_TASK': {
      const task = state.tasks.find(t => t.id === action.payload)
      if (!task) return state
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload),
        trash: [{ ...task, status: 'archived' }, ...state.trash],
        activity: addActivity(state, { type: 'deleted', taskId: task.id, taskTitle: task.title }),
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

    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] }

    case 'SET_ACTIVE_PAGE':
      return { ...state, activePage: action.payload }
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload }
    case 'TOGGLE_SIDEBAR':
      return { ...state, isSidebarCollapsed: !state.isSidebarCollapsed }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }

    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
  generateId: () => string
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const loaded: Partial<AppState> = {}
    const keys = ['TASKS', 'NOTES', 'CATEGORIES', 'ACTIVITY', 'SETTINGS', 'TRASH'] as const
    keys.forEach(key => {
      const raw = localStorage.getItem(STORAGE_KEYS[key])
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          const stateKey = key.toLowerCase() as keyof AppState
          ;(loaded as Record<string, unknown>)[stateKey] = parsed
        } catch { /* ignore */ }
      }
    })
    if (Object.keys(loaded).length) dispatch({ type: 'LOAD_STATE', payload: loaded })
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(state.tasks))
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(state.notes))
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(state.categories))
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(state.activity))
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings))
    localStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify(state.trash))
  }, [state.tasks, state.notes, state.categories, state.activity, state.settings, state.trash])

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