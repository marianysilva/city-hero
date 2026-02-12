import { ReactNode } from 'react'

export type BadgeVariant = 'default' | 'red' | 'purple' | 'blue' | 'orange' | 'green' | 'gray'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
  title?: string
}

const VARIANTS: Record<BadgeVariant, string> = {
  default: 'bg-zinc-100 text-zinc-700',
  red: 'bg-red-100 text-red-700',
  purple: 'bg-purple-100 text-purple-700',
  blue: 'bg-blue-100 text-blue-700',
  orange: 'bg-orange-100 text-orange-700',
  green: 'bg-green-100 text-green-700',
  gray: 'bg-zinc-100 text-zinc-500',
}

export function Badge({ variant = 'default', children, className = '', title }: BadgeProps) {
  return (
    <span
      title={title}
      className={`
        inline-flex items-center gap-1 px-2 py-0.5
        rounded text-xs font-medium
        ${VARIANTS[variant]} ${className}
      `}
    >
      {children}
    </span>
  )
}
