import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !key) {
  console.warn('Supabase credentials not configured')
}

export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
})
