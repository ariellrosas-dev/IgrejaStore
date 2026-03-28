import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId } from '../lib/utils'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      client: null,

      addItem: (model, size, quantity = 1) => {
        const existingIndex = get().items.findIndex(
          item => item.modelId === model.id && item.size === size
        )

        if (existingIndex >= 0) {
          set(state => {
            const newItems = [...state.items]
            newItems[existingIndex].quantity += quantity
            newItems[existingIndex].subtotal = 
              newItems[existingIndex].quantity * newItems[existingIndex].unitPrice
            return { items: newItems }
          })
        } else {
          set(state => ({
            items: [...state.items, {
              id: generateId(),
              modelId: model.id,
              modelName: model.name,
              color: model.color,
              size,
              quantity,
              unitPrice: model.price,
              subtotal: model.price * quantity,
            }]
          }))
        }
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          set(state => ({
            items: state.items.filter(item => item.id !== itemId)
          }))
        } else {
          set(state => ({
            items: state.items.map(item => 
              item.id === itemId 
                ? { ...item, quantity, subtotal: item.unitPrice * quantity }
                : item
            )
          }))
        }
      },

      removeItem: (itemId) => {
        set(state => ({
          items: state.items.filter(item => item.id !== itemId)
        }))
      },

      clearCart: () => {
        set({ items: [], client: null })
      },

      setClient: (client) => {
        set({ client })
      },

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.subtotal, 0)
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      getOrderData: () => {
        const { items, client } = get()
        const total = items.reduce((sum, item) => sum + item.subtotal, 0)
        
        return {
          items: items.map(item => ({
            shirt_model_id: item.modelId,
            shirt_name: item.modelName,
            size: item.size,
            quantity: item.quantity,
            unit_price: item.unitPrice,
          })),
          buyer_name: client?.name || 'Cliente',
          cpf: client?.cpf || '',
          phone: client?.phone || '',
          total,
        }
      },
    }),
    {
      name: 'churchgear-cart',
    }
  )
)
