import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { Leader } from '../types/models'
import toast from 'react-hot-toast'

export function useLeaders() {
  const [leaders, setLeaders] = useState<Leader[]>([])
  const [loading, setLoading] = useState(true)
  const { profile } = useAuthStore()

  const fetch = useCallback(async () => {
    if (!profile?.church_id) return
    const { data } = await supabase
      .from('leaders')
      .select('*')
      .eq('church_id', profile.church_id)
      .order('name')
    setLeaders(data ?? [])
    setLoading(false)
  }, [profile?.church_id])

  useEffect(() => { fetch() }, [fetch])

  const createLeader = async (name: string) => {
    const { error } = await supabase.from('leaders').insert({ name, church_id: profile?.church_id })
    if (error) { toast.error('Erro ao criar'); throw error }
    toast.success('Líder criado!')
    fetch()
  }

  const deleteLeader = async (id: string) => {
    const { error } = await supabase.from('leaders').delete().eq('id', id)
    if (error) { toast.error('Erro ao deletar'); throw error }
    toast.success('Líder removido')
    fetch()
  }

  return { leaders, loading, createLeader, deleteLeader, refetch: fetch }
}
