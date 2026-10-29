import React, { createContext, useContext, useState, useEffect } from 'react'
import { UserRole, UserSession } from '../types'
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase'

export interface DemoPersona {
  id: string
  name: string
  role: UserRole
  email: string
  badge?: string
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'demo-user-citizen',
    name: 'Aditya (Citizen User)',
    role: 'user',
    email: 'citizen.aditya@demo.pulsebridge.local',
  },
  {
    id: 'demo-responder-sarah',
    name: 'Dispatcher Sarah (Station 1)',
    role: 'responder',
    email: 'sarah.dispatch@demo.pulsebridge.local',
    badge: 'PB-DISPATCH-04',
  },
  {
    id: 'demo-responder-dr-vikram',
    name: 'Dr. Vikram (Medical Lead)',
    role: 'responder',
    email: 'dr.vikram@demo.pulsebridge.local',
    badge: 'PB-MEDIC-01',
  },
]

interface AuthContextType {
  user: UserSession | null
  role: UserRole
  isDemoUser: boolean
  isSupabaseAuth: boolean
  activePersona: DemoPersona
  switchPersona: (personaId: string) => void
  signInWithSupabase: (email: string, pass: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePersona, setActivePersona] = useState<DemoPersona>(DEMO_PERSONAS[0])
  const [session, setSession] = useState<UserSession>({
    id: DEMO_PERSONAS[0].id,
    display_name: DEMO_PERSONAS[0].name,
    email: DEMO_PERSONAS[0].email,
    role: DEMO_PERSONAS[0].role,
    isDemoAccount: true,
  })
  const [isSupabaseAuth, setIsSupabaseAuth] = useState(false)

  useEffect(() => {
    const client = getSupabaseClient()
    if (isSupabaseConfigured && client) {
      client.auth.getSession().then(({ data: { session: supaSession } }) => {
        if (supaSession?.user) {
          setIsSupabaseAuth(true)
          setSession({
            id: supaSession.user.id,
            email: supaSession.user.email || '',
            display_name: supaSession.user.user_metadata?.display_name || supaSession.user.email || 'User',
            role: (supaSession.user.user_metadata?.role as UserRole) || 'user',
            isDemoAccount: false,
          })
        }
      })

      const { data: { subscription } } = client.auth.onAuthStateChange((_event, supaSession) => {
        if (supaSession?.user) {
          setIsSupabaseAuth(true)
          setSession({
            id: supaSession.user.id,
            email: supaSession.user.email || '',
            display_name: supaSession.user.user_metadata?.display_name || supaSession.user.email || 'User',
            role: (supaSession.user.user_metadata?.role as UserRole) || 'user',
            isDemoAccount: false,
          })
        } else {
          setIsSupabaseAuth(false)
          // Fall back to active demo persona
          setSession({
            id: activePersona.id,
            display_name: activePersona.name,
            email: activePersona.email,
            role: activePersona.role,
            isDemoAccount: true,
          })
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [activePersona])

  const switchPersona = (personaId: string) => {
    const persona = DEMO_PERSONAS.find((p) => p.id === personaId) || DEMO_PERSONAS[0]
    setActivePersona(persona)
    setIsSupabaseAuth(false)
    setSession({
      id: persona.id,
      display_name: persona.name,
      email: persona.email,
      role: persona.role,
      isDemoAccount: true,
    })
  }

  const signInWithSupabase = async (email: string, pass: string): Promise<{ error?: string }> => {
    const client = getSupabaseClient()
    if (!isSupabaseConfigured || !client) {
      return { error: 'Supabase credentials are not configured in environment.' }
    }
    const { error } = await client.auth.signInWithPassword({ email, password: pass })
    if (error) {
      return { error: error.message }
    }
    return {}
  }

  const signOut = async () => {
    const client = getSupabaseClient()
    if (isSupabaseConfigured && client) {
      await client.auth.signOut()
    }
    switchPersona(DEMO_PERSONAS[0].id)
  }

  return (
    <AuthContext.Provider
      value={{
        user: session,
        role: session.role,
        isDemoUser: session.isDemoAccount ?? true,
        isSupabaseAuth,
        activePersona,
        switchPersona,
        signInWithSupabase,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
