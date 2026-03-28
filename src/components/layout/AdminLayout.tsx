import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { 
  LayoutDashboard, ShoppingCart, Package, DollarSign, 
  Users, FileText, Settings, Menu, X, LogOut, Sun, Moon,
  Store
} from 'lucide-react'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/pedidos', icon: ShoppingCart, label: 'Pedidos' },
  { path: '/estoque', icon: Package, label: 'Estoque' },
  { path: '/clientes', icon: Users, label: 'Clientes' },
  { path: '/caixa', icon: DollarSign, label: 'Caixa' },
  { path: '/relatorios', icon: FileText, label: 'Relatórios' },
  { path: '/ajustes', icon: Settings, label: 'Configurações' },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuthStore()
  const { sidebarOpen, toggleSidebar, theme, toggleTheme } = useUIStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Desktop Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full w-64 bg-gray-900 text-white z-40
        transform transition-transform duration-200
        hidden md:block
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center font-bold text-gray-900">C</div>
            <span className="font-semibold">ChurchGear</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{profile?.churches?.name || 'Admin'}</p>
        </div>

        <nav className="p-2">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium mb-1
                ${isActive 
                  ? 'bg-yellow-500 text-gray-900' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
          
          <a
            href="/loja"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium mb-1 text-gray-400 hover:bg-gray-800 hover:text-white mt-4"
          >
            <Store size={18} />
            Ver Loja
          </a>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm w-full"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-gray-900 text-white z-50
        transform transition-transform duration-200 md:hidden
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <span className="font-semibold">ChurchGear</span>
          <button onClick={() => setMobileOpen(false)}><X size={20} /></button>
        </div>
        <nav className="p-2">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium mb-1
                ${isActive ? 'bg-yellow-500 text-gray-900' : 'text-gray-400 hover:bg-gray-800'}
              `}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button className="md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu size={24} />
          </button>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">{profile?.name}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
