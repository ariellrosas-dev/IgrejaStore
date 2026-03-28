import { useState, useEffect } from 'react'
import { Save, Trash2, UserPlus, LogOut } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { churchSettingsSchema } from '../../lib/schemas'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { useUIStore } from '../../store/uiStore'
import type { Church, Leader } from '../../types/models'
import type { z } from 'zod'

type ChurchSettingsFormData = z.infer<typeof churchSettingsSchema>

export default function Settings() {
  const { profile, church, signOut } = useAuthStore()
  const { success, error } = useUIStore()
  const [leaders, setLeaders] = useState<Leader[]>([])
  const [saving, setSaving] = useState(false)
  const [newLeader, setNewLeader] = useState('')

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ChurchSettingsFormData>({
    resolver: zodResolver(churchSettingsSchema)
  })

  useEffect(() => {
    if (church) {
      reset({
        name: church.name || '',
        address: church.address || '',
        phone: church.phone || '',
        pix_key: church.pix_key || '',
        city: church.city || '',
        default_payment_method: church.default_payment_method || 'pix',
        low_stock_alert: church.low_stock_alert || 3,
      })
    }
    fetchLeaders()
  }, [church])

  const fetchLeaders = async () => {
    if (!profile?.church_id) return
    const { data } = await supabase
      .from('leaders')
      .select('*')
      .eq('church_id', profile.church_id)
      .order('name')
    setLeaders(data || [])
  }

  const onSubmit = async (data: ChurchSettingsFormData) => {
    try {
      setSaving(true)
      if (church) {
        await supabase.from('churches').update(data).eq('id', church.id)
      } else {
        const { data: newChurch } = await supabase.from('churches').insert(data).select().single()
        await supabase.from('profiles').update({ church_id: newChurch.id }).eq('id', profile.id)
      }
      success('Configurações salvas!')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      error('Erro ao salvar: ' + errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const addLeader = async () => {
    if (!newLeader.trim()) return
    await supabase.from('leaders').insert({
      name: newLeader.trim(),
      church_id: profile.church_id,
    })
    setNewLeader('')
    fetchLeaders()
  }

  const deleteLeader = async (id: string) => {
    if (confirm('Excluir líder?')) {
      await supabase.from('leaders').delete().eq('id', id)
      fetchLeaders()
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-surface-900">Configurações</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-surface-900 mb-4">Informações da Igreja</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome da Igreja"
            placeholder="Igreja Batista"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Telefone"
              placeholder="(00) 00000-0000"
              {...register('phone')}
            />
            <Input
              label="Cidade"
              placeholder="São Paulo"
              {...register('city')}
            )}
          </div>

          <Input
            label="Endereço"
            placeholder="Rua, número, bairro..."
            {...register('address')}
          />

          <Input
            label="Chave PIX"
            placeholder="CPF, CNPJ, email ou telefone"
            {...register('pix_key')}
          />

          <Select
            label="Método de Pagamento Padrão"
            options={[
              { value: 'pix', label: 'PIX' },
              { value: 'dinheiro', label: 'Dinheiro' },
              { value: 'cartao_debito', label: 'Cartão Débito' },
              { value: 'cartao_credito', label: 'Cartão Crédito' },
              { value: 'fiado', label: 'Fiado' },
            ]}
            {...register('default_payment_method')}
          />

          <Input
            label="Alerta de Estoque Baixo"
            type="number"
            {...register('low_stock_alert', { valueAsNumber: true })}
          />

          <Button type="submit" loading={saving}>
            <Save size={18} />
            Salvar Configurações
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-surface-900 mb-4">Líderes</h2>
        
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Nome do líder"
            value={newLeader}
            onChange={(e) => setNewLeader(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addLeader()}
          />
          <Button onClick={addLeader}>
            <UserPlus size={18} />
          </Button>
        </div>

        <div className="space-y-2">
          {leaders.map(leader => (
            <div key={leader.id} className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
              <span>{leader.name}</span>
              <Button variant="ghost" size="sm" onClick={() => deleteLeader(leader.id)}>
                <Trash2 size={16} className="text-red-500" />
              </Button>
            </div>
          ))}
          {leaders.length === 0 && (
            <p className="text-surface-500 text-center py-4">Nenhum líder cadastrado</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-surface-900 mb-4">Conta</h2>
        <p className="text-surface-600 mb-4">
          Logado como: <strong>{profile?.name}</strong> ({profile?.role})
        </p>
        <Button variant="danger" onClick={signOut}>
          <LogOut size={18} />
          Sair
        </Button>
      </div>
    </div>
  )
}
