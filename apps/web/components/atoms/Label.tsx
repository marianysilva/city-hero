import { LabelHTMLAttributes, ReactNode } from 'react'

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode
  required?: boolean
}

export function Label({ children, required = false, className = '', ...props }: LabelProps) {
  return (
    <label
      className={`block text-sm font-medium text-zinc-700 ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-0.5" aria-hidden>*</span>}
    </label>
  )
}
