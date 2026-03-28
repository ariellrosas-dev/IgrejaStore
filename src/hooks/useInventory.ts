import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { ShirtModel } from '../types/models'
import toast from 'react-hot-toast'

export function useShirtModels() {
  const [models, setModels] = useState<ShirtModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { profile } = useAuthStore()

  const fetch = useCallback(async () => {
    if (!profile?.church_id) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('shirt_models')
        .select('*, inventory(*)')
        .eq('church_id', profile.church_id)
        .order('name')
      if (error) throw error
      setModels(data ?? [])
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
      .channel('shirt-models-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shirt_models', filter: `church_id=eq.${profile.church_id}` },
        () => fetch()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetch, profile?.church_id])

  const createModel = async (data: any): Promise<ShirtModel> => {
    const { data: model, error } = await supabase
      .from('shirt_models')
      .insert({ ...data, church_id: profile?.church_id })
      .select()
      .single()
    if (error) { toast.error('Erro ao criar modelo'); throw error }
    
    const inventoryData = data.sizes.map((size: string) => ({
      shirt_model_id: model.id,
      size,
      quantity: 0,
    }))
    await supabase.from('inventory').insert(inventoryData)
    toast.success('Modelo criado!')
    return model
  }

  const updateModel = async (id: string, data: any) => {
    const { error } = await supabase.from('shirt_models').update(data).eq('id', id)
    if (error) { toast.error('Erro ao atualizar'); throw error }
    toast.success('Modelo atualizado!')
  }

  const deleteModel = async (id: string) => {
    const { error } = await supabase.from('shirt_models').delete().eq('id', id)
    if (error) { toast.error('Erro ao deletar'); throw error }
    toast.success('Modelo removido')
  }

  const updateStock = async (modelId: string, size: string, quantity: number) => {
    const { error } = await supabase
      .from('inventory')
      .upsert({ shirt_model_id: modelId, size, quantity }, { onConflict: 'shirt_model_id,size' })
    if (error) { toast.error('Erro ao atualizar estoque'); throw error }
  }

  return { models, loading, error, createModel, updateModel, deleteModel, updateStock, refetch: fetch }
}

export function useInventory() {
  const { profile } = useAuthStore()
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.church_id) return

    const fetchInventory = async () => {
      const { data } = await supabase
        .from('inventory')
        .select('*, shirt_models(name, color, price)')
      setInventory(data || [])
      setLoading(false)
    }

    fetchInventory()
  }, [profile?.church_id])

  return { inventory, loading }
}
