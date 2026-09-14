import { useEffect, useRef } from 'react'

/**
 * Modal confirmation. Closes on Esc; focus moves to Cancel on open.
 * Cancel changes nothing and writes nothing to the log.
 */
export function ConfirmDialog({
  text,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  text: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
}) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Подтверждение действия"
        className="w-[min(92vw,26rem)] rounded-lg p-5"
        style={{ background: 'var(--surface)', border: '1px solid var(--ring)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-5 text-sm leading-relaxed" style={{ color: 'var(--ink-2)' }}>
          {text}
        </p>
        <div className="flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="rounded-md px-3 py-1.5 text-sm"
            style={{ border: '1px solid var(--line)', color: 'var(--ink-2)' }}
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md px-3 py-1.5 text-sm font-medium"
            style={{ background: 'var(--risk-critical)', color: 'var(--ink)' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
