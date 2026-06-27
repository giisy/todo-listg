import { AppProvider, useApp } from '@/context/AppContext'
import AppLayout from '@/layouts/AppLayout'
import DashboardPage from '@/pages/DashboardPage'
import TodayPage from '@/pages/TodayPage'
import UpcomingPage from '@/pages/UpcomingPage'
import ImportantPage from '@/pages/ImportantPage'
import TrashPage from '@/pages/TrashPage'
import NotesPage from '@/pages/NotesPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import SettingsPage from '@/pages/SettingsPage'

function AppContent() {
  const { state } = useApp()

  const renderPage = () => {
    switch (state.activePage) {
      case 'dashboard': return <DashboardPage />
      case 'today': return <TodayPage />
      case 'upcoming': return <UpcomingPage />
      case 'important': return <ImportantPage />
      case 'notes': return <NotesPage />
      case 'analytics': return <AnalyticsPage />
      case 'settings': return <SettingsPage />
      case 'trash': return <TrashPage />
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

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}