'use client'

import { useState, useRef, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  label: string
  children: ReactNode
}

interface Coords {
  x: number
  y: number
}

export function Tooltip({ label, children }: TooltipProps) {
  const [coords, setCoords] = useState<Coords | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // hide must be declared before show because show's dependency array
  // evaluates [hide] immediately — referencing a const before its
  // declaration causes a Temporal Dead Zone ReferenceError.
  const hide = useCallback(() => setCoords(null), [])

  const show = useCallback(() => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    setCoords({ x: r.left + r.width / 2, y: r.top })
    window.addEventListener('scroll', hide, { passive: true, once: true })
  }, [hide])

  return (
    <div
      ref={ref}
      className="inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {coords &&
        createPortal(
          <span
            style={{
              position: 'fixed',
              left: coords.x,
              top: coords.y,
              transform: 'translateX(-50%) translateY(calc(-100% - 6px))',
            }}
            className="px-2 py-1 text-xs font-medium bg-zinc-800 text-white rounded-md whitespace-nowrap pointer-events-none z-[9999]"
          >
            {label}
          </span>,
          document.body,
        )}
    </div>
  )
}
