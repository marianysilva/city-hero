import { ReactNode } from 'react'

type ModalSize = 'sm' | 'md' | 'lg'

interface ModalProps {
  title: string
  onClose: () => void
  size?: ModalSize
  children: ReactNode
}

const SIZES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export function Modal({ title, onClose, size = 'md', children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`
          relative bg-white rounded-2xl shadow-xl
          w-full ${SIZES[size]} mx-4 p-6 space-y-5
        `}
        role="dialog"
        aria-modal
        aria-labelledby="modal-title"
      >
        <h2 id="modal-title" className="text-lg font-semibold text-zinc-900">
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}
