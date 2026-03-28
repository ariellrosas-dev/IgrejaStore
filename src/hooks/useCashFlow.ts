import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { CashFlowEntry } from '../types/models'
import toast from 'react-hot-toast'

export function useCashFlow() {
  const [entries, setEntries] = useState<CashFlowEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { profile } = useAuthStore()

  const fetch = useCallback(async () => {
    if (!profile?.church_id) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cash_flow')
        .select('*, profiles(name)')
        .eq('church_id', profile.church_id)
        .order('date', { ascending: false })
      if (error) throw error
      setEntries(data ?? [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [profile?.church_id])

  useEffect(() => {
    fetch()
  }, [fetch])

  const createEntry = async (data: any) => {
    const { error } = await supabase
      .from('cash_flow')
      .insert({ ...data, church_id: profile?.church_id, registered_by: profile?.id })
    if (error) { toast.error('Erro ao criar'); throw error }
    toast.success('Lançamento criado!')
    fetch()
  }

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from('cash_flow').delete().eq('id', id)
    if (error) { toast.error('Erro ao deletar'); throw error }
    toast.success('Lançamento removido')
    fetch()
  }

  return { entries, loading, error, createEntry, deleteEntry, refetch: fetch }
}
