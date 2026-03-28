import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Package, AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { formatCurrency } from '../../lib/utils'
import { shirtModelSchema } from '../../lib/schemas'
import { Table } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { SkeletonTable } from '../../components/ui/Skeleton'
import type { ShirtModel } from '../../types/models'
import type { z } from 'zod'

const COLORS = ['Branca', 'Preta', 'Azul Marinho', 'Verde', 'Vermelha', 'Amarela', 'Cinza', 'Rosa']
const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG']

type ShirtModelFormData = z.infer<typeof shirtModelSchema>

export default function Inventory() {
  const { profile, church } = useAuthStore()
  const [models, setModels] = useState<ShirtModel[]>([])
  const [inventory, setInventory] = useState<Record<string, Record<string, number>>>({})
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingModel, setEditingModel] = useState<ShirtModel | null>(null)
  const [search, setSearch] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ShirtModelFormData>({
    resolver: zodResolver(shirtModelSchema)
  })

  useEffect(() => {
    if (!profile?.church_id) return
    fetchModels()
  }, [profile?.church_id])

  const fetchModels = async () => {
    const { data } = await supabase
      .from('shirt_models')
      .select('*, inventory(*)')
      .eq('church_id', profile.church_id)
      .order('name')

    const inventoryMap: Record<string, Record<string, number>> = {}
    data?.forEach(model => {
      model.inventory?.forEach(inv => {
        if (!inventoryMap[model.id]) inventoryMap[model.id] = {}
        inventoryMap[model.id][inv.size] = inv.quantity
      })
    })

    setModels(data || [])
    setInventory(inventoryMap)
    setLoading(false)
  }

  const onSubmit = async (data: ShirtModelFormData) => {
    try {
      const sizes = data.sizes || SIZES
      const modelData = {
        ...data,
        sizes,
        price: parseFloat(String(data.price)),
        cost: parseFloat(String(data.cost)) || 0,
        church_id: profile.church_id,
      }

      if (editingModel) {
        await supabase.from('shirt_models').update(modelData).eq('id', editingModel.id)
      } else {
        const { data: newModel } = await supabase.from('shirt_models').insert(modelData).select().single()
        
        const inventoryData = sizes.map(size => ({
          shirt_model_id: newModel.id,
          size,
          quantity: 0,
        }))
        await supabase.from('inventory').insert(inventoryData)
      }

      setShowModal(false)
      setEditingModel(null)
      reset()
      fetchModels()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const updateStock = async (modelId: string, size: string, quantity: number) => {
    await supabase
      .from('inventory')
      .upsert({ shirt_model_id: modelId, size, quantity }, { onConflict: 'shirt_model_id,size' })
    fetchModels()
  }

  const deleteModel = async (modelId: string) => {
    if (confirm('Tem certeza que deseja excluir este modelo?')) {
      await supabase.from('shirt_models').delete().eq('id', modelId)
      fetchModels()
    }
  }

  const filteredModels = models.filter(m => 
    !search || m.name.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    {
      header: 'Modelo',
      render: (row: ShirtModel) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            row.color === 'Branca' ? 'bg-surface-200' : 'bg-surface-800 text-white'
          }`}>
            <Package size={20} />
          </div>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-surface-500">{row.color}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Preço',
      render: (row: ShirtModel) => formatCurrency(row.price)
    },
    {
      header: 'Estoque',
      render: (row: ShirtModel) => {
        const total = Object.values(inventory[row.id] || {}).reduce((a, b) => a + b, 0)
        const lowStock = church?.low_stock_alert || 3
        return (
          <div className="flex items-center gap-2">
            <span className={total <= lowStock ? 'text-red-600' : ''}>{total}</span>
            {total <= lowStock && <AlertTriangle size={14} className="text-red-500" />}
          </div>
        )
      }
    },
    {
      header: 'Tamanhos',
      render: (row: ShirtModel) => (
        <div className="flex gap-1 flex-wrap">
          {row.sizes?.map(size => {
            const qty = inventory[row.id]?.[size] || 0
            return (
              <button
                key={size}
                onClick={() => updateStock(row.id, size, qty + 1)}
                className={`px-2 py-1 text-xs rounded ${
                  qty === 0 ? 'bg-red-100 text-red-700' : 'bg-surface-100'
                }`}
                title={`${size}: ${qty} unidades`}
              >
                {size}: {qty}
              </button>
            )
          })}
        </div>
      )
    },
    {
      header: '',
      width: '100px',
      render: (row: ShirtModel) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => {
            setEditingModel(row)
            reset(row)
            setShowModal(true)
          }}>
            <Edit size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => deleteModel(row.id)}>
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900">Estoque</h1>
        <Button onClick={() => {
          setEditingModel(null)
          reset()
          setShowModal(true)
        }}>
          <Plus size={18} />
          Novo Modelo
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={20} />
        <input
          type="text"
          placeholder="Buscar modelos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-300 focus:outline-none focus:ring-2 focus:ring-surface-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <SkeletonTable rows={10} />
        ) : (
          <Table 
            columns={columns} 
            data={filteredModels}
            emptyMessage="Nenhum modelo cadastrado"
          />
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingModel(null)
          reset()
        }}
        title={editingModel ? 'Editar Modelo' : 'Novo Modelo'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome"
            placeholder="Ex: Camisa Oficial"
            error={errors.name?.message}
            {...register('name')}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Preço"
              type="number"
              step="0.01"
              placeholder="0,00"
              error={errors.price?.message}
              {...register('price')}
            />
            <Input
              label="Custo"
              type="number"
              step="0.01"
              placeholder="0,00"
              {...register('cost')}
            />
          </div>

          <Select
            label="Cor"
            options={COLORS.map(c => ({ value: c, label: c }))}
            error={errors.color?.message}
            {...register('color')}
          />

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Tamanhos</label>
            <div className="flex gap-2 flex-wrap">
              {SIZES.map(size => (
                <label key={size} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    value={size}
                    {...register('sizes')}
                    defaultChecked={editingModel?.sizes?.includes(size) || SIZES.includes(size)}
                  />
                  <span className="text-sm">{size}</span>
                </label>
              ))}
            </div>
          </div>

          <Input
            label="Descrição"
            placeholder="Descrição opcional..."
            {...register('description')}
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {editingModel ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
