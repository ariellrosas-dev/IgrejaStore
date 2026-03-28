import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    warning: <AlertTriangle className="text-yellow-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
  }

  const styles = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  }

  return (
    <div className={`
      fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 
      rounded-lg border shadow-lg ${styles[type]}
      animate-slide-in
    `}>
      {icons[type]}
      <p className="text-sm font-medium text-surface-800">{message}</p>
      <button 
        onClick={onClose}
        className="ml-2 p-1 rounded hover:bg-surface-200/50 transition-colors"
      >
        <X size={16} className="text-surface-500" />
      </button>
    </div>
  )
}

export function Toaster({ toasts = [], onRemove }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  )
}
