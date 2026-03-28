import { useState, useEffect } from 'react'
import { Package, ShoppingCart, DollarSign, Users } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/utils'
import type { Order } from '../../types/models'

interface DashboardStats {
  totalSales: number
  pendingOrders: number
  totalClients: number
  totalModels: number
}

export default function Dashboard() {
  const { profile, church } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    pendingOrders: 0,
    totalClients: 0,
    totalModels: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.church_id) return

    const fetchData = async () => {
      const today = new Date()
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

      const [ordersRes, clientsRes, modelsRes] = await Promise.all([
        supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('church_id', profile.church_id)
          .gte('created_at', firstDayOfMonth.toISOString()),
        supabase
          .from('clients')
          .select('id', { count: 'exact' })
          .eq('church_id', profile.church_id),
        supabase
          .from('shirt_models')
          .select('id', { count: 'exact' })
          .eq('church_id', profile.church_id)
          .eq('active', true),
      ])

      const orders = ordersRes.data || []
      const totalSales = orders.reduce((sum, o) => sum + (o.amount_paid || 0), 0)
      const pendingOrders = orders.filter(o => o.payment_status === 'pendente').length

      setStats({
        totalSales,
        pendingOrders,
        totalClients: clientsRes.count || 0,
        totalModels: modelsRes.count || 0,
      })

      const { data: recent } = await supabase
        .from('orders')
        .select('*, clients(name)')
        .eq('church_id', profile.church_id)
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentOrders(recent || [])
      setLoading(false)
    }

    fetchData()
  }, [profile?.church_id])

  const statCards = [
    {
      title: 'Vendas do Mês',
      value: formatCurrency(stats.totalSales),
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Pedidos Pendentes',
      value: stats.pendingOrders,
      icon: ShoppingCart,
      color: 'bg-yellow-500',
    },
    {
      title: 'Clientes',
      value: stats.totalClients,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Modelos Ativos',
      value: stats.totalModels,
      icon: Package,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            Olá, {profile?.name || 'Usuário'}
          </h1>
          <p className="text-surface-500">
            {church?.name || 'ChurchGear'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">{stat.title}</p>
                <p className="text-2xl font-bold text-surface-900 mt-1">
                  {loading ? '...' : stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">
            Pedidos Recentes
          </h2>
          {loading ? (
            <p className="text-surface-500">Carregando...</p>
          ) : recentOrders.length === 0 ? (
            <p className="text-surface-500">Nenhum pedido recente</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
                  <div>
                    <p className="font-medium text-surface-900">
                      {order.clients?.name || order.buyer_name}
                    </p>
                    <p className="text-sm text-surface-500">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-surface-900">
                      {formatCurrency(order.total)}
                    </p>
                    <p className={`text-sm ${
                      order.payment_status === 'pago' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {order.payment_status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/loja.html"
              className="p-4 rounded-lg border border-surface-200 hover:border-surface-300 hover:bg-surface-50 transition-colors text-center"
            >
              <Package className="mx-auto mb-2 text-surface-600" size={24} />
              <span className="text-sm font-medium text-surface-700">Ver Loja</span>
            </a>
            <a
              href="#"
              className="p-4 rounded-lg border border-surface-200 hover:border-surface-300 hover:bg-surface-50 transition-colors text-center"
            >
              <ShoppingCart className="mx-auto mb-2 text-surface-600" size={24} />
              <span className="text-sm font-medium text-surface-700">Novo Pedido</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
