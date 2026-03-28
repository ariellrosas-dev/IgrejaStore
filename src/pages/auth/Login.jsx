import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { authSchema } from '../../lib/schemas'
import { isConfigured } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, user, loading: authLoading, error } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(authSchema)
  })

  const from = location.state?.from?.pathname || '/'

  if (!isConfigured()) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-surface-900 mb-4">Configuração Necessária</h1>
          <p className="text-surface-600 mb-6">
            Configure as variáveis de ambiente do Supabase para continuar.
          </p>
          <div className="text-left bg-surface-100 rounded-lg p-4 text-sm font-mono">
            <p className="text-surface-500 mb-2">Crie o arquivo .env.local com:</p>
            <code className="text-green-600">
              VITE_SUPABASE_URL=https://seu-projeto.supabase.co<br />
              VITE_SUPABASE_ANON_KEY=sua-chave-aqui
            </code>
          </div>
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to={from} replace />
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)
      await signIn(data.email, data.password)
      navigate(from, { replace: true })
    } catch (err) {
      console.error('Login error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-surface-900">ChurchGear</h1>
          <p className="text-surface-500 mt-1">Sistema de Vendas de Camisas</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="relative">
            <Input
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-surface-400 hover:text-surface-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            loading={submitting}
          >
            <LogIn size={18} />
            Entrar
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-surface-200 text-center">
          <p className="text-sm text-surface-500">
            Novo aqui? <a href="#" className="text-primary-600 hover:underline">Cadastre-se</a>
          </p>
        </div>
      </div>
    </div>
  )
}
