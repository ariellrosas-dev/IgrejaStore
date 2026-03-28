import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Profile, Church } from '../types/models'

interface AuthState {
  user: any | null
  profile: Profile | null
  church: Church | null
  loading: boolean
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, churchId: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  church: null,
  loading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, churches(*)')
        .eq('id', session.user.id)
        .single()
      set({ 
        user: session.user, 
        profile, 
        church: profile?.churches as Church | undefined,
        loading: false 
      })
    } else {
      set({ loading: false })
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, churches(*)')
          .eq('id', session.user.id)
          .single()
        set({ 
          user: session.user, 
          profile, 
          church: profile?.churches as Church | undefined,
        })
      } else {
        set({ user: null, profile: null, church: null })
      }
    })
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  },

  signUp: async (email, password, name, churchId) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw new Error(error.message)
    if (data.user) {
      await supabase.from('profiles').insert({ 
        id: data.user.id, 
        name, 
        church_id: churchId, 
        role: 'viewer' 
      })
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, church: null })
  },

  updateProfile: async (data) => {
    const { profile } = get()
    if (!profile) return
    await supabase.from('profiles').update(data).eq('id', profile.id)
    set({ profile: { ...profile, ...data } as Profile })
  },
}))
