import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export function useClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { profile } = useAuthStore()

  useEffect(() => {
    if (!profile?.church_id) {
      setLoading(false)
      return
    }

    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('church_id', profile.church_id)
          .order('name')

        if (error) throw error
        setClients(data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()

    const subscription = supabase
      .channel('clients-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'clients',
        filter: `church_id=eq.${profile.church_id}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setClients(prev => [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setClients(prev => prev.map(c => c.id === payload.new.id ? { ...c, ...payload.new } : c))
        } else if (payload.eventType === 'DELETE') {
          setClients(prev => prev.filter(c => c.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => supabase.removeChannel(subscription)
  }, [profile?.church_id])

  const createClient = async (clientData) => {
    const { data, error } = await supabase
      .from('clients')
      .insert({ ...clientData, church_id: profile.church_id })
      .select()
      .single()

    if (error) throw error
    return data
  }

  const updateClient = async (clientId, updates) => {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', clientId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const deleteClient = async (clientId) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId)

    if (error) throw error
  }

  const findByEmail = (email) => {
    return clients.find(c => c.email === email)
  }

  return { clients, loading, error, createClient, updateClient, deleteClient, findByEmail }
}
