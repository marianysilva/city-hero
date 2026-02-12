import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`
        w-full rounded-lg border px-3 py-2 text-sm
        text-zinc-900 placeholder:text-zinc-400 bg-white
        outline-none transition-colors
        ${error
          ? 'border-red-400 focus:ring-2 focus:ring-red-400 focus:border-transparent'
          : 'border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-transparent'
        }
        disabled:bg-zinc-50 disabled:text-zinc-400 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
