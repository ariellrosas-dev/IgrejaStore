import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ShoppingCart, LogOut, Plus, Minus, Trash2, 
  X, CreditCard, Smartphone, Banknote,
  Package, ArrowLeft, User, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { 
  getShirtModels, addOrder as dbAddOrder, addCashFlow as dbAddCashFlow,
  updateModelStock as dbUpdateModelStock, getClients, addClient as dbAddClient, 
  initSettings 
} from './lib/database';

const ADMIN_EMAIL = 'ariellaureanorosas@gmail.com';
const ADMIN_PASSWORD = 'Ariel@2007';

const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function maskCPF(value) {
  if (!value) return '';
  return value.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validateCPF(cpf) {
  if (!cpf || cpf.length !== 14) return false;
  const numbers = cpf.replace(/\D/g, '');
  if (numbers.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(numbers)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;
  if (parseInt(numbers[9]) !== digit1) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;
  if (parseInt(numbers[10]) !== digit2) return false;
  
  return true;
}

function maskPhone(value) {
  if (!value) return '';
  return value.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{4})$/, '$1-$2');
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;
  
  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 1000,
      padding: '12px 20px', borderRadius: 8, color: 'white', fontWeight: 500,
      background: type === 'error' ? '#dc2626' : '#15803d',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      {message}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div 
      onClick={onClose} 
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }}
    >
      <div 
        onClick={e => e.stopPropagation()} 
        style={{
          background: 'white', borderRadius: 12, maxWidth: 450, width: '90%', 
          maxHeight: '90vh', overflow: 'auto'
        }}
      >
        <div style={{ 
          padding: 20, borderBottom: '1px solid #eee', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
        }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

function AuthModal({ authMode, authForm, handleInputChange, handleLogin, handleRegister, setAuthMode, setShowAuth }) {
  const [emailTouched, setEmailTouched] = useState(false);
  const [cpfTouched, setCpfTouched] = useState(false);
  
  const emailValid = authForm.email.length > 0 ? validateEmail(authForm.email) : null;
  const cpfValid = authForm.cpf.length > 0 ? validateCPF(authForm.cpf) : null;
  const phoneValid = authForm.phone.length >= 14;
  const nameValid = authForm.name.trim().length >= 2;
  
  return (
    <Modal title={authMode === 'login' ? 'Entrar' : 'Cadastre-se'} onClose={() => setShowAuth(false)}>
      <form onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
        {authMode === 'register' && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
                Nome completo <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  value={authForm.name} 
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onBlur={() => {}}
                  style={{ 
                    width: '100%', padding: '12px 40px 12px 12px', border: nameValid ? '2px solid #15803d' : '1px solid #ddd', 
                    borderRadius: 8, fontSize: 14, boxSizing: 'border-box' 
                  }}
                  placeholder="Seu nome completo"
                />
                {nameValid && (
                  <CheckCircle style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#15803d' }} size={20} />
                )}
              </div>
              {authForm.name.length > 0 && !nameValid && (
                <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>Nome deve ter pelo menos 2 caracteres</p>
              )}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>CPF</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  value={authForm.cpf} 
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  onBlur={() => setCpfTouched(true)}
                  style={{ 
                    width: '100%', padding: '12px 40px 12px 12px', border: cpfValid === null ? '1px solid #ddd' : cpfValid ? '2px solid #15803d' : '2px solid #dc2626', 
                    borderRadius: 8, fontSize: 14, boxSizing: 'border-box' 
                  }}
                  placeholder="000.000.000-00"
                />
                {cpfValid !== null && (
                  cpfValid ? (
                    <CheckCircle style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#15803d' }} size={20} />
                  ) : (
                    <XCircle style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#dc2626' }} size={20} />
                  )
                )}
              </div>
              {cpfTouched && !cpfValid && authForm.cpf.length > 0 && (
                <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>CPF inválido</p>
              )}
            </div>
          </>
        )}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
            Email <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input 
              type="email" 
              value={authForm.email} 
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => setEmailTouched(true)}
              style={{ 
                width: '100%', padding: '12px 40px 12px 12px', border: emailValid === null ? '1px solid #ddd' : emailValid ? '2px solid #15803d' : '2px solid #dc2626', 
                borderRadius: 8, fontSize: 14, boxSizing: 'border-box' 
              }}
              placeholder="seu@email.com"
            />
            {emailValid !== null && (
              emailValid ? (
                <CheckCircle style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#15803d' }} size={20} />
              ) : (
                <XCircle style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#dc2626' }} size={20} />
              )
            )}
          </div>
          {emailTouched && !emailValid && authForm.email.length > 0 && (
            <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>Email inválido</p>
          )}
        </div>
        {authMode === 'login' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Senha</label>
            <input 
              type="password" 
              value={authForm.password} 
              onChange={(e) => handleInputChange('password', e.target.value)}
              style={{ width: '100%', padding: '12px', border: authForm.password.length > 0 ? '2px solid #15803d' : '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
              placeholder="Sua senha"
            />
          </div>
        )}
        {authMode === 'register' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
              Telefone <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                value={authForm.phone} 
                onChange={(e) => handleInputChange('phone', e.target.value)}
                style={{ 
                  width: '100%', padding: '12px 40px 12px 12px', border: phoneValid ? '2px solid #15803d' : '1px solid #ddd', 
                  borderRadius: 8, fontSize: 14, boxSizing: 'border-box' 
                }}
                placeholder="(81) 99999-9999"
              />
              {phoneValid && (
                <CheckCircle style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#15803d' }} size={20} />
              )}
            </div>
            {!phoneValid && authForm.phone.length > 0 && (
              <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>Telefone incompleto</p>
            )}
          </div>
        )}
        <button 
          type="submit" 
          style={{ 
            width: '100%', padding: '12px', background: '#0d1117', color: 'white', 
            border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, 
            cursor: 'pointer', marginTop: 8 
          }}
        >
          {authMode === 'login' ? 'Entrar' : 'Cadastrar'}
        </button>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
          {authMode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
          <button 
            type="button" 
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            style={{ background: 'none', border: 'none', color: '#c8922a', cursor: 'pointer', fontWeight: 600 }}
          >
            {authMode === 'login' ? 'Cadastre-se' : 'Entrar'}
          </button>
        </p>
      </form>
    </Modal>
  );
}

function ProductCard({ model, addToCart, showToast }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [showPicker, setShowPicker] = useState(false);

  const availableSizes = useMemo(() => 
    model.sizes.filter(s => (model.stock[s] || 0) > 0), 
    [model.sizes, model.stock]
  );

  const handleAdd = useCallback(() => {
    if (!selectedSize) {
      showToast('Selecione um tamanho', 'error');
      return;
    }
    addToCart(model, selectedSize, qty);
    setShowPicker(false);
    setSelectedSize('');
    setQty(1);
  }, [selectedSize, qty, model, addToCart, showToast]);

  const handleSizeSelect = useCallback((size, stock) => {
    if (stock > 0) setSelectedSize(size);
  }, []);

  return (
    <div style={{ 
      background: 'white', borderRadius: 12, overflow: 'hidden', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)' 
    }}>
      <div style={{ 
        height: 160, background: model.color === 'Branca' ? '#f5f5f5' : model.color === 'Azul Marinho' ? '#1e3a5f' : model.color === 'Verde' ? '#2d5a3d' : '#ddd', 
        display: 'flex', alignItems: 'center', justifyContent: 'center' 
      }}>
        <Package size={48} style={{ color: model.color === 'Branca' ? '#999' : 'rgba(255,255,255,0.5)' }} />
      </div>
      <div style={{ padding: 16 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600 }}>{model.name}</h3>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#666' }}>{model.description}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#0d1117' }}>{fmt(model.price)}</span>
          {availableSizes.length > 0 ? (
            <button 
              onClick={() => setShowPicker(true)}
              style={{ 
                background: '#0d1117', color: 'white', border: 'none', 
                padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 
              }}
            >
              Comprar
            </button>
          ) : (
            <span style={{ color: '#dc2626', fontSize: 12, fontWeight: 500 }}>Esgotado</span>
          )}
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 11, color: '#888' }}>Tamanhos: {model.sizes.join(', ')}</p>
      </div>

      {showPicker && (
        <Modal title="Escolher Tamanho" onClose={() => setShowPicker(false)}>
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 500 }}>Tamanho:</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {model.sizes.map(size => {
                const stock = model.stock[size] || 0;
                return (
                  <button
                    key={size}
                    onClick={() => handleSizeSelect(size, stock)}
                    disabled={stock === 0}
                    style={{
                      padding: '10px 16px',
                      border: selectedSize === size ? '2px solid #0d1117' : '1px solid #ddd',
                      background: stock === 0 ? '#f5f5f5' : selectedSize === size ? '#0d1117' : 'white',
                      color: stock === 0 ? '#aaa' : selectedSize === size ? 'white' : '#333',
                      borderRadius: 6,
                      cursor: stock === 0 ? 'not-allowed' : 'pointer',
                      fontWeight: 600
                    }}
                  >
                    {size} {stock === 0 && '(esgotado)'}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 500 }}>Quantidade:</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 36, height: 36, border: '1px solid #ddd', background: 'white', borderRadius: 6, cursor: 'pointer' }}>
                <Minus size={16} />
              </button>
              <span style={{ fontSize: 16, fontWeight: 600, minWidth: 30, textAlign: 'center' }}>{qty}</span>
              <button onClick={() => setQty(qty + 1)} style={{ width: 36, height: 36, border: '1px solid #ddd', background: 'white', borderRadius: 6, cursor: 'pointer' }}>
                <Plus size={16} />
              </button>
            </div>
          </div>
          <button onClick={handleAdd} style={{ 
            width: '100%', padding: 12, background: '#c8922a', color: 'white', 
            border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' 
          }}>
            Adicionar — {fmt(qty * model.price)}
          </button>
        </Modal>
      )}
    </div>
  );
}

export default function Loja() {
  const [view, setView] = useState('home');
  const [models, setModels] = useState([]);
  const [cart, setCart] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', phone: '', cpf: '', password: '' });
  const [client, setClient] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      try {
        await initSettings();
        const data = await getShirtModels();
        if (mounted) {
          setModels(data);
          const savedClient = localStorage.getItem('loja_cliente');
          if (savedClient) {
            setClient(JSON.parse(savedClient));
          }
          const savedAdmin = localStorage.getItem('loja_admin');
          if (savedAdmin === 'true') {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    loadData();
    
    return () => { mounted = false; };
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToastMsg(message);
    setToastType(type);
  }, []);

  const closeToast = useCallback(() => {
    setToastMsg('');
  }, []);

  const handleInputChange = useCallback((field, value) => {
    let formattedValue = value;
    if (field === 'cpf') formattedValue = maskCPF(value);
    if (field === 'phone') formattedValue = maskPhone(value);
    setAuthForm(prev => ({ ...prev, [field]: formattedValue }));
  }, []);

  const addToCart = useCallback((model, size, qty = 1) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.modelId === model.id && item.size === size);
      if (existing) {
        return prevCart.map(item => 
          item.modelId === model.id && item.size === size 
            ? { ...item, quantity: item.quantity + qty, subtotal: (item.quantity + qty) * item.unitPrice }
            : item
        );
      } else {
        return [...prevCart, { 
          modelId: model.id, 
          modelName: model.name, 
          size, 
          quantity: qty, 
          unitPrice: model.price,
          subtotal: qty * model.price,
          color: model.color
        }];
      }
    });
    showToast('Adicionado ao carrinho!');
  }, [showToast]);

  const updateCartQty = useCallback((idx, qty) => {
    setCart(prevCart => {
      if (qty < 1) {
        return prevCart.filter((_, i) => i !== idx);
      }
      return prevCart.map((item, i) => i === idx ? { ...item, quantity: qty, subtotal: qty * item.unitPrice } : item);
    });
  }, []);

  const removeFromCart = useCallback((idx) => {
    setCart(prevCart => prevCart.filter((_, i) => i !== idx));
  }, []);

  const cartTotal = useMemo(() => cart.reduce((a, item) => a + item.subtotal, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((a, item) => a + item.quantity, 0), [cart]);

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    
    // Verificar se é login de admin
    if (authForm.email === ADMIN_EMAIL && authForm.password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem('loja_admin', 'true');
      setShowAuth(false);
      showToast('Bem-vindo, Administrador!');
      return;
    }
    
    if (!validateEmail(authForm.email)) {
      showToast('Email inválido', 'error');
      return;
    }
    
    const clients = await getClients();
    const found = clients.find(c => c.email === authForm.email);
    if (found) {
      setClient(found);
      localStorage.setItem('loja_cliente', JSON.stringify(found));
      setShowAuth(false);
      showToast('Bem-vindo de volta!');
    } else {
      showToast('Email não cadastrado. Faça seu cadastro!', 'error');
    }
  }, [authForm.email, authForm.password, showToast]);

  const handleRegister = useCallback(async (e) => {
    e.preventDefault();
    if (!authForm.name.trim() || !authForm.email.trim() || !authForm.phone.trim()) {
      showToast('Preencha todos os campos obrigatórios', 'error');
      return;
    }
    if (!validateEmail(authForm.email)) {
      showToast('Email inválido', 'error');
      return;
    }
    if (authForm.cpf && !validateCPF(authForm.cpf)) {
      showToast('CPF inválido', 'error');
      return;
    }
    const clients = await getClients();
    const exists = clients.find(c => c.email === authForm.email);
    if (exists) {
      showToast('Email já cadastrado', 'error');
      return;
    }
    
    const id = await dbAddClient({
      name: authForm.name,
      email: authForm.email,
      phone: authForm.phone,
      cpf: authForm.cpf || ''
    });
    const newClient = { id, ...authForm, confirmed: true };
    setClient(newClient);
    localStorage.setItem('loja_cliente', JSON.stringify(newClient));
    setShowAuth(false);
    setAuthForm({ name: '', email: '', phone: '', cpf: '', password: '' });
    showToast('Cadastro realizado com sucesso!');
  }, [authForm, showToast]);

  const handleLogout = useCallback(() => {
    setClient(null);
    setIsAdmin(false);
    localStorage.removeItem('loja_cliente');
    localStorage.removeItem('loja_admin');
    setView('home');
    showToast('Logout realizado');
  }, [showToast]);

  const handleCheckout = useCallback(async (paymentMethod) => {
    if (!client) {
      setShowAuth(true);
      setAuthMode('register');
      showToast('Faça login ou cadastre-se para finalizar', 'error');
      return;
    }
    if (cart.length === 0) {
      showToast('Carrinho vazio', 'error');
      return;
    }

    const id = `PED-${Date.now().toString().slice(-6)}`;
    const order = {
      id,
      date: new Date().toISOString().slice(0, 10),
      buyerName: client.name,
      cpf: client.cpf || '',
      phone: client.phone,
      items: cart,
      total: cartTotal,
      paymentMethod,
      paymentStatus: 'Pago',
      amountPaid: cartTotal,
      amountDue: 0,
      notes: '',
      registeredBy: 'Loja Online',
      createdAt: new Date().toISOString()
    };

    for (const item of cart) {
      const model = models.find(m => m.id === item.modelId);
      if (model) {
        const newStock = { ...model.stock };
        newStock[item.size] = (newStock[item.size] || 0) - item.quantity;
        await dbUpdateModelStock(model.id, newStock);
      }
    }

    await dbAddOrder(order);
    const cashEntry = {
      id: `CF-${Date.now()}`,
      date: order.date,
      description: `Venda — ${client.name} (${id})`,
      type: 'entrada',
      category: 'Venda',
      method: paymentMethod,
      amount: cartTotal,
      orderId: id,
      registeredBy: 'Loja Online'
    };
    await dbAddCashFlow(cashEntry);

    setCart([]);
    showToast(`Pedido ${id} realizado com sucesso!`);
    setView('home');
  }, [client, cart, cartTotal, models, showToast]);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', display: 'flex', alignItems: 'center', 
        justifyContent: 'center', background: '#f8f9fa' 
      }}>
        <p>Carregando...</p>
      </div>
    );
  }

  const Header = () => (
    <header style={{ 
      position: 'sticky', top: 0, background: '#0d1117', color: 'white', 
      padding: '12px 20px', zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' 
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setView('home')}>
          <Package size={24} />
          <span style={{ fontSize: 18, fontWeight: 700 }}>Loja de Camisas</span>
        </div>
        
        <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button 
            onClick={() => setView('home')} 
            style={{ 
              background: 'none', border: 'none', color: view === 'home' ? '#c8922a' : 'white', 
              cursor: 'pointer', fontSize: 14 
            }}
          >
            Catálogo
          </button>
          {client && <span style={{ color: '#888', fontSize: 13 }}>Olá, {client.name.split(' ')[0]}</span>}
          
          <button 
            onClick={() => setView('cart')} 
            style={{ position: 'relative', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span style={{ 
                position: 'absolute', top: -8, right: -8, background: '#c8922a', 
                color: 'white', borderRadius: '50%', width: 18, height: 18, 
                fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                {cartCount}
              </span>
            )}
          </button>
          
          {isAdmin && (
            <button 
              onClick={() => window.location.href = '/admin.html'} 
              style={{ 
                background: '#15803d', border: 'none', color: 'white', 
                padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 
              }}
            >
              Admin
            </button>
          )}
          
          {client ? (
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6 }}>
              <User size={16} />
              <span style={{ fontSize: 13 }}>Sair</span>
            </button>
          ) : (
            <button 
              onClick={() => { setShowAuth(true); setAuthMode('login'); }} 
              style={{ 
                background: '#c8922a', border: 'none', color: 'white', 
                padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 
              }}
            >
              Entrar
            </button>
          )}
        </nav>
      </div>
    </header>
  );

  const HomeView = () => (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Camisas Oficiais</h1>
        <p style={{ color: '#666', fontSize: 16 }}>Escolha seu modelo e tamanho</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
        {models.map(model => (
          <ProductCard key={model.id} model={model} addToCart={addToCart} showToast={showToast} />
        ))}
      </div>
      {models.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>
          <Package size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
          <p>Nenhum produto disponível no momento.</p>
        </div>
      )}
    </div>
  );

  const CartView = () => (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <button 
        onClick={() => setView('home')} 
        style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#666', marginBottom: 20 }}
      >
        <ArrowLeft size={18} /> Voltar às compras
      </button>
      
      <h2 style={{ marginBottom: 24 }}>Meu Carrinho ({cartCount})</h2>
      
      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>
          <ShoppingCart size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
          <p style={{ marginBottom: 20 }}>Seu carrinho está vazio</p>
          <button 
            onClick={() => setView('home')} 
            style={{ 
              background: '#0d1117', color: 'white', border: 'none', 
              padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 
            }}
          >
            Ver produtos
          </button>
        </div>
      ) : (
        <>
          <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            {cart.map((item, idx) => (
              <div key={idx} style={{ padding: 16, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 60, height: 60, background: '#f5f5f5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: 14 }}>{item.modelName}</h4>
                  <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Tamanho: {item.size}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => updateCartQty(idx, item.quantity - 1)} style={{ width: 28, height: 28, border: '1px solid #ddd', background: 'white', borderRadius: 4, cursor: 'pointer' }}>
                    <Minus size={14} />
                  </button>
                  <span style={{ minWidth: 24, textAlign: 'center', fontSize: 14 }}>{item.quantity}</span>
                  <button onClick={() => updateCartQty(idx, item.quantity + 1)} style={{ width: 28, height: 28, border: '1px solid #ddd', background: 'white', borderRadius: 4, cursor: 'pointer' }}>
                    <Plus size={14} />
                  </button>
                </div>
                <div style={{ textAlign: 'right', minWidth: 80 }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{fmt(item.subtotal)}</p>
                </div>
                <button onClick={() => removeFromCart(idx)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: 24, background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 18 }}>Total:</span>
              <span style={{ fontSize: 24, fontWeight: 700 }}>{fmt(cartTotal)}</span>
            </div>
            
            <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 500 }}>Forma de pagamento:</p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <button 
                onClick={() => handleCheckout('PIX')} 
                style={{ flex: '1 1 120px', padding: 14, border: '1px solid #ddd', background: 'white', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Smartphone size={18} /> PIX
              </button>
              <button 
                onClick={() => handleCheckout('Cartão')} 
                style={{ flex: '1 1 120px', padding: 14, border: '1px solid #ddd', background: 'white', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <CreditCard size={18} /> Cartão
              </button>
              <button 
                onClick={() => handleCheckout('Dinheiro')} 
                style={{ flex: '1 1 120px', padding: 14, border: '1px solid #ddd', background: 'white', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Banknote size={18} /> Dinheiro
              </button>
            </div>
            
            <button 
              onClick={() => handleCheckout('PIX')} 
              style={{ 
                width: '100%', padding: 14, background: '#c8922a', color: 'white', 
                border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer' 
              }}
            >
              Finalizar Compra
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div 
      className="loja-page"
      style={{ 
        minHeight: '100vh', 
        background: '#f8f9fa', 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden'
      }}
    >
      <Header />
      
      {view === 'home' && <HomeView />}
      {view === 'cart' && <CartView />}
      
      {showAuth && (
        <AuthModal 
          authMode={authMode} 
          authForm={authForm} 
          handleInputChange={handleInputChange} 
          handleLogin={handleLogin} 
          handleRegister={handleRegister} 
          setAuthMode={setAuthMode}
          setShowAuth={setShowAuth}
        />
      )}
      
      <Toast message={toastMsg} type={toastType} onClose={closeToast} />
    </div>
  );
}
