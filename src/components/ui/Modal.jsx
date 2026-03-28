import { X } from 'lucide-react'

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />
        
        <div className={`
          relative bg-white rounded-xl shadow-xl w-full ${sizes[size]}
          transform transition-all duration-200
        `}>
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
              <h3 className="text-lg font-semibold text-surface-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          )}
          
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
