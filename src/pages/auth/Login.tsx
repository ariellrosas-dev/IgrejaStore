import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { authSchema } from '../../lib/schemas'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, loading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(authSchema)
  })

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      await signIn(data.email, data.password)
      navigate('/')
    } catch (err: any) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ChurchGear</h1>
          <p className="text-gray-500 mt-1">Sistema de Vendas de Camisas</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            error={errors.email?.message as string}
            {...register('email')}
          />

          <div className="relative">
            <Input
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.password?.message as string}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            <LogIn size={18} />
            Entrar
          </Button>
        </form>
      </div>
    </div>
  )
}
