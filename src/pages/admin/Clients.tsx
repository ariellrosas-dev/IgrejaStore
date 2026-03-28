import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { maskPhone, maskCPF } from '../../lib/utils'
import { clientSchema } from '../../lib/schemas'
import { Table } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { SkeletonTable } from '../../components/ui/Skeleton'
import type { Client } from '../../types/models'
import type { z } from 'zod'

type ClientFormData = z.infer<typeof clientSchema>

export default function Clients() {
  const { profile } = useAuthStore()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [search, setSearch] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema)
  })

  useEffect(() => {
    if (!profile?.church_id) return
    fetchClients()
  }, [profile?.church_id])

  const fetchClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('church_id', profile.church_id)
      .order('name')

    setClients(data || [])
    setLoading(false)
  }

  const onSubmit = async (data: ClientFormData) => {
    try {
      if (editingClient) {
        await supabase.from('clients').update(data).eq('id', editingClient.id)
      } else {
        await supabase.from('clients').insert({ ...data, church_id: profile.church_id })
      }
      setShowModal(false)
      setEditingClient(null)
      reset()
      fetchClients()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const deleteClient = async (clientId: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      await supabase.from('clients').delete().eq('id', clientId)
      fetchClients()
    }
  }

  const filteredClients = clients.filter(c => 
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  const columns = [
    {
      header: 'Cliente',
      render: (row: Client) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center">
            <User size={20} className="text-surface-400" />
          </div>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-surface-500">{row.email}</p>
          </div>
        </div>
      )
    },
    { header: 'Telefone', accessor: 'phone' },
    { header: 'CPF', accessor: 'cpf' },
    { header: 'Endereço', accessor: 'address' },
    {
      header: '',
      width: '100px',
      render: (row: Client) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => {
            setEditingClient(row)
            reset(row)
            setShowModal(true)
          }}>
            <Edit size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => deleteClient(row.id)}>
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900">Clientes</h1>
        <Button onClick={() => {
          setEditingClient(null)
          reset()
          setShowModal(true)
        }}>
          <Plus size={18} />
          Novo Cliente
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={20} />
        <input
          type="text"
          placeholder="Buscar clientes..."
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
            data={filteredClients}
            emptyMessage="Nenhum cliente cadastrado"
          />
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingClient(null)
          reset()
        }}
        title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome"
            placeholder="Nome completo"
            error={errors.name?.message}
            {...register('name')}
          />
          
          <Input
            label="Email"
            type="email"
            placeholder="email@exemplo.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Telefone"
            placeholder="(00) 00000-0000"
            error={errors.phone?.message}
            {...register('phone')}
            onChange={(e) => {
              e.target.value = maskPhone(e.target.value)
            }}
          />

          <Input
            label="CPF"
            placeholder="000.000.000-00"
            {...register('cpf')}
            onChange={(e) => {
              e.target.value = maskCPF(e.target.value)
            }}
          />

          <Input
            label="Endereço"
            placeholder="Rua, número, bairro..."
            {...register('address')}
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {editingClient ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
