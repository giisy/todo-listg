import type { Task, Note, Category, Tag, ActivityLog, UserSettings } from '@/types'
import { APP_VERSION } from '@/constants'

export interface ExportData {
  version: string
  exportDate: string
  data: {
    tasks: Task[]
    notes: Note[]
    categories: Category[]
    tags: Tag[]
    activity: ActivityLog[]
    settings: UserSettings
  }
}

export function exportData(
  tasks: Task[],
  notes: Note[],
  categories: Category[],
  tags: Tag[],
  activity: ActivityLog[],
  settings: UserSettings
): void {
  const exportData: ExportData = {
    version: APP_VERSION,
    exportDate: new Date().toISOString(),
    data: {
      tasks,
      notes,
      categories,
      tags,
      activity,
      settings,
    },
  }

  const json = JSON.stringify(exportData, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `taskflow-export-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function validateExportData(data: unknown): data is ExportData {
  if (typeof data !== 'object' || data === null) {
    return false
  }

  const exportData = data as Record<string, unknown>

  if (typeof exportData.version !== 'string') {
    return false
  }

  if (typeof exportData.exportDate !== 'string') {
    return false
  }

  if (typeof exportData.data !== 'object' || exportData.data === null) {
    return false
  }

  const dataSection = exportData.data as Record<string, unknown>

  const hasRequiredFields =
    Array.isArray(dataSection.tasks) &&
    Array.isArray(dataSection.notes) &&
    Array.isArray(dataSection.categories) &&
    Array.isArray(dataSection.tags) &&
    Array.isArray(dataSection.activity) &&
    typeof dataSection.settings === 'object' &&
    dataSection.settings !== null

  return hasRequiredFields
}

export async function importData(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const json = event.target?.result as string
        const data = JSON.parse(json)

        if (!validateExportData(data)) {
          reject(new Error('Invalid export data format'))
          return
        }

        resolve(data)
      } catch (error) {
        reject(new Error('Failed to parse export file'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}

export function getExportSummary(data: ExportData): string {
  const { tasks, notes, categories, tags, activity } = data.data
  return `${tasks.length} tasks, ${notes.length} notes, ${categories.length} categories, ${tags.length} tags, ${activity.length} activities`
}