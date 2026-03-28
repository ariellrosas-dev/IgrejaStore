import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  theme: 'light',

  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => {
    set({ theme })
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('churchgear-theme', theme)
  },
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light'
    get().setTheme(newTheme)
  },
}))

export const initTheme = () => {
  const saved = localStorage.getItem('churchgear-theme') as 'light' | 'dark' | null
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme = saved || (prefersDark ? 'dark' : 'light')
  useUIStore.getState().setTheme(theme)
}
