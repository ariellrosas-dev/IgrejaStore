import { create } from 'zustand'

export const useUIStore = create((set, get) => ({
  sidebarOpen: true,
  modalOpen: null,
  modalData: null,
  toasts: [],
  theme: 'light',

  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  openModal: (modalName, data = null) => {
    set({ modalOpen: modalName, modalData: data })
  },

  closeModal: () => {
    set({ modalOpen: null, modalData: null })
  },

  showToast: (message, type = 'info', duration = 3000) => {
    const id = Date.now()
    set(state => ({
      toasts: [...state.toasts, { id, message, type }]
    }))

    setTimeout(() => {
      set(state => ({
        toasts: state.toasts.filter(t => t.id !== id)
      }))
    }, duration)
  },

  success: (message) => get().showToast(message, 'success'),
  error: (message) => get().showToast(message, 'error'),
  warning: (message) => get().showToast(message, 'warning'),
  info: (message) => get().showToast(message, 'info'),

  setTheme: (theme) => set({ theme }),
  
  toggleTheme: () => set(state => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),
}))
