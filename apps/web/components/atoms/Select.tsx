import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error = false, className = '', children, ...props }, ref) => (
    <select
      ref={ref}
      className={`
        w-full rounded-lg border px-3 py-2 text-sm
        text-zinc-900 bg-white
        outline-none transition-colors
        ${error
          ? 'border-red-400 focus:ring-2 focus:ring-red-400 focus:border-transparent'
          : 'border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-transparent'
        }
        disabled:bg-zinc-50 disabled:text-zinc-400 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
  ),
)
Select.displayName = 'Select'
