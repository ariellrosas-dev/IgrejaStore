import { useState, useEffect } from 'react'
import { ShoppingCart, Package, Plus, Minus, Search, User, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useCartStore } from '../../store/cartStore'
import { formatCurrency, maskPhone } from '../../lib/utils'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'

export default function Catalog() {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedModel, setSelectedModel] = useState(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [client, setClient] = useState(null)
  const [toast, setToast] = useState('')

  const { items, addItem, getItemCount } = useCartStore()
  const cartCount = getItemCount()

  useEffect(() => {
    fetchModels()
    const savedClient = localStorage.getItem('churchgear_client')
    if (savedClient) setClient(JSON.parse(savedClient))
  }, [])

  const fetchModels = async () => {
    const { data } = await supabase
      .from('shirt_models')
      .select('*, inventory(*)')
      .eq('active', true)
      .order('name')
    setModels(data || [])
    setLoading(false)
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      showToast('Selecione um tamanho!')
      return
    }
    addItem(selectedModel, selectedSize, quantity)
    setSelectedModel(null)
    setSelectedSize('')
    setQuantity(1)
    showToast('Adicionado ao carrinho!')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authForm.email,
        password: authForm.password
      })
      if (error) throw error
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, churches(*)')
        .eq('id', data.user.id)
        .single()
      
      setClient(profile)
      localStorage.setItem('churchgear_client', JSON.stringify(profile))
      setShowAuth(false)
      showToast('Bem-vindo!')
    } catch (err) {
      showToast('Erro: ' + err.message)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase.auth.signUp({
        email: authForm.email,
        password: authForm.password,
        options: { data: { name: authForm.name } }
      })
      if (error) throw error
      
      showToast('Cadastro realizado! Faça login.')
      setAuthMode('login')
    } catch (err) {
      showToast('Erro: ' + err.message)
    }
  }

  const handleLogout = () => {
    setClient(null)
    localStorage.removeItem('churchgear_client')
    supabase.auth.signOut()
  }

  const filteredModels = models.filter(m => 
    !search || m.name.toLowerCase().includes(search.toLowerCase())
  )

  const getStock = (model, size) => {
    const inv = model.inventory?.find(i => i.size === size)
    return inv?.quantity || 0
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-surface-900 text-white sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package size={24} />
            <span className="font-bold text-lg">Loja de Camisas</span>
          </div>
          
          <div className="flex items-center gap-4">
            {client ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-surface-300">Olá, {client.name}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut size={18} />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setShowAuth(true)}>
                <User size={18} />
              </Button>
            )}
            <a href="#cart" className="relative">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-surface-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={20} />
          <input
            type="text"
            placeholder="Buscar modelos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 bg-white"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-surface-500">Carregando...</div>
        ) : filteredModels.length === 0 ? (
          <div className="text-center py-12 text-surface-500">Nenhum produto encontrado</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredModels.map(model => {
              const totalStock = model.inventory?.reduce((a, b) => a + b.quantity, 0) || 0
              return (
                <div 
                  key={model.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm"
                >
                  <div className={`h-32 ${model.color === 'Branca' ? 'bg-surface-100' : 'bg-surface-800'}`}>
                    <div className="h-full flex items-center justify-center">
                      <Package size={40} className={model.color === 'Branca' ? 'text-surface-400' : 'text-surface-200'} />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-surface-900">{model.name}</h3>
                    <p className="text-sm text-surface-500">{model.color}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-lg">{formatCurrency(model.price)}</span>
                      {totalStock > 0 ? (
                        <Button size="sm" onClick={() => { setSelectedModel(model); setSelectedSize(''); }}>
                          Comprar
                        </Button>
                      ) : (
                        <Badge variant="error">Esgotado</Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {toast && (
        <div className="fixed bottom-4 right-4 bg-surface-900 text-white px-4 py-3 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}

      <Modal
        isOpen={selectedModel}
        onClose={() => setSelectedModel(null)}
        title={selectedModel?.name}
      >
        <div className="space-y-4">
          <p className="text-2xl font-bold">{formatCurrency(selectedModel?.price)}</p>
          
          <div>
            <p className="text-sm font-medium text-surface-700 mb-2">Tamanho:</p>
            <div className="flex gap-2 flex-wrap">
              {selectedModel?.sizes?.map(size => {
                const stock = getStock(selectedModel, size)
                return (
                  <button
                    key={size}
                    onClick={() => stock > 0 && setSelectedSize(size)}
                    disabled={stock === 0}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      selectedSize === size 
                        ? 'bg-surface-900 text-white' 
                        : stock === 0 
                          ? 'bg-surface-100 text-surface-400 cursor-not-allowed'
                          : 'bg-surface-100 text-surface-700'
                    }`}
                  >
                    {size} {stock === 0 && '(0)'}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-surface-700 mb-2">Quantidade:</p>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Minus size={16} />
              </Button>
              <span className="font-medium text-lg">{quantity}</span>
              <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)}>
                <Plus size={16} />
              </Button>
            </div>
          </div>

          <Button className="w-full" onClick={handleAddToCart}>
            Adicionar ao Carrinho - {formatCurrency(selectedModel?.price * quantity)}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        title={authMode === 'login' ? 'Entrar' : 'Cadastrar'}
      >
        <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
          {authMode === 'register' && (
            <Input
              label="Nome"
              value={authForm.name}
              onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
            />
          )}
          <Input
            label="Email"
            type="email"
            value={authForm.email}
            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
          />
          <div className="relative">
            <Input
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-surface-400"
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          
          <Button type="submit" className="w-full">
            {authMode === 'login' ? 'Entrar' : 'Cadastrar'}
          </Button>
          
          <p className="text-center text-sm text-surface-500">
            {authMode === 'login' ? (
              <>Não tem conta? <button type="button" onClick={() => setAuthMode('register')} className="text-primary-600">Cadastre-se</button></>
            ) : (
              <>Já tem conta? <button type="button" onClick={() => setAuthMode('login')} className="text-primary-600">Entre</button></>
            )}
          </p>
        </form>
      </Modal>
    </div>
  )
}
