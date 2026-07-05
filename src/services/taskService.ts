import { supabase } from './supabase'
import type { Task, Note, ActivityLog } from '@/types'
// ─── PROFILE ─────────────────────────────────────────
export const fetchProfile = async (userId: string): Promise<{
  name: string
  xp?: number
  level?: number
  theme?: string
  accentColor?: string
} | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('name, xp, level, theme, accent_color')
    .eq('id', userId)
    .single()
  if (error) return null
  return {
    name: data.name,
    xp: data.xp ?? 0,
    level: data.level ?? 1,
    theme: data.theme ?? 'dark',
    accentColor: data.accent_color ?? '#3B82F6',
  }
}

export const upsertProfile = async (
  userId: string,
  data: {
    name?: string
    xp?: number
    level?: number
    theme?: string
    accentColor?: string
  }
): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      ...(data.name !== undefined && { name: data.name }),
      ...(data.xp !== undefined && { xp: data.xp }),
      ...(data.level !== undefined && { level: data.level }),
      ...(data.theme !== undefined && { theme: data.theme }),
      ...(data.accentColor !== undefined && { accent_color: data.accentColor }),
    }, { onConflict: 'id' })
  if (error) throw error
}

// ─── TASKS ───────────────────────────────────────────
export const fetchTasks = async (userId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    categoryId: row.category_id,
    dueDate: row.due_date,
    reminder: row.reminder,
    repeat: row.repeat,
    tags: row.tags || [],
    color: row.color,
    isFavorite: row.is_favorite,
    isPinned: row.is_pinned,
    progress: row.progress,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  }))
}

export const insertTask = async (userId: string, task: Task) => {
  const { error } = await supabase.from('tasks').insert({
    id: task.id,
    user_id: userId,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    category_id: task.categoryId,
    due_date: task.dueDate,
    reminder: task.reminder,
    repeat: task.repeat,
    tags: task.tags,
    color: task.color,
    is_favorite: task.isFavorite,
    is_pinned: task.isPinned,
    progress: task.progress,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
    completed_at: task.completedAt,
  })
  // Ignore 409 conflict (already exists)
  if (error && error.code !== '23505') throw error
}

export const updateTask = async (userId: string, task: Task) => {
  const { error } = await supabase.from('tasks').update({
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    category_id: task.categoryId,
    due_date: task.dueDate,
    reminder: task.reminder,
    repeat: task.repeat,
    tags: task.tags,
    color: task.color,
    is_favorite: task.isFavorite,
    is_pinned: task.isPinned,
    progress: task.progress,
    updated_at: task.updatedAt,
    completed_at: task.completedAt,
  }).eq('id', task.id).eq('user_id', userId)
  if (error) throw error
}

export const deleteTask = async (userId: string, taskId: string) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId)
  if (error) throw error
}

// ─── NOTES ───────────────────────────────────────────
export const fetchNotes = async (userId: string): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(row => ({
    id: row.id,
    title: row.title,
    content: row.content,
    color: row.color,
    isPinned: row.is_pinned,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export const insertNote = async (userId: string, note: Note) => {
  const { error } = await supabase.from('notes').insert({
    id: note.id,
    user_id: userId,
    title: note.title,
    content: note.content,
    color: note.color,
    is_pinned: note.isPinned,
    created_at: note.createdAt,
    updated_at: note.updatedAt,
  })
  if (error && error.code !== '23505') throw error
}

export const updateNote = async (userId: string, note: Note) => {
  const { error } = await supabase.from('notes').update({
    title: note.title,
    content: note.content,
    color: note.color,
    is_pinned: note.isPinned,
    updated_at: note.updatedAt,
  }).eq('id', note.id).eq('user_id', userId)
  if (error) throw error
}

export const deleteNote = async (userId: string, noteId: string) => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId)
  if (error) throw error
}

// ─── ACTIVITY ─────────────────────────────────────────
export const fetchActivity = async (userId: string): Promise<ActivityLog[]> => {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data || []).map(row => ({
    id: row.id,
    type: row.type,
    taskId: row.task_id,
    taskTitle: row.task_title,
    timestamp: row.timestamp,
  }))
}

export const insertActivity = async (userId: string, log: ActivityLog) => {
  const { error } = await supabase.from('activity_logs').upsert({
    id: log.id,
    user_id: userId,
    type: log.type,
    task_id: log.taskId,
    task_title: log.taskTitle,
    timestamp: log.timestamp,
  }, { onConflict: 'id' })
  if (error && error.code !== '23505') console.error('Activity log error:', error)
}