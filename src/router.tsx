import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuthStore } from './store/authStore'
import { FullPageSkeleton } from './components/ui/Skeleton'
import { useEffect } from 'react'

const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const Orders = lazy(() => import('./pages/admin/Orders'))
const Inventory = lazy(() => import('./pages/admin/Inventory'))
const Clients = lazy(() => import('./pages/admin/Clients'))
const CashFlow = lazy(() => import('./pages/admin/CashFlow'))
const Reports = lazy(() => import('./pages/admin/Reports'))
const Settings = lazy(() => import('./pages/admin/Settings'))
const Catalog = lazy(() => import('./pages/store/Catalog'))
const Cart = lazy(() => import('./pages/store/Cart'))
const Login = lazy(() => import('./pages/auth/Login'))

const AdminLayout = lazy(() => import('./components/layout/AdminLayout'))
const StoreLayout = lazy(() => import('./components/layout/StoreLayout'))

function PageLoader() {
  return <div className="p-6"><FullPageSkeleton /></div>
}

export function Router() {
  const { initialize, loading } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])

  if (loading) {
    return <FullPageSkeleton />
  }

  const router = createBrowserRouter([
    {
      path: '/login',
      element: <Suspense fallback={<PageLoader />}><Login /></Suspense>,
    },
    {
      path: '/',
      element: <Suspense fallback={<PageLoader />}><AdminLayout><Dashboard /></AdminLayout></Suspense>,
    },
    {
      path: '/pedidos',
      element: <Suspense fallback={<PageLoader />}><AdminLayout><Orders /></AdminLayout></Suspense>,
    },
    {
      path: '/estoque',
      element: <Suspense fallback={<PageLoader />}><AdminLayout><Inventory /></AdminLayout></Suspense>,
    },
    {
      path: '/clientes',
      element: <Suspense fallback={<PageLoader />}><AdminLayout><Clients /></AdminLayout></Suspense>,
    },
    {
      path: '/caixa',
      element: <Suspense fallback={<PageLoader />}><AdminLayout><CashFlow /></AdminLayout></Suspense>,
    },
    {
      path: '/relatorios',
      element: <Suspense fallback={<PageLoader />}><AdminLayout><Reports /></AdminLayout></Suspense>,
    },
    {
      path: '/ajustes',
      element: <Suspense fallback={<PageLoader />}><AdminLayout><Settings /></AdminLayout></Suspense>,
    },
    {
      path: '/loja',
      element: <Suspense fallback={<PageLoader />}><StoreLayout><Catalog /></StoreLayout></Suspense>,
    },
    {
      path: '/loja/carrinho',
      element: <Suspense fallback={<PageLoader />}><StoreLayout><Cart /></StoreLayout></Suspense>,
    },
  ])

  return <RouterProvider router={router} />
}
