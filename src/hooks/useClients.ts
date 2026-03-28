import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { Client } from '../types/models'
import toast from 'react-hot-toast'

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { profile } = useAuthStore()

  const fetch = useCallback(async () => {
    if (!profile?.church_id) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('church_id', profile.church_id)
        .order('name')
      if (error) throw error
      setClients(data ?? [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [profile?.church_id])

  useEffect(() => {
    fetch()
    if (!profile?.church_id) return
    const channel = supabase
      .channel('clients-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients', filter: `church_id=eq.${profile.church_id}` }, fetch)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetch, profile?.church_id])

  const createClient = async (data: any): Promise<Client> => {
    const { data: client, error } = await supabase
      .from('clients')
      .insert({ ...data, church_id: profile?.church_id })
      .select()
      .single()
    if (error) { toast.error('Erro ao criar cliente'); throw error }
    toast.success('Cliente criado!')
    return client
  }

  const updateClient = async (id: string, data: any) => {
    const { error } = await supabase.from('clients').update(data).eq('id', id)
    if (error) { toast.error('Erro ao atualizar'); throw error }
    toast.success('Cliente atualizado!')
  }

  const deleteClient = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) { toast.error('Erro ao deletar'); throw error }
    toast.success('Cliente removido')
  }

  return { clients, loading, error, createClient, updateClient, deleteClient, refetch: fetch }
}
