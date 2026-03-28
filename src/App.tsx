import { Toaster } from 'react-hot-toast'
import { Router } from './router'
import { initTheme } from './store/uiStore'
import { useEffect } from 'react'

export default function App() {
  useEffect(() => {
    initTheme()
  }, [])

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '8px',
          },
        }}
      />
      <Router />
    </>
  )
}
