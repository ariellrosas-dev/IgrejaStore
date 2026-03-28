export function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const variants = {
    default: 'bg-surface-100 text-surface-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  return (
    <span className={`
      inline-flex items-center font-medium rounded-full
      ${variants[variant]} ${sizes[size]} ${className}
    `}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }) {
  const variants = {
    pendente: 'warning',
    pago: 'success',
    parcial: 'info',
    cancelado: 'error',
    ativo: 'success',
    inativo: 'default',
  }

  return (
    <Badge variant={variants[status] || 'default'}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </Badge>
  )
}
