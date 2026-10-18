import React, { useState, useEffect, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseClientConfigured } from '../lib/supabase'
import type { UserProfile } from '../types'
import { AuthContext } from './authContextDef'
import { API_BASE_URL } from '../config/api'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const token = session?.access_token || null

  const fetchProfile = useCallback(async (accessToken: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          setProfile({
            id: json.data.id,
            email: json.data.email,
            fullName: json.data.full_name || '',
            phone: json.data.phone || '',
            avatarUrl: json.data.avatar_url,
            role: json.data.role || 'client',
            beautyNotes: json.data.beauty_notes,
            internalNotes: json.data.internal_notes,
            isActive: json.data.is_active,
            createdAt: json.data.created_at,
            updatedAt: json.data.updated_at,
          })
          return
        }
      }
    } catch {
      // Backend may be offline or starting
    }

    // Direct Supabase fallback if backend is offline
    if (isSupabaseClientConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser(accessToken)
        if (user) {
          const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
          if (data) {
            setProfile({
              id: data.id,
              email: data.email,
              fullName: data.full_name || '',
              phone: data.phone || '',
              avatarUrl: data.avatar_url,
              role: data.role || 'client',
              beautyNotes: data.beauty_notes,
              internalNotes: data.internal_notes,
              isActive: data.is_active,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            })
          }
        }
      } catch {
        // Ignore fallback error
      }
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseClientConfigured) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.access_token) {
        fetchProfile(session.access_token)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.access_token) {
        fetchProfile(session.access_token)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signInWithEmail = async (email: string, pass: string) => {
    if (!isSupabaseClientConfigured) {
      return { success: false, error: 'Supabase credentials are not configured yet.' }
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      })
      if (error) {
        return { success: false, error: error.message }
      }
      if (data.session) {
        setSession(data.session)
        setUser(data.user)
        await fetchProfile(data.session.access_token)
      }
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to sign in.' }
    }
  }

  const signUp = async (email: string, pass: string, meta: { fullName: string; phone?: string }) => {
    if (!isSupabaseClientConfigured) {
      return { success: false, error: 'Supabase credentials are not configured yet.' }
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: meta.fullName,
            phone: meta.phone || '',
            role: 'client',
          },
        },
      })
      if (error) {
        return { success: false, error: error.message }
      }
      if (data.session) {
        setSession(data.session)
        setUser(data.user)
        await fetchProfile(data.session.access_token)
      }
      return {
        success: true,
        message: data.session ? 'Account created successfully!' : 'Please check your email to confirm your account.',
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create account.' }
    }
  }

  const signOut = async () => {
    if (isSupabaseClientConfigured) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (token) {
      await fetchProfile(token)
    }
  }

  const updateProfile = async (updates: { fullName?: string; phone?: string; beautyNotes?: UserProfile['beautyNotes'] }) => {
    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const payload: Record<string, any> = {}
      if (updates.fullName !== undefined) payload.full_name = updates.fullName
      if (updates.phone !== undefined) payload.phone = updates.phone
      if (updates.beautyNotes !== undefined) payload.beauty_notes = updates.beautyNotes

      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        await refreshProfile()
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Failed to update profile' }
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error updating profile' }
    }
  }

  const fetchMyBookings = async (): Promise<any[]> => {
    if (!token) return []
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) {
        const json = await res.json()
        return json.data || []
      }
    } catch {
      // Backend error
    }
    return []
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        token,
        loading,
        isConfigured: isSupabaseClientConfigured,
        signInWithEmail,
        signUp,
        signOut,
        refreshProfile,
        updateProfile,
        fetchMyBookings,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}


