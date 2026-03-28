import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  church: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      set({ loading: true })
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
          church: profile?.churches,
          loading: false 
        })
      } else {
        set({ loading: false })
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ loading: false, error: error.message })
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
          church: profile?.churches,
        })
      } else {
        set({ user: null, profile: null, church: null })
      }
    })
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null })
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) throw error
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, churches(*)')
        .eq('id', data.user.id)
        .single()
      
      set({ 
        user: data.user, 
        profile,
        church: profile?.churches,
        loading: false 
      })
      
      return data
    } catch (error) {
      set({ loading: false, error: error.message })
      throw error
    }
  },

  signUp: async (email, password, name, churchId) => {
    try {
      set({ loading: true, error: null })
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      })
      
      if (error) throw error
      
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          name,
          role: 'viewer',
          church_id: churchId,
        })
      }
      
      set({ loading: false })
      return data
    } catch (error) {
      set({ loading: false, error: error.message })
      throw error
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut()
      set({ user: null, profile: null, church: null })
    } catch (error) {
      console.error('Sign out error:', error)
    }
  },

  hasRole: (requiredRole) => {
    const { profile } = get()
    if (!profile) return false
    
    const hierarchy = { admin: 4, cashier: 3, leader: 2, viewer: 1 }
    return hierarchy[profile.role] >= hierarchy[requiredRole]
  },

  clearError: () => set({ error: null }),
}))
