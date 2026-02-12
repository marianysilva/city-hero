import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { Badge } from '@/components/atoms/Badge'

interface StatusBadgeProps {
  active: boolean
}

export function StatusBadge({ active }: StatusBadgeProps) {
  if (active) {
    return (
      <Badge variant="green">
        <CheckCircleIcon className="w-3.5 h-3.5" /> Ativo
      </Badge>
    )
  }
  return (
    <Badge variant="gray">
      <XCircleIcon className="w-3.5 h-3.5" /> Inativo
    </Badge>
  )
}
