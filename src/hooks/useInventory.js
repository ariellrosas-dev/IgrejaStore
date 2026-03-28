import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export function useShirtModels() {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { profile } = useAuthStore()

  useEffect(() => {
    if (!profile?.church_id) {
      setLoading(false)
      return
    }

    const fetchModels = async () => {
      try {
        const { data, error } = await supabase
          .from('shirt_models')
          .select(`
            *,
            inventory(*)
          `)
          .eq('church_id', profile.church_id)
          .eq('active', true)
          .order('name')

        if (error) throw error
        setModels(data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchModels()

    const subscription = supabase
      .channel('shirt-models-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'shirt_models',
        filter: `church_id=eq.${profile.church_id}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setModels(prev => [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setModels(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m))
        } else if (payload.eventType === 'DELETE') {
          setModels(prev => prev.filter(m => m.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => supabase.removeChannel(subscription)
  }, [profile?.church_id])

  const createModel = async (modelData) => {
    const { data, error } = await supabase
      .from('shirt_models')
      .insert({ ...modelData, church_id: profile.church_id })
      .select()
      .single()

    if (error) throw error
    return data
  }

  const updateModel = async (modelId, updates) => {
    const { data, error } = await supabase
      .from('shirt_models')
      .update(updates)
      .eq('id', modelId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const deleteModel = async (modelId) => {
    const { error } = await supabase
      .from('shirt_models')
      .delete()
      .eq('id', modelId)

    if (error) throw error
  }

  const updateStock = async (modelId, size, quantity) => {
    const { data, error } = await supabase
      .from('inventory')
      .upsert({
        shirt_model_id: modelId,
        size,
        quantity,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  return { models, loading, error, createModel, updateModel, deleteModel, updateStock }
}

export function useInventory() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const { profile } = useAuthStore()

  useEffect(() => {
    if (!profile?.church_id) return

    const fetchInventory = async () => {
      const { data } = await supabase
        .from('inventory')
        .select(`
          *,
          shirt_models(name, color, price)
        `)
        .in('shirt_model_id', 
          supabase.from('shirt_models')
            .select('id')
            .eq('church_id', profile.church_id)
        )
      setInventory(data || [])
      setLoading(false)
    }

    fetchInventory()
  }, [profile?.church_id])

  return { inventory, loading }
}
