import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ShirtModel } from '../types/models'

interface CartItem {
  shirtModelId: string
  shirtName: string
  size: string
  quantity: number
  unitPrice: number
  color: string
  imageUrl?: string
}

interface CartState {
  items: CartItem[]
  addItem: (model: ShirtModel, size: string) => void
  removeItem: (shirtModelId: string, size: string) => void
  updateQuantity: (shirtModelId: string, size: string, quantity: number) => void
  clear: () => void
  total: () => number
  itemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (model, size) => {
        const existing = get().items.find(
          i => i.shirtModelId === model.id && i.size === size
        )
        if (existing) {
          set({
            items: get().items.map(i =>
              i.shirtModelId === model.id && i.size === size
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          })
        } else {
          set({
            items: [
              ...get().items,
              {
                shirtModelId: model.id,
                shirtName: model.name,
                size,
                quantity: 1,
                unitPrice: model.price,
                color: model.color,
                imageUrl: model.image_url,
              },
            ],
          })
        }
      },

      removeItem: (shirtModelId, size) =>
        set({
          items: get().items.filter(
            i => !(i.shirtModelId === shirtModelId && i.size === size)
          ),
        }),

      updateQuantity: (shirtModelId, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(shirtModelId, size)
          return
        }
        set({
          items: get().items.map(i =>
            i.shirtModelId === shirtModelId && i.size === size ? { ...i, quantity } : i
          ),
        })
      },

      clear: () => set({ items: [] }),
      total: () => get().items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0),
      itemCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
    }),
    { name: 'churchgear-cart' }
  )
)
