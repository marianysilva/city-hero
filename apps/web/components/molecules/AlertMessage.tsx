import { ReactNode } from 'react'

export type AlertVariant = 'error' | 'success' | 'info'

interface AlertMessageProps {
  variant?: AlertVariant
  children: ReactNode
}

const VARIANTS: Record<AlertVariant, string> = {
  error: 'bg-red-50 text-red-600',
  success: 'bg-green-50 text-green-700',
  info: 'bg-blue-50 text-blue-700',
}

export function AlertMessage({ variant = 'error', children }: AlertMessageProps) {
  return (
    <p
      role={variant === 'error' ? 'alert' : undefined}
      className={`text-sm px-3 py-2 rounded-lg ${VARIANTS[variant]}`}
    >
      {children}
    </p>
  )
}
