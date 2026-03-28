export const maskCPF = (v: string) => {
  const nums = v.replace(/\D/g, '').slice(0, 11)
  if (nums.length <= 11) {
    return nums
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }
  return v
}

export const maskPhone = (v: string) => {
  const nums = v.replace(/\D/g, '').slice(0, 11)
  if (nums.length <= 10) {
    return nums.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2')
  }
  return nums.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2')
}

export const maskMoney = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export const maskDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

export const maskDateTime = (date: string | Date) => {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const validateCPF = (cpf: string): boolean => {
  const n = cpf.replace(/\D/g, '')
  if (n.length !== 11 || /^(\d)\1+$/.test(n)) return false
  
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(n[i]) * (10 - i)
  let r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  if (r !== parseInt(n[9])) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(n[i]) * (11 - i)
  r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  return r === parseInt(n[10])
}

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const formatCurrency = (value: number) => maskMoney(value)
export const formatDate = (date: string | Date) => maskDate(date)
export const formatDateTime = (date: string | Date) => maskDateTime(date)

export const generateId = () => crypto.randomUUID()

export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const truncate = (str: string, length = 50) => {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export const paymentMethodLabels: Record<string, string> = {
  pix: 'PIX',
  dinheiro: 'Dinheiro',
  cartao_debito: 'Cartão Débito',
  cartao_credito: 'Cartão Crédito',
  fiado: 'Fiado',
}

export const paymentStatusLabels: Record<string, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  parcial: 'Parcial',
  cancelado: 'Cancelado',
}

export const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  cashier: 'Caixa',
  leader: 'Líder',
  viewer: 'Visualizador',
}

export const ROLE_HIERARCHY: Record<string, number> = {
  admin: 4,
  cashier: 3,
  leader: 2,
  viewer: 1,
}
