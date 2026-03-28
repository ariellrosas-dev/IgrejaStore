import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { formatCurrency, formatDate } from '../../lib/utils'
import { cashFlowSchema } from '../../lib/schemas'
import { Table } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { SkeletonTable } from '../../components/ui/Skeleton'

const CATEGORIES = {
  entrada: ['Venda', 'Pix Recebido', 'Dinheiro', 'Cartão', 'Outro'],
  saída: ['Fornecedor', 'Material', 'Serviço', 'Despesa', 'Outro']
}

export default function CashFlow() {
  const { profile } = useAuthStore()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [typeFilter, setTypeFilter] = useState('')
  const [search, setSearch] = useState('')
  const [totals, setTotals] = useState({ entrada: 0, saída: 0 })

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(cashFlowSchema),
    defaultValues: { type: 'entrada', date: new Date().toISOString().split('T')[0] }
  })

  const selectedType = watch('type')

  useEffect(() => {
    if (!profile?.church_id) return
    fetchEntries()
  }, [profile?.church_id])

  const fetchEntries = async () => {
    const { data } = await supabase
      .from('cash_flow')
      .select('*, profiles(name)')
      .eq('church_id', profile.church_id)
      .order('date', { ascending: false })

    const entrada = data?.filter(e => e.type === 'entrada').reduce((a, e) => a + e.amount, 0) || 0
    const saída = data?.filter(e => e.type === 'saída').reduce((a, e) => a + e.amount, 0) || 0

    setEntries(data || [])
    setTotals({ entrada, saída })
    setLoading(false)
  }

  const onSubmit = async (data) => {
    try {
      await supabase.from('cash_flow').insert({
        ...data,
        amount: parseFloat(data.amount),
        church_id: profile.church_id,
        registered_by: profile.id,
      })
      setShowModal(false)
      reset()
      fetchEntries()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const filteredEntries = entries.filter(e => {
    const matchesSearch = !search || e.description.toLowerCase().includes(search.toLowerCase())
    const matchesType = !typeFilter || e.type === typeFilter
    return matchesSearch && matchesType
  })

  const columns = [
    { header: 'Data', render: (row) => formatDate(row.date) },
    {
      header: 'Descrição',
      render: (row) => (
        <div>
          <p className="font-medium">{row.description}</p>
          <p className="text-xs text-surface-500">{row.category}</p>
        </div>
      )
    },
    {
      header: 'Tipo',
      render: (row) => (
        <Badge variant={row.type === 'entrada' ? 'success' : 'error'}>
          {row.type === 'entrada' ? 'Entrada' : 'Saída'}
        </Badge>
      )
    },
    {
      header: 'Método',
      accessor: 'method'
    },
    {
      header: 'Valor',
      render: (row) => (
        <span className={row.type === 'entrada' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          {row.type === 'entrada' ? '+' : '-'}{formatCurrency(row.amount)}
        </span>
      )
    },
  ]

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900">Fluxo de Caixa</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Nova Transação
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-surface-500">Entradas</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.entrada)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-surface-500">Saídas</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.saída)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-surface-500">Saldo</p>
          <p className="text-2xl font-bold text-surface-900">
            {formatCurrency(totals.entrada - totals.saída)}
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={20} />
          <input
            type="text"
            placeholder="Buscar transações..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-300 focus:outline-none focus:ring-2 focus:ring-surface-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-surface-300 focus:outline-none focus:ring-2 focus:ring-surface-500"
        >
          <option value="">Todos os tipos</option>
          <option value="entrada">Entrada</option>
          <option value="saída">Saída</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <SkeletonTable rows={10} />
        ) : (
          <Table 
            columns={columns} 
            data={filteredEntries}
            emptyMessage="Nenhuma transação encontrada"
          />
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          reset()
        }}
        title="Nova Transação"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Tipo"
            options={[
              { value: 'entrada', label: 'Entrada' },
              { value: 'saída', label: 'Saída' }
            ]}
            {...register('type')}
          />

          <Input
            label="Descrição"
            placeholder="Ex: Venda de camisa"
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor"
              type="number"
              step="0.01"
              placeholder="0,00"
              error={errors.amount?.message}
              {...register('amount')}
            />
            <Input
              label="Data"
              type="date"
              {...register('date')}
            />
          </div>

          <Select
            label="Categoria"
            options={(CATEGORIES[selectedType] || []).map(c => ({ value: c, label: c }))}
            {...register('category')}
          />

          <Select
            label="Método"
            options={[
              { value: 'pix', label: 'PIX' },
              { value: 'dinheiro', label: 'Dinheiro' },
              { value: 'cartao', label: 'Cartão' },
              { value: 'transferencia', label: 'Transferência' },
            ]}
            {...register('method')}
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
