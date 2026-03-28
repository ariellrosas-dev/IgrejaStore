import { z } from 'zod'

export const orderSchema = z.object({
  buyerName: z.string().min(3, 'Mínimo 3 caracteres'),
  cpf: z.string().optional().or(z.literal('')),
  phone: z.string().optional(),
  paymentMethod: z.enum(['pix', 'dinheiro', 'cartao_debito', 'cartao_credito', 'fiado']),
  amountPaid: z.number().min(0),
  notes: z.string().max(500).optional(),
  leaderId: z.string().uuid().optional(),
  items: z.array(z.object({
    shirtModelId: z.string().uuid(),
    shirtName: z.string(),
    size: z.string().min(1),
    quantity: z.number().int().min(1).max(99),
    unitPrice: z.number().min(0.01),
  })).min(1, 'Adicione ao menos 1 item ao pedido'),
})

export const shirtModelSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  description: z.string().max(300).optional(),
  price: z.number().min(0.01, 'Preço inválido'),
  cost: z.number().min(0).optional(),
  color: z.string().min(1, 'Cor obrigatória'),
  sizes: z.array(z.string()).min(1, 'Selecione ao menos um tamanho'),
})

export const clientSchema = z.object({
  name: z.string().min(3, 'Nome obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  address: z.string().max(200).optional(),
})

export const cashFlowSchema = z.object({
  date: z.string(),
  description: z.string().min(3),
  type: z.enum(['entrada', 'saída']),
  category: z.string().optional(),
  method: z.string().optional(),
  amount: z.number().min(0.01, 'Valor inválido'),
})

export const settingsSchema = z.object({
  name: z.string().min(2),
  address: z.string().optional(),
  phone: z.string().optional(),
  pixKey: z.string().optional(),
  city: z.string().optional(),
  defaultPaymentMethod: z.enum(['pix', 'dinheiro', 'cartao_debito', 'cartao_credito', 'fiado']),
  lowStockAlert: z.number().int().min(0),
})

export const authSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
})

export type OrderFormData = z.infer<typeof orderSchema>
export type ShirtModelFormData = z.infer<typeof shirtModelSchema>
export type ClientFormData = z.infer<typeof clientSchema>
export type CashFlowFormData = z.infer<typeof cashFlowSchema>
export type SettingsFormData = z.infer<typeof settingsSchema>
export type AuthFormData = z.infer<typeof authSchema>
