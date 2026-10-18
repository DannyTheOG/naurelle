import { createContext } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import type { UserProfile } from '../types'

export interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  token: string | null
  loading: boolean
  isConfigured: boolean
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, pass: string, meta: { fullName: string; phone?: string }) => Promise<{ success: boolean; error?: string; message?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (updates: { fullName?: string; phone?: string; beautyNotes?: UserProfile['beautyNotes'] }) => Promise<{ success: boolean; error?: string }>
  fetchMyBookings: () => Promise<any[]>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
