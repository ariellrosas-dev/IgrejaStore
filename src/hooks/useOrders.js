import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export function useOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { profile } = useAuthStore()

  useEffect(() => {
    if (!profile?.church_id) {
      setLoading(false)
      return
    }

    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items(*),
            profiles(name)
          `)
          .eq('church_id', profile.church_id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setOrders(data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()

    const subscription = supabase
      .channel('orders-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `church_id=eq.${profile.church_id}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [payload.new, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o))
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => supabase.removeChannel(subscription)
  }, [profile?.church_id])

  const createOrder = async (orderData) => {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const updateOrderStatus = async (orderId, updates) => {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const deleteOrder = async (orderId) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)

    if (error) throw error
  }

  return { orders, loading, error, createOrder, updateOrderStatus, deleteOrder }
}
