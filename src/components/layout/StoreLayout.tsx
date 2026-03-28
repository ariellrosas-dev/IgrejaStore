import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, ShoppingCart, User, LogOut, Sun, Moon } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../ui/Button'

export function StoreLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useUIStore()
  const { itemCount } = useCartStore()
  const { user, client, signOut } = useAuthStore()
  const navigate = useNavigate()
  const cartCount = itemCount()

  const handleLogout = () => {
    signOut()
    navigate('/loja')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-gray-900 dark:bg-gray-900 text-white sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/loja" className="flex items-center gap-2">
            <Package size={24} />
            <span className="font-bold text-lg">Loja de Camisas</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-800">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {user || client ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300">{client?.name || user?.email}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut size={18} />
                </Button>
              </div>
            ) : (
              <Link to="/loja/login" className="p-2">
                <User size={24} />
              </Link>
            )}
            
            <Link to="/loja/carrinho" className="relative">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-gray-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
