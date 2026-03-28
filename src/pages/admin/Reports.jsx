import { useState, useEffect } from 'react'
import { Download, FileText, BarChart3, PieChart } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from 'recharts'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { formatCurrency } from '../../lib/utils'
import { Button } from '../../components/ui/Button'

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']

export default function Reports() {
  const { profile, church } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [cashFlow, setCashFlow] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')

  useEffect(() => {
    if (!profile?.church_id) return
    fetchData()
  }, [profile?.church_id, dateRange])

  const fetchData = async () => {
    const days = parseInt(dateRange)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [ordersRes, cashRes] = await Promise.all([
      supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('church_id', profile.church_id)
        .gte('created_at', startDate.toISOString()),
      supabase
        .from('cash_flow')
        .select('*')
        .eq('church_id', profile.church_id)
        .gte('date', startDate.toISOString().split('T')[0])
    ])

    setOrders(ordersRes.data || [])
    setCashFlow(cashRes.data || [])
    setLoading(false)
  }

  const totalRevenue = orders.reduce((sum, o) => sum + (o.amount_paid || 0), 0)
  const totalExpenses = cashFlow.filter(c => c.type === 'saída').reduce((sum, c) => sum + c.amount, 0)
  const profit = totalRevenue - totalExpenses
  const totalOrders = orders.length

  const salesByDay = orders.reduce((acc, order) => {
    const day = new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    acc[day] = (acc[day] || 0) + (order.amount_paid || 0)
    return acc
  }, {})

  const chartData = Object.entries(salesByDay).map(([date, value]) => ({ date, value }))

  const salesByPayment = orders.reduce((acc, order) => {
    const method = order.payment_method
    acc[method] = (acc[method] || 0) + order.total
    return acc
  }, {})

  const pieData = Object.entries(salesByPayment).map(([name, value]) => ({ name, value }))

  const topModels = orders.flatMap(o => o.order_items || [])
    .reduce((acc, item) => {
      acc[item.shirt_name] = (acc[item.shirt_name] || 0) + item.quantity
      return acc
    }, {})

  const topModelsData = Object.entries(topModels)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900">Relatórios</h1>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 rounded-lg border border-surface-300 focus:outline-none focus:ring-2 focus:ring-surface-500"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Último ano</option>
          </select>
          <Button variant="secondary">
            <Download size={18} />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-surface-500">Total de Vendas</p>
          <p className="text-2xl font-bold text-surface-900">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-surface-500">Total de Despesas</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-surface-500">Lucro</p>
          <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(profit)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-surface-500">Pedidos</p>
          <p className="text-2xl font-bold text-surface-900">{totalOrders}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">
            Vendas por Dia
          </h2>
          {loading ? (
            <p className="text-surface-500">Carregando...</p>
          ) : chartData.length === 0 ? (
            <p className="text-surface-500">Sem dados para exibir</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">
            Forma de Pagamento
          </h2>
          {loading ? (
            <p className="text-surface-500">Carregando...</p>
          ) : pieData.length === 0 ? (
            <p className="text-surface-500">Sem dados para exibir</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </RechartsPie>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">
            Modelos Mais Vendidos
          </h2>
          {loading ? (
            <p className="text-surface-500">Carregando...</p>
          ) : topModelsData.length === 0 ? (
            <p className="text-surface-500">Sem dados para exibir</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topModelsData} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
