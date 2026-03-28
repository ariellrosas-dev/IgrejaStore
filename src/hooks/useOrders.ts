import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { Order, OrderItem } from '../types/models'
import toast from 'react-hot-toast'

interface UseOrdersReturn {
  orders: Order[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createOrder: (data: any) => Promise<Order>
  updateStatus: (id: string, status: string, amountPaid: number) => Promise<void>
  deleteOrder: (id: string) => Promise<void>
}

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { profile } = useAuthStore()

  const fetch = useCallback(async () => {
    if (!profile?.church_id) return
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*), profiles(name), clients(name)')
        .eq('church_id', profile.church_id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setOrders(data ?? [])
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
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `church_id=eq.${profile.church_id}`,
        },
        () => fetch()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetch, profile?.church_id])

  const createOrder = async (data: any): Promise<Order> => {
    const { items, ...orderData } = data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()
    if (orderError) {
      toast.error('Erro ao criar pedido')
      throw orderError
    }

    const itemsWithOrderId = items.map((i: any) => ({ ...i, order_id: order.id }))
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId)
    if (itemsError) {
      toast.error('Erro ao salvar itens')
      throw itemsError
    }

    toast.success('Pedido registrado com sucesso!')
    return order
  }

  const updateStatus = async (id: string, status: string, amountPaid: number) => {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: status, amount_paid: amountPaid })
      .eq('id', id)
    if (error) {
      toast.error('Erro ao atualizar pedido')
      throw error
    }
    toast.success('Status atualizado!')
  }

  const deleteOrder = async (id: string) => {
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) {
      toast.error('Erro ao deletar pedido')
      throw error
    }
    toast.success('Pedido removido')
  }

  return { orders, loading, error, refetch: fetch, createOrder, updateStatus, deleteOrder }
}
