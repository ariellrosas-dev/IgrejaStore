export type Role = 'admin' | 'cashier' | 'leader' | 'viewer'
export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao_debito' | 'cartao_credito' | 'fiado'
export type PaymentStatus = 'pendente' | 'pago' | 'parcial' | 'cancelado'
export type CashFlowType = 'entrada' | 'saída'

export interface Church {
  id: string
  name: string
  address?: string
  phone?: string
  pix_key?: string
  city?: string
  default_payment_method: PaymentMethod
  low_stock_alert: number
  created_at: string
}

export interface Profile {
  id: string
  church_id: string
  name: string
  role: Role
  created_at: string
  churches?: Church
}

export interface ShirtModel {
  id: string
  church_id: string
  name: string
  description?: string
  price: number
  cost?: number
  color: string
  image_url?: string
  sizes: string[]
  active: boolean
  created_at: string
  updated_at: string
  inventory?: InventoryItem[]
}

export interface InventoryItem {
  id: string
  shirt_model_id: string
  size: string
  quantity: number
  updated_at: string
}

export interface Client {
  id: string
  church_id: string
  user_id?: string
  name: string
  email?: string
  phone?: string
  cpf?: string
  address?: string
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  shirt_model_id: string
  shirt_name: string
  size: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Order {
  id: string
  church_id: string
  client_id?: string
  leader_id?: string
  registered_by?: string
  buyer_name: string
  cpf?: string
  phone?: string
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  total: number
  amount_paid: number
  amount_due: number
  notes?: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
  profiles?: { name: string }
  clients?: Client
}

export interface CashFlowEntry {
  id: string
  church_id: string
  order_id?: string
  registered_by?: string
  date: string
  description: string
  type: CashFlowType
  category?: string
  method?: string
  amount: number
  created_at: string
}

export interface Leader {
  id: string
  church_id: string
  profile_id?: string
  name: string
  created_at: string
}
