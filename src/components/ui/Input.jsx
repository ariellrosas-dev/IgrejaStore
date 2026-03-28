import { forwardRef } from 'react'

export const Input = forwardRef(({ 
  label, 
  error, 
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-surface-700 mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-3 py-2 rounded-lg border transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
            : 'border-surface-300 focus:border-surface-500 focus:ring-surface-200'
          }
          bg-white text-surface-900 placeholder-surface-400
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export const Select = forwardRef(({ 
  label, 
  error, 
  options = [],
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-surface-700 mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={`
          w-full px-3 py-2 rounded-lg border transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
            : 'border-surface-300 focus:border-surface-500 focus:ring-surface-200'
          }
          bg-white text-surface-900
          ${className}
        `}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'
