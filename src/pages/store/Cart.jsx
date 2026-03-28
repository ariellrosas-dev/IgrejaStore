import { useState } from 'react'
import { ArrowLeft, Plus, Minus, Trash2, CreditCard, Smartphone, Banknote, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { formatCurrency, maskPhone, maskCPF } from '../../lib/utils'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'

export default function Cart() {
  const navigate = useNavigate()
  const { profile, church } = useAuthStore()
  const { items, updateQuantity, removeItem, getTotal, clearCart, client, setClient } = useCartStore()
  const [showCheckout, setShowCheckout] = useState(false)
  const [clientForm, setClientForm] = useState({ name: '', phone: '', cpf: '' })
  const [paymentMethod, setPaymentMethod] = useState(church?.default_payment_method || 'pix')
  const [processing, setProcessing] = useState(false)
  const [toast, setToast] = useState('')

  const total = getTotal()

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleCheckout = async () => {
    if (!clientForm.name || !clientForm.phone) {
      showToast('Preencha nome e telefone!')
      return
    }

    try {
      setProcessing(true)

      const { data: newClient } = await supabase
        .from('clients')
        .insert({
          name: clientForm.name,
          phone: clientForm.phone,
          cpf: clientForm.cpf || '',
          church_id: profile?.church_id,
        })
        .select()
        .single()

      const { data: order } = await supabase
        .from('orders')
        .insert({
          church_id: profile?.church_id,
          client_id: newClient?.id,
          buyer_name: clientForm.name,
          phone: clientForm.phone,
          cpf: clientForm.cpf,
          payment_method: paymentMethod,
          payment_status: 'pago',
          total,
          amount_paid: total,
          registered_by: profile?.id,
        })
        .select()
        .single()

      const orderItems = items.map(item => ({
        order_id: order.id,
        shirt_model_id: item.modelId,
        shirt_name: item.modelName,
        size: item.size,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      }))

      await supabase.from('order_items').insert(orderItems)

      if (paymentMethod === 'pix' || paymentMethod === 'dinheiro') {
        await supabase.from('cash_flow').insert({
          church_id: profile?.church_id,
          description: `Venda - ${clientForm.name}`,
          type: 'entrada',
          category: 'Venda',
          method: paymentMethod,
          amount: total,
          order_id: order.id,
          registered_by: profile?.id,
        })
      }

      setShowCheckout(false)
      clearCart()
      showToast('Pedido realizado com sucesso!')
      
      setTimeout(() => navigate('/loja'), 2000)
    } catch (err) {
      showToast('Erro: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-surface-300 mb-4" />
          <h2 className="text-xl font-semibold text-surface-900 mb-2">Carrinho vazio</h2>
          <p className="text-surface-500 mb-4">Adicione produtos para continuar</p>
          <Button onClick={() => navigate('/loja')}>
            Ver Catálogo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-surface-900 text-white sticky top-0">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate('/loja')}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-semibold">Meu Carrinho ({items.length})</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{item.modelName}</h3>
                <p className="text-sm text-surface-500">{item.color} - Tamanho {item.size}</p>
              </div>
              <button onClick={() => removeItem(item.id)}>
                <Trash2 size={18} className="text-red-500" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-1 rounded bg-surface-100"
                >
                  <Minus size={16} />
                </button>
                <span className="font-medium w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-1 rounded bg-surface-100"
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className="font-bold">{formatCurrency(item.subtotal)}</span>
            </div>
          </div>
        ))}

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <Button className="w-full" size="lg" onClick={() => setShowCheckout(true)}>
          Finalizar Pedido
        </Button>
      </main>

      {toast && (
        <div className="fixed bottom-4 right-4 bg-surface-900 text-white px-4 py-3 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}

      <Modal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        title="Finalizar Pedido"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Nome"
            placeholder="Nome completo"
            value={clientForm.name}
            onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
          />
          
          <Input
            label="Telefone"
            placeholder="(00) 00000-0000"
            value={clientForm.phone}
            onChange={(e) => setClientForm({ ...clientForm, phone: maskPhone(e.target.value) })}
          />

          <Input
            label="CPF (opcional)"
            placeholder="000.000.000-00"
            value={clientForm.cpf}
            onChange={(e) => setClientForm({ ...clientForm, cpf: maskCPF(e.target.value) })}
          />

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Forma de Pagamento</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'pix', label: 'PIX', icon: Smartphone },
                { value: 'dinheiro', label: 'Dinheiro', icon: Banknote },
                { value: 'cartao_debito', label: 'Débito', icon: CreditCard },
                { value: 'cartao_credito', label: 'Crédito', icon: CreditCard },
              ].map(method => (
                <button
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value)}
                  className={`p-3 rounded-lg border flex items-center justify-center gap-2 ${
                    paymentMethod === method.value
                      ? 'border-surface-900 bg-surface-900 text-white'
                      : 'border-surface-200'
                  }`}
                >
                  <method.icon size={18} />
                  <span className="text-sm">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total a pagar</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <Button 
            className="w-full" 
            size="lg" 
            loading={processing}
            onClick={handleCheckout}
          >
            Confirmar Pedido
          </Button>
        </div>
      </Modal>
    </div>
  )
}
