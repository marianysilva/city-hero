import type { ReactNode } from 'react'
import { Button } from '@/components/atoms/Button'
import { AlertMessage } from '@/components/molecules/AlertMessage'
import { Modal } from '@/components/organisms/Modal'
import type { ButtonVariant } from '@/components/atoms/Button'

interface ConfirmDialogProps {
  title: string
  description: ReactNode
  confirmLabel: string
  confirmVariant?: ButtonVariant
  loading?: boolean
  error?: string | null
  onClose: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  confirmVariant = 'danger',
  loading = false,
  error = null,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-zinc-600">{description}</p>
        {error && <AlertMessage variant="error">{error}</AlertMessage>}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" variant={confirmVariant} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
