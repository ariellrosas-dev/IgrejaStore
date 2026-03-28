import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { Church } from '../types/models'

export function useSettings() {
  const [church, setChurch] = useState<Church | null>(null)
  const [loading, setLoading] = useState(true)
  const { profile } = useAuthStore()

  const fetch = useCallback(async () => {
    if (!profile?.church_id) return
    const { data } = await supabase
      .from('churches')
      .select('*')
      .eq('id', profile.church_id)
      .single()
    setChurch(data)
    setLoading(false)
  }, [profile?.church_id])

  useEffect(() => { fetch() }, [fetch])

  const updateChurch = async (data: Partial<Church>) => {
    if (!profile?.church_id) return
    await supabase.from('churches').update(data).eq('id', profile.church_id)
    fetch()
  }

  return { church, loading, updateChurch, refetch: fetch }
}
