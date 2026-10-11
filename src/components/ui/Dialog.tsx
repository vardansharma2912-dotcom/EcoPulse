import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  description,
  children,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement | null
      if (!dialog.open) {
        dialog.showModal()
      }
    } else {
      if (dialog.open) {
        dialog.close()
      }
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus()
      }
    }
  }, [open])

  // Handle native cancel event (pressing Escape)
  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault()
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={handleCancel}
      className="m-auto rounded-2xl glass-strong text-[#14301f] border border-white/80 p-0 shadow-2xl backdrop:bg-emerald-950/35 backdrop:backdrop-blur-sm max-w-lg w-[calc(100%-2rem)] focus:outline-none"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#14301f] tracking-tight">{title}</h2>
            {description && <p className="text-xs text-[#1e3f2b] mt-1 leading-relaxed font-medium">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-700 hover:text-emerald-950 hover:bg-emerald-900/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-2 text-[#14301f]">{children}</div>
      </div>
    </dialog>
  )
}
