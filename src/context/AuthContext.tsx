import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'
import { upsertProfile } from '@/services/taskService'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  profile: { name: string } | null
  updateProfile: (name: string) => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  loading: true,
  profile: null,
  updateProfile: async () => {},  // ← tambah ini
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ name: string } | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single()
    if (data) setProfile(data)
  }

  const updateProfile = async (name: string) => {
    if (!user) return
    await upsertProfile(user.id, name)
    setProfile({ name })
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, profile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}