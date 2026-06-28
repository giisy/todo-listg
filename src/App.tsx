import { useEffect } from 'react'
import { AppProvider, useApp } from '@/context/AppContext'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import AppLayout from '@/layouts/AppLayout'
import AuthPage from '@/pages/AuthPage'
import DashboardPage from '@/pages/DashboardPage'
import TodayPage from '@/pages/TodayPage'
import UpcomingPage from '@/pages/UpcomingPage'
import ImportantPage from '@/pages/ImportantPage'
import TrashPage from '@/pages/TrashPage'
import NotesPage from '@/pages/NotesPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import PomodoroPage from '@/pages/PomodoroPage'
import ProjectsPage from '@/pages/ProjectsPage'
import CategoriesPage from '@/pages/CategoriesPage'
import RecentPage from '@/pages/RecentPage'
import ProfilePage from '@/pages/ProfilePage'
import SettingsPage from '@/pages/SettingsPage'
import { useSupabaseSync } from '@/hooks/useSupabaseSync'
import { Loader2 } from 'lucide-react'

function AppContent() {
  const { state, dispatch } = useApp()
  const { profile } = useAuth()
  useSupabaseSync()

  useEffect(() => {
    if (profile?.name) {
      dispatch({ type: 'UPDATE_SETTINGS', payload: { name: profile.name } })
    }
  }, [profile])

  const renderPage = () => {
    switch (state.activePage) {
      case 'dashboard': return <DashboardPage />
      case 'today': return <TodayPage />
      case 'upcoming': return <UpcomingPage />
      case 'important': return <ImportantPage />
      case 'notes': return <NotesPage />
      case 'analytics': return <AnalyticsPage />
      case 'recent': return <RecentPage />
      case 'profile': return <ProfilePage />
      case 'settings': return <SettingsPage />
      case 'trash': return <TrashPage />
      case 'pomodoro': return <PomodoroPage />
      case 'projects': return <ProjectsPage />
      case 'categories': return <CategoriesPage />
      default:
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-3">
              <p className="text-4xl">🚧</p>
              <p className="text-sm font-medium text-text-primary capitalize">{state.activePage}</p>
              <p className="text-xs text-text-muted">Coming soon</p>
            </div>
          </div>
        )
    }
  }

  return <AppLayout>{renderPage()}</AppLayout>
}

function Root() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-accent-blue" />
          <p className="text-xs text-text-muted">Loading TaskFlow...</p>
        </div>
      </div>
    )
  }

  if (!user) return <AuthPage />

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  )
}