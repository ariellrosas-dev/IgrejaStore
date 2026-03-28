import { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreVertical, Trash2, Edit, Eye } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { formatCurrency, formatDate, paymentMethodLabels, paymentStatusLabels } from '../../lib/utils'
import { Table } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { SkeletonTable } from '../../components/ui/Skeleton'

export default function Orders() {
  const { profile } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!profile?.church_id) return

    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, clients(name), profiles(name)')
        .eq('church_id', profile.church_id)
        .order('created_at', { ascending: false })

      setOrders(data || [])
      setLoading(false)
    }

    fetchOrders()

    const subscription = supabase
      .channel('orders-listen')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `church_id=eq.${profile.church_id}`,
      }, () => fetchOrders())
      .subscribe()

    return () => supabase.removeChannel(subscription)
  }, [profile?.church_id])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !search || 
      order.buyer_name?.toLowerCase().includes(search.toLowerCase()) ||
      order.id?.includes(search)
    const matchesStatus = !statusFilter || order.payment_status === statusFilter
    return matchesSearch && matchesStatus
  })

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      render: (row) => (
        <span className="font-mono text-xs">{row.id.slice(0, 8)}</span>
      )
    },
    {
      header: 'Cliente',
      accessor: 'buyer_name',
      render: (row) => (
        <div>
          <p className="font-medium">{row.buyer_name}</p>
          <p className="text-xs text-surface-500">{row.phone}</p>
        </div>
      )
    },
    {
      header: 'Total',
      render: (row) => (
        <span className="font-medium">{formatCurrency(row.total)}</span>
      )
    },
    {
      header: 'Pago',
      render: (row) => (
        <span className="text-green-600">{formatCurrency(row.amount_paid)}</span>
      )
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.payment_status} />
    },
    {
      header: 'Pagamento',
      render: (row) => (
        <Badge variant="default">{paymentMethodLabels[row.payment_method]}</Badge>
      )
    },
    {
      header: 'Data',
      render: (row) => formatDate(row.created_at)
    },
    {
      header: '',
      width: '50px',
      render: (row) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            setSelectedOrder(row)
            setShowModal(true)
          }}
        >
          <Eye size={16} />
        </Button>
      )
    }
  ]

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900">Pedidos</h1>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por cliente ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-300 focus:outline-none focus:ring-2 focus:ring-surface-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-surface-300 focus:outline-none focus:ring-2 focus:ring-surface-500"
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="parcial">Parcial</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <SkeletonTable rows={10} />
        ) : (
          <Table 
            columns={columns} 
            data={filteredOrders} 
            onRowClick={(row) => {
              setSelectedOrder(row)
              setShowModal(true)
            }}
            emptyMessage="Nenhum pedido encontrado"
          />
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Pedido #${selectedOrder?.id?.slice(0, 8)}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-surface-500">Cliente</p>
                <p className="font-medium">{selectedOrder.buyer_name}</p>
              </div>
              <div>
                <p className="text-sm text-surface-500">Telefone</p>
                <p className="font-medium">{selectedOrder.phone}</p>
              </div>
              <div>
                <p className="text-sm text-surface-500">Status</p>
                <StatusBadge status={selectedOrder.payment_status} />
              </div>
              <div>
                <p className="text-sm text-surface-500">Forma de Pagamento</p>
                <Badge>{paymentMethodLabels[selectedOrder.payment_method]}</Badge>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm text-surface-500 mb-2">Itens</p>
              <div className="space-y-2">
                {selectedOrder.order_items?.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.shirt_name} - {item.size} x {item.quantity}</span>
                    <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(selectedOrder.total)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
